const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const CHROME_PATH = '/usr/bin/chromium-browser';
const DATA_FILE = path.join(__dirname, 'accounts.json');

const ACCOUNTS = [
    { id: 'MS4wLjABAAAAYLVzofvsSh9Whf4VPeVXU6HB8oG1vW1hnCk7z1lJbyM', cardIndex: 0 },
    { id: 'MS4wLjABAAAA73ORY7cD2_bw5dkwqXFxtQxbY7fuAdoYS1Palc8yX_Sh7zpJcKJ8wY904uqc0eoL', cardIndex: 1 }
];

// ✅ 全局变量，存 cookie
let COOKIES = {
    sessionid: '50a693c983f09fed963302d561fd3f75',
    ssid: '1.0.0-KDM4MGY0MWE5MzA5ZWNlMWJkMDcwMzcxY2FmNTJhMDA3MDNkZmE4YTcKCRCe-ZDRBhjvMRoCbGYiIDUwYTY5M2M5ODNmMDlmZWQ5NjMzMDJkNTYxZmQzZjc1'
};

// 初始化空文件
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

async function fetchDouyinData(userId) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36');

        // ✅ 管理接口：更新 cookie（只允许内网访问）
        app.post('/api/update-cookie', (req, res) => {
            const { sessionid, ssid } = req.body;
            if (sessionid) COOKIES.sessionid = sessionid;
            if (ssid) COOKIES.ssid = ssid;
            console.log('✅ Cookie 已更新');
            res.json({ success: true });
        });

        // ✅ 查看当前 cookie
        app.get('/api/cookie', (req, res) => {
            res.json(COOKIES);
        });

        await page.setCookie({
            name: 'sessionid',
            value: COOKIES.sessionid,
            domain: '.douyin.com'
        });
        await page.setCookie({
            name: 'ssid',
            value: COOKIES.ssid,
            domain: '.douyin.com'
        });

        await page.goto(`https://www.douyin.com/user/${userId}`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await page.waitForSelector('.fVTgfEro', { timeout: 10000 });

        const fans = await page.evaluate(() => {
            const allDivs = document.querySelectorAll('div');
            for (let i = 0; i < allDivs.length - 1; i++) {
                if (allDivs[i].textContent === '粉丝' && allDivs[i + 1].textContent.match(/^\d+$/)) {
                    return allDivs[i + 1].textContent.trim();
                }
            }
            return '--';
        });

        const likes = await page.evaluate(() => {
            const allDivs = document.querySelectorAll('div');
            for (let i = 0; i < allDivs.length - 1; i++) {
                if (allDivs[i].textContent === '获赞' && allDivs[i + 1].textContent.match(/^\d+$/)) {
                    return allDivs[i + 1].textContent.trim();
                }
            }
            return '--';
        });

        await browser.close();
        return { fans, likes };
    } catch (err) {
        console.error('❌ 获取失败:', err.message);
        if (browser) await browser.close();
        return null;
    }
}

// 抓取所有账号，写入文件
async function refreshAllData() {
    console.log('🔄 开始刷新数据...');
    const result = {};

    for (const acc of ACCOUNTS) {
        const data = await fetchDouyinData(acc.id);
        if (data) {
            result[acc.id] = {
                fans: data.fans,
                likes: data.likes,
                updatedAt: new Date().toISOString()
            };
        }
        // 每个账号之间等10秒，避免封
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(result, null, 2));
    console.log('✅ 数据已更新:', DATA_FILE);
}

// 定时任务：每2小时执行一次
cron.schedule('0 */2 * * *', () => {
    refreshAllData();
});

// 启动时立即执行一次
refreshAllData();

// 前端读取接口
app.get('/api/douyin/accounts', (req, res) => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ 代理运行: http://localhost:${PORT}`);
});

