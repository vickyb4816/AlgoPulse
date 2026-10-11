import React, { useState } from 'react';
import { InstitutionalAlgo } from '../types';
import { Grid, Sliders, Play, CheckCircle2, Pause, Sparkles, Code2, ShieldAlert } from 'lucide-react';

interface AlgoGridProps {
  algos: InstitutionalAlgo[];
  onToggleAlgo: (algoId: string) => void;
  onConfigureAlgo: (algo: InstitutionalAlgo) => void;
  onViewAll?: () => void;
}

export const AlgoGrid: React.FC<AlgoGridProps> = ({
  algos,
  onToggleAlgo,
  onConfigureAlgo,
  onViewAll,
}) => {
  // In Dashboard view, we show the top 6 prominently matching the screenshot, with ability to view all 15
  const displayAlgos = algos.slice(0, 6);
  const activeCount = algos.filter(a => a.status.startsWith('ACTIVE')).length;
  const readyCount = algos.length - activeCount;

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#212a39] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center">
            <Grid className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#f0f4f8]">
                15 Preinstalled Institutional Algos
              </span>
              <span className="text-[10px] bg-[#16202e] border border-[#212a39] text-[#f2ca50] px-1.5 py-0.2 rounded">
                CoinDCX Engine Certified
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#8a94a6]">
            <strong className="text-[#2ebd85] font-semibold">{activeCount} Running in Engine</strong> • {readyCount} Standby Ready
          </span>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[10px] text-[#f2ca50] hover:underline pl-2 border-l border-[#212a39]"
            >
              View Full Catalog (15) →
            </button>
          )}
        </div>
      </div>

      {/* Grid of Strategy Cards */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {displayAlgos.map((algo) => {
          const isActive = algo.status.startsWith('ACTIVE');
          const isReady = algo.status === 'READY';

          return (
            <div
              key={algo.id}
              className={`bg-[#091421] border rounded p-2.5 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-[#2ebd85]/40 shadow-sm'
                  : isReady
                  ? 'border-[#f2ca50]/30 hover:border-[#f2ca50]/60'
                  : 'border-[#212a39] hover:border-[#8a94a6]/40'
              }`}
            >
              {/* Card Title & Status Badge */}
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive
                          ? 'bg-[#2ebd85] animate-pulse'
                          : isReady
                          ? 'bg-[#f2ca50]'
                          : 'bg-[#8a94a6]'
                      }`}
                    ></span>
                    <h4 className="font-display font-bold text-xs text-[#f0f4f8]">{algo.name}</h4>
                  </div>

                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded tracking-tight ${
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

                <p className="text-[10px] text-[#8a94a6] mt-0.5">{algo.subtitle}</p>

                {/* 3 Metric Pills */}
                <div className="mt-2.5 grid grid-cols-3 gap-1 py-1.5 px-2 bg-[#16202e] rounded border border-[#212a39]/70 text-center">
                  <div>
                    <span className="text-[9px] text-[#8a94a6] uppercase tracking-wider block">WIN RATE</span>
                    <span className="text-xs font-bold text-[#2ebd85] tabular-nums">{algo.winRate}%</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#8a94a6] uppercase tracking-wider block">PROFIT FACTOR</span>
                    <span className="text-xs font-bold text-[#f0f4f8] tabular-nums">{algo.profitFactor}</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-[#8a94a6] uppercase tracking-wider block">
                      {algo.avgTrade ? 'AVG TRADE' : algo.trades3M ? 'TRADES (3M)' : algo.maxDrawdown ? 'MAX DD' : 'SURGE AVG'}
                    </span>
                    <span className="text-xs font-bold text-[#f2ca50] tabular-nums">
                      {algo.avgTrade || algo.trades3M || algo.maxDrawdown || algo.surgeAvg}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-3 pt-2 border-t border-[#212a39]/60 flex items-center justify-between text-[10px]">
                <span className="text-[#8a94a6]">{algo.timeframe}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onConfigureAlgo(algo)}
                    className="px-2 py-0.5 rounded bg-[#1c2331] hover:bg-[#212a39] text-[#d9e3f7] hover:text-[#f2ca50] flex items-center gap-1 transition-colors"
                    title="Configure Parameters"
                  >
                    <span>CONFIGURE</span>
                    <Sliders className="w-2.5 h-2.5" />
                  </button>

                  <button
                    onClick={() => onToggleAlgo(algo.id)}
                    className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-colors ${
                      isActive
                        ? 'bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a]'
                        : 'bg-[#d4af37] text-[#091421] hover:bg-[#b8972e]'
                    }`}
                  >
                    <span>{isActive ? 'HALT' : 'DEPLOY'}</span>
                    {isActive ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
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
