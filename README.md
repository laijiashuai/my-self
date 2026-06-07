# 项目简介 / Project Overview

---

## 一、项目背景 / Introduction

本项目源于个人成长驱动，旨在系统性提升前端研发能力，并以全栈工程师为目标方向推进技术栈拓展。

项目全程独立完成，借助 AI 辅助工具（文心一言）提升开发效率，整体周期 5 天：
- 需求设计：1 天
- 技术实现：3 天
- 测试与修复：1 天

---

## 二、功能模块 / Features

| 模块 | 功能说明 |
|------|----------|
| 首页 | 三大功能入口：个人简历、招聘信息录入、生活展示 |
| 个人简历 | 头像展示；证书点击弹窗查看原件；专利链接跳转至官方查询平台 |
| 招聘信息 | 数据持久化至 MySQL；新增记录自动触发邮件通知 |
| 生活展示 | V1 接入抖音主页数据；后续版本持续迭代丰富内容 |
| 整体风格 | 统一视觉语言，确保跨页面一致性 |

---

## 三、技术架构 / Technical Design

| 模块 | 技术方案 |
|------|----------|
| 总体架构 | 前后端分离，低耦合高内聚；前端 HTML/CSS/JS 分离，资源集中管理；后端 PHP 遵循单一职责原则，配置独立管理，杜绝硬编码 |
| 首页 | 纯静态实现，无 JS 逻辑、无 PHP 调用，卡片导航至对应功能页 |
| 个人简历 | 静态页面 + JS 交互弹窗，按需展示证书图片 |
| 招聘信息 | JS 捕获事件 → 调用 PHP 接口；PHP 实现三段逻辑：按手机号查询 → 无重复则入库 → 触发邮件通知 |
| 邮件服务 | PHPMailer + 外部 SMTP 中继，规避云服务垃圾邮件拦截 |
| 生活展示 | 展示抖音粉丝数与获赞数；支持实时 / 定时双更新方案；Node.js 代理抓取主页并解析数据；定时模式下数据落盘本地，页面访问时直接读取 |

---
---

# Project Overview

---

## 1. Introduction

Driven by personal growth, this project aims to systematically enhance front-end development skills while progressing toward a full-stack engineering direction.

Completed independently with AI-assisted tooling (ERNIE Bot) over a 5-day cycle:
- Requirement Design: 1 day
- Technical Implementation: 3 days
- Testing & Bug Fixes: 1 day

---

## 2. Features

| Module | Description |
|--------|-------------|
| Homepage | Three entry points: Resume, Recruitment Info, Life Showcase |
| Resume | Avatar display; click certificate to view original in popup; patent links redirect to official query portal |
| Recruitment Info | Data persisted to MySQL; new entries automatically trigger email notification |
| Life Showcase | V1 integrates Douyin homepage data; future versions will progressively enrich content |
| Overall Style | Unified visual language ensuring cross-page consistency |

---

## 3. Technical Design

| Module | Solution |
|--------|----------|
| Overall Architecture | Front-end/back-end separation, low coupling & high cohesion; front-end HTML/CSS/JS separated with centralized asset management; back-end PHP follows single-responsibility principle, config files managed independently, no hardcoded constants |
| Homepage | Pure static implementation, no JS logic, no PHP calls; cards navigate to corresponding feature pages |
| Resume | Static page + JS interactive popup to display certificate images on demand |
| Recruitment Info | JS captures events → calls PHP API; PHP executes three-step logic: query by phone → insert if no duplicate → trigger email notification |
| Email Service | PHPMailer + external SMTP relay to avoid cloud spam filtering |
| Life Showcase | Displays Douyin follower count & like count; supports real-time / scheduled dual-update modes; Node.js proxy fetches and parses homepage data; scheduled data stored locally, read on page access |
