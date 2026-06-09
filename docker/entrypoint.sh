#!/bin/sh
set -e

echo "========== 0. 等待 MySQL 启动 =========="
until nc -z mysql 3306; do
  echo "等待 MySQL 启动..."
  sleep 2
done
echo "MySQL 已就绪"

echo "========== 1. 用 PM2 启动爬虫服务 =========="
cd /var/www/my-self/npm
pm2 start auto_douyin.js --name "douyin-crawler"

echo "========== 2. 启动 PHP-FPM =========="
php-fpm --nodaemonize
