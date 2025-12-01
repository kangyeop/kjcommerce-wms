pm2 kill

git pull origin main

pnpm build

pnpm build:server

pm2 restart ecosystem.config.js --env production