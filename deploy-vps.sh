#!/usr/bin/env bash
# ==============================================================================
# Polymarket 91/99 Sniper & Copy Trade Bot - 24/7 VPS Setup Script
# Strategy: Buy UP/DOWN at 91¢, Sell at 99¢, $10 Order, $3 Stop Loss
# Compatible with Ubuntu 20.04/22.04/24.04 and Debian 11/12
# ==============================================================================
set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential

echo "📦 [2/6] Installing Node.js 22 LTS & PM2 daemon manager..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 tsx

echo "📂 [3/6] Navigating into bot directory..."
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "⚙️ [4/6] Installing project dependencies..."
npm install

echo "🔑 [5/6] Checking environment configuration..."
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Remember to edit your Telegram Bot Token & Chat ID!"
  fi
fi

# Allow port 3000 in firewall if ufw is active
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 3000/tcp || true
fi

echo "🛡️ [6/6] Launching 24/7 background process via PM2..."
pm2 delete polymarket-bot 2>/dev/null || true
pm2 start "npx tsx server.ts" --name polymarket-bot --max-memory-restart 500M
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

echo "================================================================="
echo "✅ Polymarket 91/99 Trading Bot is now running 24/7 on your VPS!"
echo "You can safely close this terminal and turn off your laptop."
echo ""
echo "Helpful PM2 Commands:"
echo "  • View live logs:     pm2 logs polymarket-bot"
echo "  • Monitor status:     pm2 monit"
echo "  • Restart bot:        pm2 restart polymarket-bot"
echo "  • Stop bot:           pm2 stop polymarket-bot"
echo "  • Open dashboard:     http://$(curl -s ifconfig.me):3000"
echo "================================================================="
