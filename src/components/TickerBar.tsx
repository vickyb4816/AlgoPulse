import React from 'react';
import { CryptoPair } from '../types';

interface TickerBarProps {
  pairs: CryptoPair[];
  selectedPair: CryptoPair;
  onSelectPair: (pair: CryptoPair) => void;
  feedType: 'SPOT' | 'FUTURES' | 'OPTIONS';
  onChangeFeedType: (feed: 'SPOT' | 'FUTURES' | 'OPTIONS') => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  pairs,
  selectedPair,
  onSelectPair,
  feedType,
  onChangeFeedType,
}) => {
  return (
    <div className="w-full bg-[#050f1c] border-b border-[#212a39] px-3 py-1 flex items-center justify-between gap-3 overflow-x-auto text-xs font-mono select-none">
      {/* Feed & Market filters */}
      <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
        <span className="text-[#8a94a6] text-[10px] uppercase font-bold tracking-wider mr-1">
          CoinDCX Feed
        </span>

        <button
          onClick={() => onChangeFeedType('SPOT')}
          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
            feedType === 'SPOT'
              ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40'
              : 'text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#121c2a]'
          }`}
        >
          SPOT (INR/USDT)
        </button>

        <button
          onClick={() => onChangeFeedType('FUTURES')}
          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
            feedType === 'FUTURES'
              ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40'
              : 'text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#121c2a]'
          }`}
        >
          FUTURES (USDT-M)
        </button>

        <div className="hidden 2xl:flex items-center gap-3 text-[10px] text-[#8a94a6] pl-2 border-l border-[#212a39]">
          <span>24H VOL: <strong className="text-[#d9e3f7]">₹4,291.45 Cr</strong></span>
          <span>EST SPREAD: <strong className="text-[#2ebd85]">0.010%</strong></span>
        </div>
      </div>

      {/* Tickers with mini sparklines */}
      <div className="flex items-center gap-3 shrink-0 overflow-x-auto">
        {pairs.map((pair) => {
          const isSelected = selectedPair.symbol === pair.symbol;
          const isPositive = pair.change24h >= 0;

          // Render micro sparkline SVG
          const minVal = Math.min(...pair.sparkline);
          const maxVal = Math.max(...pair.sparkline);
          const range = maxVal - minVal || 1;
          const points = pair.sparkline
            .map((val, idx) => {
              const x = (idx / (pair.sparkline.length - 1)) * 36;
              const y = 14 - ((val - minVal) / range) * 11;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <div
              key={pair.symbol}
              onClick={() => onSelectPair(pair)}
              className={`flex items-center gap-2.5 px-2 py-1 rounded cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-[#16202e] border-[#f2ca50]/50 shadow-sm'
                  : 'bg-[#091421] border-[#212a39]/70 hover:border-[#8a94a6]/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#f0f4f8]">{pair.symbol}</span>
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${
                      isPositive ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                    }`}
                  >
                    {isPositive ? `+${pair.change24h}%` : `${pair.change24h}%`}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] tabular-nums">
                  <span className="text-[#d9e3f7] font-medium">{pair.priceFormatted}</span>
                  <span className="text-[9px] text-[#8a94a6]">
                    {pair.high24h ? `24h H: ${pair.high24h}` : pair.volume ? `Vol: ${pair.volume}` : ''}
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="w-9 h-4 shrink-0">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 36 14">
                  <polyline
                    fill="none"
                    stroke={isPositive ? '#2ebd85' : '#f6465d'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
