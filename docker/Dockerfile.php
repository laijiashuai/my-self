FROM php:8.2-fpm

# 系统依赖（Debian 版）
RUN apt-get update && apt-get install -y \
    git curl unzip bash \
    libzip-dev libonig-dev libicu-dev \
    libxml2-dev libfreetype-dev libjpeg-dev libpng-dev \
    chromium chromium-driver \
    ca-certificates fonts-liberation \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Chromium 路径
RUN ln -sf /usr/bin/chromium /usr/bin/google-chrome && \
    ln -sf /usr/bin/chromium-driver /usr/bin/chromedriver

# PHP 扩展
RUN docker-php-ext-install -j$(nproc) \
    pdo pdo_mysql zip mbstring exif intl opcache

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Node.js + npm（Debian 仓库自带）
RUN apt-get update && apt-get install -y \
    nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# PM2
RUN npm install -g pm2

# 工作目录
WORKDIR /var/www/my-self

# COPY entrypoint.sh
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# COPY 依赖文件
COPY server/composer.json server/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY server/npm/package.json server/npm/package-lock.json ./npm/
RUN cd npm && npm ci --production

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]
