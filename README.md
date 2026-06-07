# 项目简介 / Project Overview

---

## 一、简介 / Introduction

> 本项目以个人成长为目标，核心目的是提升前端研发能力，并向全栈工程师方向发展。
> 全程由我独立完成，借助文心一言辅助，覆盖需求设计（1天）→ 技术实现（3天）→ 功能测试与问题修复（1天）。

---

## 二、项目功能 / Project Features

| 序号 | 模块 | 说明 |
|------|------|------|
| 1 | 首页 | 三个卡片：个人简历、招聘信息录入、生活展 |
| 2 | 个人简历 | 头像展示；点击证书弹窗查看图片；点击专利跳转官网查询入口 |
| 3 | 招聘信息 | 数据保存至数据库；新数据触发邮件通知 |
| 4 | 生活展 | V1 使用抖音主页数据；后续版本迭代加入更多元素 |
| 5 | 整体风格 | 统一设计，保持一致 |

---

## 三、技术设计 / Technical Design

| 序号 | 模块 | 方案 |
|------|------|------|
| 1 | 总体架构 | 前后端分离，低耦合高内聚；前端 HTML/CSS/JS 分离，媒体资源集中管理；后端 PHP 接口单一职责，配置文件独立存放，禁止硬编码静态常量 |
| 2 | 首页 | 纯静态页面，无 JS、无 PHP 调用，卡片跳转对应功能页 |
| 3 | 个人简历 | 静态页面 + JS 点击弹窗，展示证书图片 |
| 4 | 招聘信息 | JS 处理点击事件 → 调用 PHP 接口；PHP 提供三个接口：按电话查询，无重复则插入数据库并发送邮件 |
| 5 | 邮件功能 | PHPMailer + 外部 SMTP 中继，避免被云服务判定为垃圾邮件 |
| 6 | 生活展 | 展示抖音主页粉丝数与点赞数；支持实时更新 / 定时更新两种方案；Node.js 管理代理服务，抓取并解析抖音主页标签；定时更新数据存本地文件，访问时读取 |

---
---

# Project Overview

---

## 1. Introduction

> This project is driven by personal growth, with the core goal of improving front-end development skills and progressing toward a full-stack engineer.
> The entire project was completed independently by me, with assistance from ERNIE Bot, covering requirement design (1 day) → technical implementation (3 days) → functional testing and bug fixes (1 day).

---

## 2. Project Features

| # | Module | Description |
|---|--------|-------------|
| 1 | Homepage | Three cards: Resume, Recruitment Info Entry, Life Showcase |
| 2 | Resume | Avatar display; click certificate to view image in popup; click patent to redirect to official query portal |
| 3 | Recruitment Info | Data saved to database; new entries trigger email notification |
| 4 | Life Showcase | V1 uses Douyin (TikTok China) homepage data; future versions will include richer elements |
| 5 | Overall Style | Unified design, consistent across all pages |

---

## 3. Technical Design

| # | Module | Solution |
|---|--------|----------|
| 1 | Overall Architecture | Front-end/back-end separation, low coupling & high cohesion; front-end HTML/CSS/JS separated, media assets centrally managed; back-end PHP interfaces follow single-responsibility principle, config files stored separately, no hardcoded static constants |
| 2 | Homepage | Pure static page, no JS, no PHP calls; cards navigate to corresponding feature pages |
| 3 | Resume | Static page + JS click-to-popup for displaying certificate images |
| 4 | Recruitment Info | JS handles click events → calls PHP interface; PHP provides 3 APIs: query by phone number, insert if no duplicate exists, then send email notification |
| 5 | Email | PHPMailer + external SMTP relay to avoid being flagged as spam by cloud services |
| 6 | Life Showcase | Display Douyin follower count & like count; supports real-time update / scheduled update; Node.js manages proxy service to fetch and parse Douyin homepage tags; scheduled data stored in local files, read on page access |
