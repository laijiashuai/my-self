const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const config = require('../config/node_conf.json');
const DATA_FILE = path.join(__dirname, '../config/accounts.json');

// ✅ 路由定义放在外面
app.post('/api/update-cookie', (req, res) => {
    const { sessionid, ssid } = req.body;
    if (sessionid) COOKIES.sessionid = sessionid;
    if (ssid) COOKIES.ssid = ssid;
    console.log('✅ Cookie 已更新');
    res.json({ success: true });
});

app.get('/api/cookie', (req, res) => {
    res.json(COOKIES);
});

app.get('/api/douyin/accounts', (req, res) => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
});

const ACCOUNTS = [
    { id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM', cardIndex: 0 },
    { id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL', cardIndex: 1 }
];

let COOKIES = {
    sessionid: '50a693c983f09fed963302d561fd3f75',
    ssid: '1.0.0-KDM4MGY0MWE5MzA5ZWNlMWJkMDcwMzcxY2FmNTJhMDA3MDNkZmE4YTcKCRCe-ZDRBhjvMRoCbGYiIDUwYTY5M2M5ODNmMDlmZWQ5NjMzMDJkNTYxZmQzZjc1'
};

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

async function fetchDouyinData(userId) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.CHROME_PATH || config.chrome_path,
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
		'--lang=zh-CN',  // ✅ 强制中文
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36');

        //await page.setCookie({ name: 'sessionid', value: COOKIES.sessionid, domain: '.douyin.com' });
        //await page.setCookie({ name: 'ssid', value: COOKIES.ssid, domain: '.douyin.com' });

        await page.goto(`https://www.douyin.com/user/${userId}`, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // ✅ 截图调试
	//await page.screenshot({ path: `debug_${userId}.png` });

        // ✅ 不等动态类名，直接等内容出现
        await page.waitForFunction(() => {
            const divs = document.querySelectorAll('div');
            for (let i = 0; i < divs.length - 1; i++) {
                if (divs[i].textContent.includes('粉丝') && /^\d+[万]?$/.test(divs[i + 1].textContent)) {
                    return true;
                }
            }
            return false;
        }, { timeout: 30000 });

        const fans = await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for (let i = 0; i < divs.length - 1; i++) {
                if (divs[i].textContent.includes('粉丝') && /^\d+[万]?$/.test(divs[i + 1].textContent)) {
                    return divs[i + 1].textContent.trim();
                }
            }
            return '--';
        });

        const likes = await page.evaluate(() => {
            const divs = document.querySelectorAll('div');
            for (let i = 0; i < divs.length - 1; i++) {
                if (divs[i].textContent.includes('获赞') && /^\d+[万]?$/.test(divs[i + 1].textContent)) {
                    return divs[i + 1].textContent.trim();
                }
            }
            return '--';
        });

        await browser.close();
        console.log(`✅ ${userId}: 粉丝=${fans}, 获赞=${likes}`);
        return { fans, likes };

    } catch (err) {
        console.error(`❌ ${userId} 获取失败:`, err.message);
        if (browser) await browser.close();
        return null;
    }
}

// ✅ 修改后：只更新成功的数据
async function refreshAllData() {
    console.log('🔄 开始刷新数据...');
    let result = {};
    if (fs.existsSync(DATA_FILE)) {
        result = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    let successCount = 0;

    for (const acc of ACCOUNTS) {
        const data = await fetchDouyinData(acc.id);
        if (data) {
            result[acc.id] = {
                fans: data.fans,
                likes: data.likes,
                updatedAt: new Date().toISOString()
            };
            successCount++;
            console.log(`✅ ${acc.id} 获取成功`);
        } else {
            console.log(`❌ ${acc.id} 获取失败，不更新`);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // ✅ 只有有成功数据才写入文件
    if (successCount > 0) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(result, null, 2));
        console.log(`✅ 已更新 ${successCount}/${ACCOUNTS.length} 条数据: ${DATA_FILE}`);
    } else {
        console.log('⚠️ 全部失败，未更新文件');
    }
}

cron.schedule('0 */2 * * *', () => {
    refreshAllData();
});

refreshAllData();

app.listen(config.port, () => {
    console.log(`✅ 代理运行: http://${config.host}:${config.port}/accounts`);
});
