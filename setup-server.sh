#!/bin/bash

# 에러 발생 시 중단
set -e

echo "Starting server setup..."

# 1. 시스템 업데이트 및 Certbot 설치
echo "Installing Certbot..."
apt-get update
apt-get install certbot python3-certbot-nginx -y

# 2. Nginx 설치
echo "Installing Nginx..."
apt-get update
apt-get install nginx -y

# 3. Nginx 설정 파일 생성
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/kjcommerce.shop <<EOF
server {
    server_name kjcommerce.shop;

    # 프론트엔드 정적 파일 서빙
    root /root/kjcommerce-wms/packages/web/dist;
    index index.html;

    # SPA 라우팅 지원 (프론트엔드)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API 요청은 백엔드로 프록시
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 4. 설정 활성화
echo "Enabling Nginx configuration..."
ln -s -f /etc/nginx/sites-available/kjcommerce.shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "Setup completed! Now running Certbot..."
echo "Please follow the prompts for email and agreement."

# 5. SSL 인증서 발급 (대화형)
certbot --nginx -d kjcommerce.shop
