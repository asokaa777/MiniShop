#!/bin/sh
set -e

# Replace $PORT placeholder in nginx config with actual Railway port
sed "s/\$PORT/$PORT/g" /app/nginx.conf > /tmp/nginx.conf

# Start PHP-FPM in background
php-fpm82 -D

# Start Nginx in foreground (keeps container alive)
nginx -c /tmp/nginx.conf -g "daemon off;"
