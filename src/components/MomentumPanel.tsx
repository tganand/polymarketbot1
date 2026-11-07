import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Target,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  Percent,
  Receipt,
  Sparkles,
  Radio,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  ActiveBtcWindow,
  Btc15mBotConfig,
  PaperAccount,
  PortfolioMetrics,
  BtcSpotTicker,
} from '../types/index.ts';
import { AiAuditorModal } from './AiAuditorModal.tsx';

interface MomentumPanelProps {
  symbol: string;
  activeWindow: ActiveBtcWindow | null;
  marketBooks: Record<string, any>;
  account: PaperAccount;
  metrics: PortfolioMetrics;
  config: Btc15mBotConfig;
  btcSpot?: BtcSpotTicker | null;
  onResetAccount: () => void;
  onClosePosition: (positionId: string) => void;
}

export const MomentumPanel: React.FC<MomentumPanelProps> = ({
  symbol,
  activeWindow,
  marketBooks,
  account,
  metrics,
  config,
  btcSpot,
  onResetAccount,
  onClosePosition,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(activeWindow?.timeLeftSeconds || 0);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'closed' | 'all'>('closed');

  useEffect(() => {
    if (activeWindow?.timeLeftSeconds !== undefined) {
      setTimeLeft(activeWindow.timeLeftSeconds);
    }
  }, [activeWindow?.timeLeftSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeWindow?.endDate) {
        const nowSec = Math.floor(Date.now() / 1000);
        const remaining = Math.max(0, Math.floor(activeWindow.endDate / 1000) - nowSec);
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeWindow?.endDate]);

  const upBook = activeWindow?.upTokenId ? marketBooks[activeWindow.upTokenId] : null;
  const downBook = activeWindow?.downTokenId ? marketBooks[activeWindow.downTokenId] : null;

  let upPrice: number | null = null;
  if (upBook && upBook.bestAsk > 0) {
    upPrice = upBook.bestAsk;
  } else if (upBook && upBook.lastPrice > 0) {
    upPrice = upBook.lastPrice;
  } else if (upBook && upBook.bestBid > 0) {
    upPrice = upBook.bestBid;
  } else if (activeWindow?.outcomePrices?.[0] !== undefined && activeWindow.outcomePrices[0] !== null && activeWindow.outcomePrices[0] > 0) {
    upPrice = activeWindow.outcomePrices[0];
  }

  let downPrice: number | null = null;
  if (downBook && downBook.bestAsk > 0) {
    downPrice = downBook.bestAsk;
  } else if (downBook && downBook.lastPrice > 0) {
    downPrice = downBook.lastPrice;
  } else if (downBook && downBook.bestBid > 0) {
    downPrice = downBook.bestBid;
  } else if (activeWindow?.outcomePrices?.[1] !== undefined && activeWindow.outcomePrices[1] !== null && activeWindow.outcomePrices[1] > 0) {
    downPrice = activeWindow.outcomePrices[1];
  }

  const upCents = upPrice !== null ? Math.round(upPrice * 100) : null;
  const downCents = downPrice !== null ? Math.round(downPrice * 100) : null;

  const prevPricesRef = React.useRef<{ up: number | null; down: number | null }>({ up: null, down: null });
  const [upTick, setUpTick] = useState<'up' | 'down' | null>(null);
  const [downTick, setDownTick] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (upPrice !== null && prevPricesRef.current.up !== null && prevPricesRef.current.up !== upPrice) {
      setUpTick(upPrice > prevPricesRef.current.up ? 'up' : 'down');
      const timer = setTimeout(() => setUpTick(null), 1500);
      prevPricesRef.current.up = upPrice;
      return () => clearTimeout(timer);
    }
    prevPricesRef.current.up = upPrice;
  }, [upPrice]);

  useEffect(() => {
    if (downPrice !== null && prevPricesRef.current.down !== null && prevPricesRef.current.down !== downPrice) {
      setDownTick(downPrice > prevPricesRef.current.down ? 'up' : 'down');
      const timer = setTimeout(() => setDownTick(null), 1500);
      prevPricesRef.current.down = downPrice;
      return () => clearTimeout(timer);
    }
    prevPricesRef.current.down = downPrice;
  }, [downPrice]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const minutesRemaining = Math.floor(timeLeft / 60);
  const totalWindowDuration = 900; // 15 mins
  const progressPercent = Math.max(0, Math.min(100, ((totalWindowDuration - timeLeft) / totalWindowDuration) * 100));

  const isUpTriggered = upPrice !== null && upPrice >= (config.entryThreshold || 0.91);
  const isDownTriggered = downPrice !== null && downPrice >= (config.entryThreshold || 0.91);

  const feesPaid = Number((
    (account.totalFeesPaid !== undefined && !isNaN(account.totalFeesPaid) && account.totalFeesPaid > 0)
      ? account.totalFeesPaid
      : (metrics.totalFeesPaid !== undefined && !isNaN(metrics.totalFeesPaid) && metrics.totalFeesPaid > 0)
      ? metrics.totalFeesPaid
      : (account.history || []).reduce((acc, t) => {
          const fee = t.feeUsdc !== undefined && !isNaN(t.feeUsdc) ? t.feeUsdc : ((t.buyFeeUsdc || 0) + (t.sellFeeUsdc || 0));
          return acc + (fee || 0);
        }, 0)
  ).toFixed(4));

  const openPositions = Object.values(account.positions || {});

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {symbol} 15m Automated Strategy
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/25 font-mono">
                  91¢ Entry → 99¢ Spot Exit
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Single trade of ${config.stakeSize || 10} at 91¢. Strictly exits at 99¢ target or $3.00 stop-loss (rapid market execution).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            title="Open AI 24h Performance & Reversal Auditor"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Trade Auditor
          </button>
          <button
            type="button"
            onClick={onResetAccount}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all shadow-sm active:scale-95"
            title="Reset paper account balance to $100"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ($100)
          </button>
        </div>
      </div>

      <AiAuditorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        account={account}
        config={config}
      />

      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <span>Active 15-Minute Polymarket Market</span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-amber-400">{activeWindow?.slug || 'Loading...'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              {activeWindow?.title || `${symbol} Up or Down - 15m Window`}
            </h3>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800/80 px-4 py-3 rounded-xl">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="22" cy="22" r="18" className="stroke-slate-800" strokeWidth="3" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className={minutesRemaining < 3 ? 'stroke-rose-500 transition-all duration-1000' : 'stroke-amber-400 transition-all duration-1000'}
                  strokeWidth="3"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <Clock className="w-4 h-4 text-slate-300 absolute" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Time Remaining</div>
              <div className={`font-mono text-xl font-bold tracking-tight ${minutesRemaining < 3 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Live Binance BTC Spot Ticker & Polymarket CLOB Status (TradeLabs AI Live Feed) */}
        {btcSpot && btcSpot.price > 0 && (
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold uppercase text-[11px]">Binance BTC/USDT Spot:</span>
                <span className="text-base font-black font-mono text-amber-400">
                  ${btcSpot.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${btcSpot.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {btcSpot.change24h >= 0 ? '+' : ''}{btcSpot.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>24h H: <b className="text-slate-200">${btcSpot.high24h.toLocaleString(undefined, { minimumFractionDigits: 1 })}</b></span>
              <span>·</span>
              <span>24h L: <b className="text-slate-200">${btcSpot.low24h.toLocaleString(undefined, { minimumFractionDigits: 1 })}</b></span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                <span>⚡</span> CLOB Live Midpoint Feed
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`w-full py-5 px-6 rounded-2xl font-bold text-center transition-all duration-200 flex items-center justify-center cursor-default select-none bg-gradient-to-br from-[#072418] to-[#04170f] text-[#34d399] border border-[#10b981]/40 shadow-[0_4px_20px_rgba(16,185,129,0.15)] ${
                upTick === 'up'
                  ? 'brightness-125 scale-[1.01] border-[#34d399]'
                  : upTick === 'down'
                  ? 'brightness-90'
                  : ''
              } ${isUpTriggered ? 'ring-4 ring-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.45)] scale-[1.01]' : 'hover:border-[#10b981]/70'}`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Zap className="w-6 h-6 fill-[#34d399] text-[#34d399]" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-400/80">
                    Up Contract
                  </div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                    {upCents !== null ? `${upCents}¢` : '--¢'}
                    {upTick === 'up' && <ArrowUpRight className="w-5 h-5 text-emerald-400 animate-bounce" />}
                    {upTick === 'down' && <ArrowDownRight className="w-5 h-5 text-rose-400 animate-bounce" />}
                  </div>
                </div>
                {isUpTriggered && (
                  <span className="ml-2 text-[10px] font-black uppercase bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-emerald-400/50">
                    ≥{Math.round(config.entryThreshold * 100)}¢ HIT
                  </span>
                )}
              </div>
            </div>

            <div
              className={`w-full py-5 px-6 rounded-2xl font-bold text-center transition-all duration-200 flex items-center justify-center cursor-default select-none bg-gradient-to-br from-[#061e2b] to-[#031119] text-[#38bdf8] border border-[#06b6d4]/40 shadow-[0_4px_20px_rgba(6,182,212,0.15)] ${
                downTick === 'up'
                  ? 'brightness-125 scale-[1.01] border-[#38bdf8]'
                  : downTick === 'down'
                  ? 'brightness-90'
                  : ''
              } ${isDownTriggered ? 'ring-4 ring-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.45)] scale-[1.01]' : 'hover:border-[#06b6d4]/70'}`}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Zap className="w-6 h-6 fill-[#38bdf8] text-[#38bdf8]" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold tracking-wider uppercase text-cyan-400/80">
                    Down Contract
                  </div>
                  <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                    {downCents !== null ? `${downCents}¢` : '--¢'}
                    {downTick === 'up' && <ArrowUpRight className="w-5 h-5 text-cyan-400 animate-bounce" />}
                    {downTick === 'down' && <ArrowDownRight className="w-5 h-5 text-rose-400 animate-bounce" />}
                  </div>
                </div>
                {isDownTriggered && (
                  <span className="ml-2 text-[10px] font-black uppercase bg-cyan-400 text-slate-950 px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-cyan-400/50">
                    ≥{Math.round(config.entryThreshold * 100)}¢ HIT
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/60 px-4 py-2.5 rounded-xl border border-slate-800/60">
            <div>
              Spread:{' '}
              <b className="text-slate-200">
                {upBook && upBook.spread > 0 ? `${Math.round(upBook.spread * 100)}¢` : '1¢'}
              </b>
            </div>
            <div className="flex items-center gap-3">
              <span>
                Bid:{' '}
                <b className="text-emerald-400">
                  {upBook && upBook.bestBid > 0 ? `${Math.round(upBook.bestBid * 100)}¢` : (upCents !== null ? `${Math.max(1, upCents - 1)}¢` : '-')}
                </b>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                Ask:{' '}
                <b className="text-rose-400">
                  {upBook && upBook.bestAsk > 0 ? `${Math.round(upBook.bestAsk * 100)}¢` : (upCents !== null ? `${upCents}¢` : '-')}
                </b>
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">
                Entry Rule: <b className="text-amber-400 font-mono">≥ 91¢</b> (${config.stakeSize || 10} Single Trade) · Exit: <b className="text-emerald-400 font-mono">99¢ Spot Target</b> · Stop: <b className="text-rose-400 font-mono">$3.00 Loss</b>
              </span>
              <span className="font-mono text-xs">
                {isUpTriggered ? (
                  <span className="text-emerald-400 font-bold">UP TRIGGER MET ({upCents}¢)</span>
                ) : isDownTriggered ? (
                  <span className="text-cyan-400 font-bold">DOWN TRIGGER MET ({downCents}¢)</span>
                ) : (
                  <span className="text-slate-400">
                    Highest: {Math.max(upCents || 0, downCents || 0)}¢ / 91¢
                  </span>
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  isUpTriggered
                    ? 'bg-emerald-400'
                    : isDownTriggered
                    ? 'bg-cyan-400'
                    : 'bg-amber-400/70'
                }`}
                style={{
                  width: `${Math.min(100, (Math.max(upCents || 0, downCents || 0) / 80) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: BTC Cash Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{symbol} Cash</span>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
              ${((val) => (val !== undefined ? val.toFixed(2) : '100.00'))(metrics.cashBalance ?? account.cashBalance)}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-mono">
            Bankroll: $100.00
          </div>
        </div>

        {/* Card 2: Net Realized Profit */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Realized PnL</span>
            <div className={`p-2 rounded-xl border ${((metrics.realizedPnl ?? account.totalRealizedPnl ?? 0) >= 0) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              {((metrics.realizedPnl ?? account.totalRealizedPnl ?? 0) >= 0) ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            {(() => {
              const pnl = (metrics.realizedPnl !== undefined && !isNaN(metrics.realizedPnl))
                ? metrics.realizedPnl
                : (account.totalRealizedPnl !== undefined && !isNaN(account.totalRealizedPnl))
                ? account.totalRealizedPnl
                : (account.history || []).reduce((acc, t) => t.side === 'SELL' ? acc + (t.realizedProfitUsdc ?? t.pnlUsdc ?? 0) : acc, 0);
              return (
                <span className={`text-xl sm:text-2xl font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </span>
              );
            })()}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-mono">
            Net closed profit
          </div>
        </div>

        {/* Card 3: Total Fees Paid */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-lg ring-1 ring-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-amber-400 uppercase tracking-wider">Fees Paid</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
              ${feesPaid.toFixed(2)}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-mono truncate" title={`Exact fees paid: $${feesPaid.toFixed(4)}`}>
            Polymarket taker fees
          </div>
        </div>

        {/* Card 4: Unrealized PnL */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Unrealized PnL</span>
            <div className={`p-2 rounded-xl border ${((val) => (val !== undefined ? val : 0))(metrics.unrealizedPnl) >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-bold font-mono ${((val) => (val !== undefined ? val : 0))(metrics.unrealizedPnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {((val) => (val !== undefined ? val : 0))(metrics.unrealizedPnl) >= 0 ? '+' : ''}${((val) => (val !== undefined ? val.toFixed(2) : '0.00'))(metrics.unrealizedPnl)}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-mono">
            Open Positions: {openPositions.length}
          </div>
        </div>

        {/* Card 5: Win Rate */}
        <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-amber-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100">
              {((val) => (val !== undefined ? val.toFixed(1) : '0.0'))(metrics.winRate)}%
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 font-mono">
            {metrics.winningTrades}W · {metrics.losingTrades}L ({metrics.closedTradesCount ?? (metrics.winningTrades + metrics.losingTrades)} closed)
          </div>
        </div>
      </div>

      {/* Active Positions & Live Radar Cockpit */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Active Position Cockpit
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${openPositions.length > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              {openPositions.length > 0 ? `${openPositions.length} IN POSITION` : '0 OPEN'}
            </span>
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold uppercase text-[11px]">24/7 Daemon Active</span>
          </div>
        </div>

        {openPositions.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Monitoring 15m Polymarket Window
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider font-mono">
                      Armed & Ready
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {activeWindow?.title || 'Bitcoin Up or Down - 15m Window'} · <span className="font-mono text-amber-400">{formatTime(timeLeft)} remaining</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                Rule: <span className="text-amber-400 font-bold">≥91¢</span> Single $10 · Exit: <span className="text-emerald-400 font-bold">99¢</span> TP · <span className="text-rose-400 font-bold">-$3</span> SL
              </div>
            </div>

            {/* Live Breakout Distance Radar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> UP Contract
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {upCents !== null ? `${upCents}¢` : '--¢'} <span className="text-slate-500 font-normal">/ 91¢</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((upCents || 0) / 91) * 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Distance to trigger:</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {upCents !== null ? `${Math.max(0, 91 - upCents)}¢ away` : 'Waiting for quote'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> DOWN Contract
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {downCents !== null ? `${downCents}¢` : '--¢'} <span className="text-slate-500 font-normal">/ 91¢</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((downCents || 0) / 91) * 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Distance to trigger:</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {downCents !== null ? `${Math.max(0, 91 - downCents)}¢ away` : 'Waiting for quote'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <b>Auto-Execution Armed:</b> The instant either contract holds ≥91¢ for 400ms, the bot automatically buys a single $10 position and streams its live floating PnL right here.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {openPositions.map((pos) => {
              const book = marketBooks[pos.asset];
              const livePrice = (pos.currentPrice !== undefined && pos.currentPrice > 0)
                ? pos.currentPrice
                : (book?.bestBid || book?.lastPrice || pos.entryPrice || 0);
              const pnl = Number(((pos.shares || 0) * livePrice - (pos.totalCost || 0)).toFixed(2));
              const pnlPercent = Number(((((livePrice || 0) - (pos.entryPrice || 0)) / (pos.entryPrice || 1)) * 100).toFixed(1));
              const isWin = pnl >= 0;

              return (
                <div
                  key={pos.id}
                  className="p-5 rounded-xl bg-slate-950 border-2 border-amber-500/40 shadow-2xl space-y-4 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${pos.outcome.toUpperCase() === 'UP' ? 'bg-emerald-500 text-slate-950' : 'bg-cyan-400 text-slate-950'}`}>
                          ⚡ LIVE TRADE: {pos.outcome}
                        </span>
                        <span className="font-bold text-slate-100 text-sm">{pos.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                        <span>Invested: <b className="text-slate-200">${((val) => (val !== undefined ? val.toFixed(2) : '0.00'))(pos.totalCost)}</b></span>
                        <span>·</span>
                        <span>Entry: <b className="text-slate-200">{(((pos.entryPrice || 0) * 100).toFixed(1))}¢</b></span>
                        <span>·</span>
                        <span>Live Mark: <b className={`text-base ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>{((livePrice * 100).toFixed(1))}¢</b></span>
                        <span>·</span>
                        <span>Shares: <b className="text-slate-200">{((val) => (val !== undefined ? val.toFixed(2) : '0.00'))(pos.shares)}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase">Floating Unrealized PnL</div>
                        <div className={`text-2xl font-black font-mono tracking-tight ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isWin ? '+' : ''}${pnl.toFixed(2)} ({isWin ? '+' : ''}{pnlPercent}%)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onClosePosition(pos.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all active:scale-95 shadow-sm"
                        title="Force-close this position immediately at market"
                      >
                        Exit Market
                      </button>
                    </div>
                  </div>

                  {/* Visual Range Meter from Stop Loss to Take Profit */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-rose-400 font-bold">Stop-Loss Floor: -$3.00 (~64¢)</span>
                      <span className="text-slate-300 font-semibold">Mark: {(livePrice * 100).toFixed(1)}¢</span>
                      <span className="text-emerald-400 font-bold">Take-Profit Target: 99¢ (+$0.81)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${isWin ? 'bg-emerald-400' : 'bg-rose-400'}`}
                        style={{
                          width: `${Math.max(5, Math.min(100, (((livePrice - 0.64) / (0.99 - 0.64)) * 100)))}%`
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-center font-mono">
                      Strict automation armed: Books profit at 99.0¢ spot or stops loss at -$3.00 guaranteed.
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade History Section with Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Trade History Ledger
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {account.history.filter(t => historyTab === 'all' || t.side === 'SELL').length} trades
            </span>
          </h3>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setHistoryTab('closed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${historyTab === 'closed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Completed Trades ({account.history.filter(t => t.side === 'SELL').length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${historyTab === 'all' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All Execution Fills ({account.history.length})
            </button>
          </div>
        </div>

        {account.history.filter(t => historyTab === 'all' || t.side === 'SELL').length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No closed trades recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Entry Fill</th>
                  <th className="py-2.5 px-3">Exit Price</th>
                  <th className="py-2.5 px-3">Net Proceeds</th>
                  <th className="py-2.5 px-3">Realized PnL</th>
                  <th className="py-2.5 px-3">Fees</th>
                  <th className="py-2.5 px-3">Exit / Trigger Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {account.history
                  .filter(t => historyTab === 'all' || t.side === 'SELL')
                  .map((tx) => {
                    const isProfit = (tx.realizedProfitUsdc ?? 0) >= 0;
                    const isSell = tx.side === 'SELL';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-400">
                          {new Date(tx.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isSell ? (isProfit ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30') : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                            {isSell ? 'CLOSED' : 'BUY'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          {tx.outcome}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          ${((val) => {
                            try {
                              return (val || 0).toFixed(2);
                            } catch (e) {
                              return '0.00';
                            }
                          })(tx.copySizeUsdc)} @ {((val) => {
                            try {
                              return ((val || 0) * 100).toFixed(1);
                            } catch (e) {
                              return '0.0';
                            }
                          })(tx.copyPrice)}¢
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {tx.exitPrice !== undefined ? `${((val) => {
                            try {
                              return (val * 100).toFixed(1);
                            } catch (e) {
                              return '0.0';
                            }
                          })(tx.exitPrice)}¢` : '--'}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {tx.netProceedsUsdc !== undefined ? `$${((val) => {
                            try {
                              return val.toFixed(2);
                            } catch (e) {
                              return '0.00';
                            }
                          })(tx.netProceedsUsdc)}` : '--'}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          {tx.side === 'SELL' ? (
                            <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfit ? '+' : ''}${tx.realizedProfitUsdc !== undefined ? ((val) => {
                            try {
                              return val.toFixed(2);
                            } catch (e) {
                              return '0.00';
                            }
                          })(tx.realizedProfitUsdc) : '0.00'} ({isProfit ? '+' : ''}{tx.pnlPercent !== undefined ? tx.pnlPercent : '0.0'}%)
                            </span>
                          ) : (
                            <span className="text-slate-500">Filled</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="font-semibold text-amber-300">
                            ${((val) => {
                              try {
                                return (val || 0).toFixed(2);
                              } catch (e) {
                                return '0.00';
                              }
                            })(tx.feeUsdc !== undefined && tx.feeUsdc > 0 ? tx.feeUsdc : ((tx.buyFeeUsdc || 0) + (tx.sellFeeUsdc || 0)))}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                            tx.sellReason?.includes('TAKE_PROFIT') || tx.sellReason?.includes('WIN')
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : tx.sellReason?.includes('STOP_LOSS') || tx.sellReason?.includes('LOSS')
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {tx.sellReason || tx.fillStatus || 'EXECUTED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Strategy & Changelog Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Active Bot Rules & Recent Changelog
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Live strategy rules, risk parameters, and recent updates deployed to the bot.</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
            V3.4 Production Live
          </span>
        </div>

        {/* 4 Active Core Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <span>🎯</span> 91¢ Entry ($10 Single Trade)
            </div>
            <p className="text-slate-400">Takes strictly <strong>1 trade of $10.00</strong> when Up or Down reaches <strong>91¢</strong> (corridor 91¢–95¢). Zero hedging trades.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>⚡</span> 99¢ / 100¢ Exit On The Spot
            </div>
            <p className="text-slate-400">Instantly force-closes 100% of the position on the spot when live market price touches <strong>≥ 99¢ or 100¢</strong>. Books 99¢ net profit immediately.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <span>🛑</span> $3.00 Real Stop Loss
            </div>
            <p className="text-slate-400">Strictly exits when actual position loss reaches <strong>$3.00</strong> ($7.00 preserved). Instant risk execution.</p>
          </div>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <span>💰</span> PnL After Fees & Fees Paid
            </div>
            <p className="text-slate-400">All realized PnL and account balances are strictly <strong>net of taker fees</strong>. Total fees paid are transparently itemized.</p>
          </div>
        </div>

        {/* Detailed Version Changelog Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>📋</span> Change History & Deployed Updates
          </h4>
          <div className="divide-y divide-slate-800/60 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs">
            <div className="p-3.5 space-y-1 bg-emerald-950/15">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono">V3.4</span>
                  Instant 99¢ & 100¢ Force-Exit Fix (Zero Delay Settlement)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">Latest Deployed</span>
              </div>
              <ul className="text-slate-300 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li><strong>Fixed 100¢ / 99¢ Exit Trigger:</strong> Fixed orderbook bid precedence where stale 1¢ bids on winning tokens delayed exit. Now checks aggregated window outcome prices, CLOB asks, last trades, and opposite-token resolution signals.</li>
                <li><strong>Instant Force Close:</strong> As soon as an active position touches ≥ 99¢ or 100¢ (1.00), the bot triggers immediate force-exit at 99¢ and books profit without waiting for market settlement.</li>
                <li><strong>Manual Exit Hotfix:</strong> Manual "Exit Market" button now also books 99¢ strictly when market price is ≥ 98.5¢.</li>
              </ul>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">V3.3</span>
                  91¢ Sniper Entry, 99¢ Strict Profit Target & $3.00 Stop Loss Execution
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Previous Update</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li><strong>91¢ Breakout Trigger:</strong> Bot enters strictly 1 trade of $10.00 on any side (UP or DOWN) the moment CLOB prices touch ≥ 91¢.</li>
                <li><strong>99¢ Target Booking:</strong> Instantly books profits at 99¢ (0.99) on the spot without waiting for market expiry.</li>
                <li><strong>$3.00 Stop-Loss Booking:</strong> Strictly books stop loss if position loss reaches $3.00, protecting remaining capital.</li>
                <li><strong>24/7 VPS Terminal Mode:</strong> Complete background daemon deployment setup with PM2 and systemd for 24/7 uptime when laptop is off.</li>
              </ul>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">V3.1</span>
                  50ms Decoupled Risk Engine
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Previous Update</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li>Decoupled open position risk management from window lifecycle.</li>
              </ul>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">V3.0</span>
                  Single $10 Trade at 80¢ & Removed Pair Strategy
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Previous Update</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li>Wiped all old rules and removed the pair arbitrage section.</li>
                <li>Configured 1 single trade of $10.00 at 80¢ with 0 hedge trades.</li>
              </ul>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono">V2.8</span>
                  Mutual Exclusion Binary Settlement
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Previous Update</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li>Fixed binary resolution mutual exclusion so winner settles at $1.00 and loser settles strictly at $0.00 (eliminating double-profit display).</li>
              </ul>
            </div>

            <div className="p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono">V2.6</span>
                  Price Stabilization & 15m Window Discovery
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Initial Stabilization</span>
              </div>
              <ul className="text-slate-400 space-y-1 list-disc list-inside text-[11px] pl-1">
                <li>Removed complementary price inversion and polling price overwrites, eliminating 65¢ $\leftrightarrow$ 11¢ price snapping.</li>
                <li>Added automatic keyword fallback for 15-minute Bitcoin window discovery.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
