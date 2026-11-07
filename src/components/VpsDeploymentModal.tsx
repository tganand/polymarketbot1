import React, { useState } from 'react';
import {
  X,
  Terminal,
  Server,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Power,
  RefreshCw,
  Cpu,
  FileCode,
  AlertTriangle,
} from 'lucide-react';

interface VpsDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VpsDeploymentModal: React.FC<VpsDeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pm2' | 'systemd' | 'quickscript' | 'faq'>('pm2');

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const QUICK_INSTALL_SCRIPT = `#!/usr/bin/env bash
# ==============================================================================
# Polymarket 91/99 Trading Bot - 24/7 VPS Auto-Installer
# Runs on Ubuntu 20.04 / 22.04 / 24.04 & Debian 11/12
# ==============================================================================
set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential

echo "📦 [2/6] Installing Node.js 22 LTS & PM2..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2 tsx

echo "📥 [3/6] Cloning Polymarket Bot..."
if [ ! -d "Copy-trade-bot" ]; then
  git clone https://github.com/tganand/Copy-trade-bot.git
fi
cd Copy-trade-bot

echo "⚙️ [4/6] Installing dependencies..."
npm install

echo "🔑 [5/6] Generating environment config..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env - please edit it with your Telegram bot token and secrets."
fi

echo "🛡️ [6/6] Launching 24/7 Background Daemon via PM2..."
pm2 start "npx tsx server.ts" --name polymarket-bot --max-memory-restart 500M
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "================================================================="
echo "✅ BOT IS NOW RUNNING 24/7 ON YOUR VPS!"
echo "You can safely close this terminal and shut down your laptop."
echo "View live logs anytime:  pm2 logs polymarket-bot"
echo "Restart bot:             pm2 restart polymarket-bot"
echo "Stop bot:                pm2 stop polymarket-bot"
echo "Web dashboard:           http://YOUR_VPS_IP:3000"
echo "================================================================="
`;

  const SYSTEMD_SERVICE_FILE = `[Unit]
Description=Polymarket 91/99 Sniper & Copy Trade Bot (24/7 Daemon)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/Copy-trade-bot
ExecStart=/usr/bin/npx tsx /root/Copy-trade-bot/server.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Deploy Bot to VPS (24/7 Run Without Laptop)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  100% Autonomous
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Run continuously on an Ubuntu/Debian Cloud Server ($3–$5/mo on DigitalOcean, Hetzner, AWS, or Vultr) so trades execute 24/7 even when your laptop is turned off.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pm2')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'pm2'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Method 1: PM2 Daemon (Recommended)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quickscript')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'quickscript'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            1-Click VPS Bash Script
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('systemd')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'systemd'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Method 2: Linux Systemd Service
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            24/7 Laptop Off FAQs
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
          {activeTab === 'pm2' && (
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                    Connect to your VPS Terminal
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SSH from your terminal</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Open terminal on Mac/Linux or PowerShell on Windows and log into your server:
                </p>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-200 border border-slate-800">
                  <code>ssh root@YOUR_VPS_IP_ADDRESS</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('ssh', 'ssh root@YOUR_VPS_IP_ADDRESS')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy command"
                  >
                    {copiedKey === 'ssh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">2</span>
                    Install Node.js 22 LTS, Git & PM2
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Ubuntu / Debian</span>
                </div>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-emerald-400 border border-slate-800 leading-relaxed">
                  <code>
                    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -<br />
                    sudo apt install -y nodejs git build-essential<br />
                    sudo npm install -g pm2 tsx
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('step2', 'curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -\nsudo apt install -y nodejs git build-essential\nsudo npm install -g pm2 tsx')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy command"
                  >
                    {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                    Clone Repository & Install Bot
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Terminal Command</span>
                </div>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-200 border border-slate-800 leading-relaxed">
                  <code>
                    git clone https://github.com/tganand/Copy-trade-bot.git<br />
                    cd Copy-trade-bot<br />
                    npm install
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('step3', 'git clone https://github.com/tganand/Copy-trade-bot.git\ncd Copy-trade-bot\nnpm install')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy command"
                  >
                    {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">4</span>
                    Launch 24/7 PM2 Daemon (Keep Running When Laptop Is Off)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Auto-Restart Enabled</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  PM2 keeps your bot executing in background forever. If the server ever reboots, PM2 automatically starts the bot:
                </p>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-amber-300 border border-slate-800 leading-relaxed">
                  <code>
                    # 1. Start bot daemon<br />
                    pm2 start "npx tsx server.ts" --name polymarket-bot --max-memory-restart 500M<br /><br />
                    # 2. Save process list & enable boot auto-start<br />
                    pm2 save<br />
                    pm2 startup
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('step4', 'pm2 start "npx tsx server.ts" --name polymarket-bot --max-memory-restart 500M\npm2 save\npm2 startup')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy command"
                  >
                    {copiedKey === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 5: Monitoring Commands */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Essential PM2 Terminal Commands
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400">pm2 logs polymarket-bot</span>
                      <p className="text-slate-500 text-[10px] font-sans">Stream real-time bot terminal logs</p>
                    </div>
                    <button type="button" onClick={() => handleCopy('c1', 'pm2 logs polymarket-bot')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
                      {copiedKey === 'c1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400">pm2 restart polymarket-bot</span>
                      <p className="text-slate-500 text-[10px] font-sans">Restart the trading engine</p>
                    </div>
                    <button type="button" onClick={() => handleCopy('c2', 'pm2 restart polymarket-bot')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
                      {copiedKey === 'c2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400">pm2 status</span>
                      <p className="text-slate-500 text-[10px] font-sans">Check uptime & memory usage</p>
                    </div>
                    <button type="button" onClick={() => handleCopy('c3', 'pm2 status')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
                      {copiedKey === 'c3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex justify-between items-center">
                    <div>
                      <span className="text-emerald-400">pm2 stop polymarket-bot</span>
                      <p className="text-slate-500 text-[10px] font-sans">Pause bot execution</p>
                    </div>
                    <button type="button" onClick={() => handleCopy('c4', 'pm2 stop polymarket-bot')} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400">
                      {copiedKey === 'c4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quickscript' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300">
                <span className="font-bold">⚡ One-Line Automated Setup:</span> Run this single command on your fresh Ubuntu/Debian VPS to install Node 22, Git, dependencies, and start PM2 automatically.
              </div>

              <div className="relative bg-slate-950 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 border border-slate-800">
                <code>
                  curl -sSL https://raw.githubusercontent.com/tganand/Copy-trade-bot/main/deploy-vps.sh | bash
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy('oneshot', 'curl -sSL https://raw.githubusercontent.com/tganand/Copy-trade-bot/main/deploy-vps.sh | bash')}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy command"
                >
                  {copiedKey === 'oneshot' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-bold text-slate-300">Included deploy-vps.sh script content:</span>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[10px] text-slate-300 border border-slate-800 max-h-56 overflow-y-auto">
                  <pre>{QUICK_INSTALL_SCRIPT}</pre>
                  <button
                    type="button"
                    onClick={() => handleCopy('fullscript', QUICK_INSTALL_SCRIPT)}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Copy full script"
                  >
                    {copiedKey === 'fullscript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systemd' && (
            <div className="space-y-3">
              <p className="text-slate-400 leading-relaxed text-[11px]">
                If you prefer native Linux system services instead of PM2, you can use Systemd. It ensures the trading bot launches on OS startup and restarts automatically on crash.
              </p>

              <div className="space-y-1">
                <span className="font-bold text-slate-200">1. Create the systemd service file:</span>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-slate-300 border border-slate-800">
                  <code>sudo nano /etc/systemd/system/polymarket-bot.service</code>
                  <button
                    type="button"
                    onClick={() => handleCopy('sys1', 'sudo nano /etc/systemd/system/polymarket-bot.service')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedKey === 'sys1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-200">2. Paste this configuration:</span>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[10px] text-slate-300 border border-slate-800">
                  <pre>{SYSTEMD_SERVICE_FILE}</pre>
                  <button
                    type="button"
                    onClick={() => handleCopy('sys2', SYSTEMD_SERVICE_FILE)}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedKey === 'sys2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-200">3. Enable & start the service:</span>
                <div className="relative bg-slate-950 rounded-xl p-3 font-mono text-[11px] text-emerald-400 border border-slate-800 leading-relaxed">
                  <code>
                    sudo systemctl daemon-reload<br />
                    sudo systemctl enable --now polymarket-bot<br />
                    sudo journalctl -u polymarket-bot -f
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy('sys3', 'sudo systemctl daemon-reload\nsudo systemctl enable --now polymarket-bot\nsudo journalctl -u polymarket-bot -f')}
                    className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    {copiedKey === 'sys3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Power className="w-4 h-4" />
                  Why does it keep running when laptop is OFF?
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  A VPS (Virtual Private Server) is a dedicated cloud machine housed in a Tier-3 datacenter with 99.99% uptime and redundant power. When you use PM2, the process runs independently inside Linux background threads, completely detached from your SSH session or home Wi-Fi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  What happens if the VPS restarts?
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Because you run <code>pm2 startup</code> and <code>pm2 save</code>, the Linux init system will immediately boot up the bot the second the operating system recovers. All trade history and positions persist on disk in <code>data/bot_state.json</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  What VPS specs are required?
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  The bot is highly optimized for low memory and low CPU. A minimum <strong>1 vCPU and 1 GB RAM</strong> machine ($3 to $5/month from Hetzner, DigitalOcean, or Vultr) is more than sufficient.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  How to view the Web UI from phone or laptop?
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Open port 3000 on your VPS firewall (<code>sudo ufw allow 3000</code>). Then simply navigate to <code>http://YOUR_VPS_IP:3000</code> in any web browser from any device anywhere in the world!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800/80 pt-3.5 mt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Strategy: <b>91¢ Entry</b> · <b>99¢ TP Target</b> · <b>$3.00 Loss Exit</b> · <b>$10 Stake</b></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
