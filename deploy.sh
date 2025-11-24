#!/bin/bash

# 빠른 배포 스크립트
set -e

echo "🚀 Starting deployment..."

# 프로젝트 디렉토리로 이동
cd /root/kjcommerce-wms

# 최신 코드 가져오기 (Git 사용 시)
# echo "📥 Pulling latest code..."
git pull origin main

# 의존성 설치
echo "📦 Installing dependencies..."
pnpm install

# 서버 빌드
echo "🔨 Building server..."
cd packages/server
pnpm build

# 프론트엔드 빌드
echo "🎨 Building frontend..."
cd ../web
pnpm build

# 루트로 돌아가기
cd ../..

# PM2 재시작
echo "♻️  Restarting PM2..."
pm2 restart ecosystem.config.js --env production

echo "✅ Deployment completed successfully!"
echo "📊 Check status: pm2 status"
echo "📝 Check logs: pm2 logs kjcommerce-server"
