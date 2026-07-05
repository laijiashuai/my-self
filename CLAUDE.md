# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

赖嘉帅的个人作品集网站，包含个人简历展示、招聘信息收集、抖音数据展示、以及 Shuyran 电商平台设计方案展示。纯前端静态页面 + PHP/Node.js 双后端。

## 常用命令

### PHP 后端（招聘表单 + 邮件服务）

```bash
# 安装 PHP 依赖（在 server/ 目录下）
cd server && composer install

# 本地开发（需 PHP 内置服务器）
php -S localhost:8080 -t server/
```

PHP API 端点：
- `server/api/recruitment.php` — 招聘信息入库
- `server/api/check_phone.php` — 手机号查重
- `server/api/hire_email.php` — PHPMailer 发送邮件通知
- `server/api/get_apiconf.php` — 向前端暴露 Node.js 服务的 host/port

### Node.js 后端（抖音数据爬取）

```bash
# 安装 Node 依赖
cd server/npm && npm install

# 手动模式 — 按需爬取单个用户
node douyin_server.js

# 定时模式 — 每 2 小时自动爬取并落盘 JSON
node auto_douyin.js
```

### 前端

纯静态 HTML/CSS/JS，无构建流程。直接在浏览器打开 `client/index.html`，或通过任意 HTTP 服务器托管 `client/` 目录即可。

## 架构要点

### 前后端通信链路

```
client/js/config.js  →  GET /server/api/get_apiconf.php  →  获取 {host, port}
                              ↓
client/js/mylife.js   →  GET http://{host}:{port}/api/douyin/accounts  →  Node.js Express
```

`ConfigManager`（[client/js/config.js](client/js/config.js)）是前端唯一的配置加载入口，使用 IIFE 模块模式缓存配置、防止重复请求。

### 招聘表单三段式提交

[client/js/recruitment.js](client/js/recruitment.js) 中的提交流程严格按序执行：

1. `POST check_phone.php` — 手机号查重
2. `POST recruitment.php` — 数据入库（phone 字段有 UNIQUE 约束）
3. `POST hire_email.php` — 发送 HTML 邮件通知

只有步骤 2 成功后才会触发步骤 3，避免无效邮件。

### 抖音数据双模式

- **手动模式**（`douyin_server.js`）：接收请求后启动 Puppeteer 实时爬取
- **定时模式**（`auto_douyin.js`）：通过 `node-cron` 每 2 小时自动爬取，结果写入 `server/config/accounts.json`，前端直接读静态 JSON

两个脚本共享相同的 cookie（硬编码在脚本中），`/api/update-cookie` 端点支持运行时更新。

### 配置管理

- `server/config/database.php` — MySQL 连接信息（硬编码，返回数组供 PHP require）
- `server/config/node_conf.json` — Node 服务监听 host/port + Chrome 路径
- `server/config/.env` — SMTP 凭据（`parse_ini_file` 读取，不进版本控制）
- `server/config/accounts.json` — 定时爬虫的输出文件，前端通过 API 读取

### 页面结构

| 页面 | 入口 | 依赖后端 |
|------|------|----------|
| 首页 | `index.html` | 无 |
| 简历 | `myself.html` + `myself.js` | 无（纯静态） |
| 招聘 | `recruitment.html` + `recruitment.js` | PHP × 3 |
| 生活 | `mylife.html` + `mylife.js` | Node.js |
| 项目简介 | `WebIntroduction.html` | 无 |
| 电商方案 | `design-showcase.html` + `design-showcase.js` | 无 |

## 技术栈

- 前端：原生 HTML/CSS/JS（无框架）
- PHP 8.0 + Composer（PHPMailer 7.1）
- Node.js 20 + Express 5 + Puppeteer（Chromium 无头浏览器）
- MySQL 8.0（`myself` 数据库，`recruitment_info` 表）
- 部署：pm2 守护 Node 进程，Nginx 托管静态资源 + PHP 反向代理
