const express = require('express');
const puppeteer = require('puppeteer-core');
const cors = require('cors');

const app = express();
app.use(cors());

const config = require('../config/node_conf.json');
//const CHROME_PATH = '/usr/bin/chromium-browser';

// ✅ 全局变量，存 cookie
let COOKIES = {
    sessionid: '50a693c983f09fed963302d561fd3f75',
    ssid: '1.0.0-KDM4MGY0MWE5MzA5ZWNlMWJkMDcwMzcxY2FmNTJhMDA3MDNkZmE4YTcKCRCe-ZDRBhjvMRoCbGYiIDUwYTY5M2M5ODNmMDlmZWQ5NjMzMDJkNTYxZmQzZjc1'
};

app.get('/api/douyin/:userId', async (req, res) => {
    const { userId } = req.params;
    const url = `https://www.douyin.com/user/${userId}`;

    console.log(`📡 正在获取: ${url}`);

    let browser = null;

    try {
        browser = await puppeteer.launch({
            executablePath: process.env.CHROME_PATH || config.chrome_path,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        // 模拟真实请求      
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

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

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForSelector('.fVTgfEro', { timeout: 10000 });



        // ✅ 提取粉丝数
        const fans = await page.evaluate(() => {
            const allDivs = document.querySelectorAll('div');
            for (let i = 0; i < allDivs.length - 1; i++) {
                if (allDivs[i].textContent === '粉丝' && allDivs[i + 1].textContent.match(/^\d+$/)) {
                    return allDivs[i + 1].textContent.trim();
                }
            }
            return '--';
        });
        // ✅ 提取获赞数
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

        console.log(`✅ 粉丝: ${fans}, 获赞: ${likes}`);

        res.json({
            success: true,
            data: { fans, likes }
        });

    } catch (err) {
        console.error('❌ 获取失败:', err.message);
        if (browser) await browser.close();
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(config.port, () => {
    console.log(`✅ 代理运行: http://${config.host}:${config.port}`);
});
