import React, { useState } from 'react';
import { InstitutionalAlgo } from '../types';
import { Grid, Search, Filter, Sliders, Play, Pause, Code2, ShieldAlert, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

interface StrategiesScreenProps {
  algos: InstitutionalAlgo[];
  onToggleAlgo: (id: string) => void;
  onConfigureAlgo: (algo: InstitutionalAlgo) => void;
}

export const StrategiesScreen: React.FC<StrategiesScreenProps> = ({
  algos,
  onToggleAlgo,
  onConfigureAlgo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'READY' | 'IDLE'>('ALL');

  const categories = ['ALL', 'Trend Momentum', 'Volatility Breakout', 'Mean Reversion', 'Macro Trend', 'Arbitrage'];

  const filteredAlgos = algos.filter((algo) => {
    const matchesSearch = algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || algo.category === selectedCategory;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = algo.status.startsWith('ACTIVE');
    else if (statusFilter === 'READY') matchesStatus = algo.status === 'READY';
    else if (statusFilter === 'IDLE') matchesStatus = algo.status === 'IDLE';

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = algos.filter(a => a.status.startsWith('ACTIVE')).length;

  return (
    <div className="px-3 pb-8 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#121c2a] border border-[#212a39] rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-[#f0f4f8]">
              15 Preinstalled Institutional Algos Catalog
            </h2>
            <span className="text-[10px] bg-[#2ebd85]/15 text-[#2ebd85] border border-[#2ebd85]/30 px-2 py-0.5 rounded font-bold">
              CoinDCX Certified Engine
            </span>
          </div>
          <p className="text-[11px] text-[#8a94a6] mt-1 max-w-3xl">
            Hardened quantitative execution rules calibrated specifically for crypto spot and perpetual markets. Every strategy includes deterministic risk control, automatic 1% TDS ledger compliance, and zero external latency.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#091421] p-2 rounded border border-[#212a39]">
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">ENGINE LOAD</span>
            <span className="text-sm font-bold text-[#2ebd85] tabular-nums">
              {activeCount} of 15 Active ({((activeCount/15)*100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#050f1c] border border-[#212a39] rounded p-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md bg-[#091421] border border-[#212a39] px-2.5 py-1.5 rounded">
          <Search className="w-3.5 h-3.5 text-[#8a94a6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search strategies (e.g. EMA, Supertrend, Arbitrage, Breakout)..."
            className="w-full bg-transparent text-[#d9e3f7] placeholder-[#8a94a6] outline-none text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 font-bold'
                  : 'text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#121c2a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex bg-[#091421] p-0.5 rounded border border-[#212a39]">
          {(['ALL', 'ACTIVE', 'READY', 'IDLE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                statusFilter === st ? 'bg-[#1c2331] text-[#f2ca50] font-bold' : 'text-[#8a94a6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of all 15 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAlgos.map((algo) => {
          const isActive = algo.status.startsWith('ACTIVE');
          const isReady = algo.status === 'READY';

          return (
            <div
              key={algo.id}
              className={`bg-[#121c2a] border rounded p-3 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-[#2ebd85]/50 shadow-md'
                  : isReady
                  ? 'border-[#f2ca50]/40 hover:border-[#f2ca50]'
                  : 'border-[#212a39] hover:border-[#8a94a6]/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive
                          ? 'bg-[#2ebd85] animate-pulse'
                          : isReady
                          ? 'bg-[#f2ca50]'
                          : 'bg-[#8a94a6]'
                      }`}
                    ></span>
                    <h3 className="font-display font-bold text-sm text-[#f0f4f8]">{algo.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-[#2ebd85]/15 text-[#2ebd85] border border-[#2ebd85]/30'
                        : isReady
                        ? 'bg-[#d4af37]/15 text-[#f2ca50] border border-[#d4af37]/30'
                        : 'bg-[#212a39] text-[#8a94a6]'
                    }`}
                  >
                    {algo.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#f2ca50]">{algo.category}</span>
                  <span className="text-[#8a94a6]">·</span>
                  <span className="text-[10px] text-[#8a94a6]">{algo.subtitle}</span>
                </div>

                <p className="mt-2 text-[11px] text-[#8a94a6] leading-relaxed">
                  {algo.description}
                </p>

                {/* Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-1.5 p-2 bg-[#091421] rounded border border-[#212a39] text-center">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">WIN RATE</span>
                    <span className="text-xs font-bold text-[#2ebd85] tabular-nums">{algo.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">PROFIT FACTOR</span>
                    <span className="text-xs font-bold text-[#f0f4f8] tabular-nums">{algo.profitFactor}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">SIGNALS (24H)</span>
                    <span className="text-xs font-bold text-[#f2ca50] tabular-nums">{algo.signalsToday} Triggers</span>
                  </div>
                </div>

                {/* Code snippet */}
                <div className="mt-2.5 p-2 bg-[#050f1c] rounded border border-[#212a39]/70">
                  <code className="text-[10.5px] text-[#57dea3] block font-mono truncate">
                    {algo.codeSnippet}
                  </code>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-3.5 pt-2.5 border-t border-[#212a39] flex items-center justify-between text-[11px]">
                <span className="text-[#8a94a6]">{algo.timeframe}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onConfigureAlgo(algo)}
                    className="px-2.5 py-1 rounded bg-[#16202e] hover:bg-[#212a39] text-[#d9e3f7] hover:text-[#f2ca50] flex items-center gap-1 transition-colors"
                  >
                    <span>CONFIGURE</span>
                    <Sliders className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onToggleAlgo(algo.id)}
                    className={`px-3 py-1 rounded font-bold flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#93000a]'
                        : 'bg-[#d4af37] text-[#091421] hover:bg-[#b8972e]'
                    }`}
                  >
                    <span>{isActive ? 'HALT ALGO' : 'DEPLOY ALGO'}</span>
                    {isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
