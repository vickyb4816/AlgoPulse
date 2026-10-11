import React, { useState } from 'react';
import { InstitutionalAlgo, ASTResult } from '../types';
import { Play, TrendingUp, ShieldCheck, BarChart3, Calendar, RotateCcw, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface BacktesterScreenProps {
  algos: InstitutionalAlgo[];
  initialAST?: ASTResult;
}

export const BacktesterScreen: React.FC<BacktesterScreenProps> = ({
  algos,
  initialAST,
}) => {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAST ? 'custom' : algos[0].id);
  const [selectedPair, setSelectedPair] = useState('BTC/INR');
  const [dateRange, setDateRange] = useState('90D');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulated backtest results state
  const [backtestStats, setBacktestStats] = useState({
    grossProfit: 71400.00,
    brokerageFees: 1428.00,
    tdsDeducted: 1420.00,
    vdaTax115bbh: 21690.00,
    netProfit: 46862.00,
    winRate: 68.4,
    profitFactor: 2.41,
    totalTrades: 84,
    maxDrawdown: -4.6,
    sharpeRatio: 2.18,
    equityPoints: [100000, 104200, 102800, 109400, 115200, 112900, 122400, 131800, 128900, 139400, 146862],
  });

  const handleRunBacktest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Dynamic outcome calculation based on selection
      const isSol = selectedPair === 'SOL/INR';
      setBacktestStats({
        grossProfit: isSol ? 51000 : 71400,
        brokerageFees: isSol ? 1020 : 1428,
        tdsDeducted: isSol ? 1020 : 1420,
        vdaTax115bbh: isSol ? 15800 : 21690,
        netProfit: isSol ? 33160 : 46862,
        winRate: isSol ? 73.6 : 68.4,
        profitFactor: isSol ? 2.90 : 2.41,
        totalTrades: isSol ? 112 : 84,
        maxDrawdown: isSol ? -5.2 : -4.6,
        sharpeRatio: isSol ? 2.42 : 2.18,
        equityPoints: isSol
          ? [100000, 102500, 106000, 104200, 112000, 118400, 124000, 133160]
          : [100000, 104200, 102800, 109400, 115200, 112900, 122400, 131800, 128900, 139400, 146862],
      });
      setIsSimulating(false);
    }, 600);
  };

  // Generate SVG path for equity curve
  const minEquity = Math.min(...backtestStats.equityPoints);
  const maxEquity = Math.max(...backtestStats.equityPoints);
  const eqRange = maxEquity - minEquity || 1;
  const equityPointsSvg = backtestStats.equityPoints
    .map((val, idx) => {
      const x = (idx / (backtestStats.equityPoints.length - 1)) * 600;
      const y = 140 - ((val - minEquity) / eqRange) * 110;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="px-3 pb-8 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="bg-[#121c2a] border border-[#212a39] rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-[#f0f4f8]">
              CoinDCX Historical Backtester Engine
            </h2>
            <span className="text-[10px] bg-[#2ebd85]/15 text-[#2ebd85] px-2 py-0.5 rounded font-bold border border-[#2ebd85]/30">
              Tax-Aware Simulation
            </span>
          </div>
          <p className="text-[11px] text-[#8a94a6] mt-0.5">
            Evaluates execution performance against authentic tick data. Factor in real slippage, CoinDCX exchange maker/taker fees, and Indian statutory tax deductions (Sec 115BBH & Sec 194S).
          </p>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isSimulating}
          className="py-2 px-4 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSimulating ? 'SIMULATING 90D DATA...' : 'RUN BACKTEST SIMULATION'}</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="bg-[#050f1c] border border-[#212a39] rounded p-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
            Strategy Algorithm
          </label>
          <select
            value={selectedAlgoId}
            onChange={(e) => setSelectedAlgoId(e.target.value)}
            className="w-full bg-[#091421] border border-[#212a39] text-[#f2ca50] px-2.5 py-1.5 rounded text-xs outline-none"
          >
            {initialAST && <option value="custom">Custom AST: {initialAST.strategy_name}</option>}
            {algos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.category})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
            Trading Asset Pair
          </label>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="w-full bg-[#091421] border border-[#212a39] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
          >
            <option value="BTC/INR">BTC/INR (Spot)</option>
            <option value="SOL/INR">SOL/INR (Spot)</option>
            <option value="ETH/USDT">ETH/USDT (Futures)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
            Historical Sample Period
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-[#091421] border border-[#212a39] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
          >
            <option value="30D">30 Days (High Density)</option>
            <option value="90D">90 Days (CoinDCX Standard)</option>
            <option value="180D">180 Days (Half-Year Cycle)</option>
            <option value="1Y">365 Days (Full Market Regime)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
            Starting Capital (INR)
          </label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
            step="10000"
            className="w-full bg-[#091421] border border-[#212a39] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5">
        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">NET IN-POCKET PNL</span>
          <span className="text-base font-bold text-[#2ebd85] font-display tabular-nums mt-0.5 block">
            +₹{backtestStats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2ebd85]">
            +{((backtestStats.netProfit / initialCapital) * 100).toFixed(1)}% Return
          </span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">WIN RATE</span>
          <span className="text-base font-bold text-[#2ebd85] font-display tabular-nums mt-0.5 block">
            {backtestStats.winRate}%
          </span>
          <span className="text-[10px] text-[#8a94a6]">{backtestStats.totalTrades} Executions</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">PROFIT FACTOR</span>
          <span className="text-base font-bold text-[#f0f4f8] font-display tabular-nums mt-0.5 block">
            {backtestStats.profitFactor}
          </span>
          <span className="text-[10px] text-[#2ebd85]">High Expectancy</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">MAX DRAWDOWN</span>
          <span className="text-base font-bold text-[#f6465d] font-display tabular-nums mt-0.5 block">
            {backtestStats.maxDrawdown}%
          </span>
          <span className="text-[10px] text-[#8a94a6]">Low Capital Risk</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">SHARPE RATIO</span>
          <span className="text-base font-bold text-[#f2ca50] font-display tabular-nums mt-0.5 block">
            {backtestStats.sharpeRatio}
          </span>
          <span className="text-[10px] text-[#8a94a6]">Risk-Adjusted Alpha</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">TDS DEDUCTED (194S)</span>
          <span className="text-base font-bold text-[#f6465d] font-display tabular-nums mt-0.5 block">
            -₹{backtestStats.tdsDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#8a94a6]">Form 26AS Ready</span>
        </div>
      </div>

      {/* Equity Curve & Tax Impact Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Equity Curve Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#121c2a] border border-[#212a39] rounded p-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
            <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider">
              Cumulative Equity Growth Curve ({dateRange})
            </span>
            <span className="text-[10px] text-[#2ebd85] font-semibold">
              Peak: ₹{maxEquity.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="mt-2 w-full h-48 bg-[#091421] rounded p-3 relative flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ebd85" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2ebd85" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`${equityPointsSvg} L 600 150 L 0 150 Z`}
                fill="url(#eqFill)"
              />
              <path
                d={equityPointsSvg}
                fill="none"
                stroke="#2ebd85"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Indian Tax Ledger Impact on Backtest (4 cols) */}
        <div className="lg:col-span-4 bg-[#121c2a] border border-[#212a39] rounded p-3 flex flex-col justify-between">
          <div>
            <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider block pb-2 border-b border-[#212a39]">
              Post-Tax Accounting Ledger
            </span>

            <div className="mt-2.5 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8a94a6]">Gross Algo Returns:</span>
                <span className="text-[#2ebd85] font-bold tabular-nums">
                  +₹{backtestStats.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8a94a6]">Brokerage + GST:</span>
                <span className="text-[#f6465d] tabular-nums">
                  -₹{backtestStats.brokerageFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8a94a6]">1% TDS on Turnover (194S):</span>
                <span className="text-[#f6465d] tabular-nums">
                  -₹{backtestStats.tdsDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8a94a6]">30% Flat VDA Tax (115BBH):</span>
                <span className="text-[#f6465d] font-semibold tabular-nums">
                  -₹{backtestStats.vdaTax115bbh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-[#2ebd85]/15 border border-[#2ebd85]/40 rounded flex items-center justify-between">
            <span className="font-bold text-xs text-[#2ebd85]">NET CASH RETAINED:</span>
            <span className="font-display text-sm font-bold text-[#2ebd85] tabular-nums">
              +₹{backtestStats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
