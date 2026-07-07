FROM php:8.3-fpm

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif bcmath \
    && install-php-extensions redis \
    && apt-get clean

RUN printf "upload_max_filesize=6M\npost_max_size=10M\n" > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Пренастройваме www-data да ползва същия UID/GID като host потребителя,
# за да може php-fpm да пише в bind-mount-натите storage/ и bootstrap/cache.
# (native Docker Engine запазва host собствеността по bind mount-овете)
ARG PUID=1001
ARG PGID=1001
RUN groupmod -o -g ${PGID} www-data \
    && usermod  -o -u ${PUID} -g ${PGID} www-data

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
