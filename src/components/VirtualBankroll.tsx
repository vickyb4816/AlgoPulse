import React from 'react';
import { Position } from '../types';
import { Wallet, RotateCcw, XCircle, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';

interface VirtualBankrollProps {
  equity: number;
  unreservedCash: number;
  allocatedMargin: number;
  positions: Position[];
  onResetBankroll: () => void;
  onClosePosition: (posId: string) => void;
}

export const VirtualBankroll: React.FC<VirtualBankrollProps> = ({
  equity,
  unreservedCash,
  allocatedMargin,
  positions,
  onResetBankroll,
  onClosePosition,
}) => {
  const overallReturn = ((equity - 100000) / 100000) * 100;

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <div className="flex items-center gap-2">
          <Wallet className="w-3.5 h-3.5 text-[#f2ca50]" />
          <span className="font-display font-bold text-sm text-[#f0f4f8]">
            Virtual Bankroll & Margin
          </span>
        </div>

        <button
          onClick={onResetBankroll}
          className="text-[10px] text-[#8a94a6] hover:text-[#f2ca50] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-[#16202e]"
          title="Reset simulation to $100,000 USD / ₹1,00,000"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>RESET ($100K)</span>
        </button>
      </div>

      {/* Equity & Cash Dual Cards */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 bg-[#091421] p-2.5 rounded border border-[#212a39]">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">
            EQUITY VALUE
          </span>
          <span className="font-display text-base font-bold text-[#2ebd85] tabular-nums block mt-0.5">
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2ebd85] font-semibold tabular-nums">
            +{overallReturn.toFixed(2)}% Overall
          </span>
        </div>

        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">
            UNRESERVED MARGIN
          </span>
          <span className="font-display text-base font-bold text-[#f0f4f8] tabular-nums block mt-0.5">
            ${unreservedCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#8a94a6] tabular-nums">
            Allocated: ${allocatedMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Active Positions */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-[#212a39]/60">
          <span className="font-bold text-[#8a94a6] tracking-wider uppercase">
            Active Positions ({positions.length})
          </span>
          <span className="text-[#2ebd85] font-semibold">HYPERLIQUID CLEARINGHOUSE</span>
        </div>

        <div className="mt-1.5 space-y-1.5">
          {positions.length === 0 ? (
            <div className="py-4 text-center text-[#8a94a6] text-[11px] bg-[#091421] rounded border border-[#212a39]/40">
              No active positions. Execute a Long or Short to trade.
            </div>
          ) : (
            positions.map((pos) => {
              const isProfit = pos.pnl >= 0;
              const isShort = pos.type === 'SHORT';

              return (
                <div
                  key={pos.id}
                  className="bg-[#091421] border border-[#212a39] rounded p-2 flex flex-col justify-between hover:border-[#8a94a6]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#f0f4f8]">{pos.pair}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          isShort
                            ? 'bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/30'
                            : 'bg-[#2ebd85]/15 text-[#2ebd85] border border-[#2ebd85]/30'
                        }`}
                      >
                        {pos.type} {pos.leverage}X ({pos.isCross ? 'Cross' : 'Isolated'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          isProfit ? 'text-[#2ebd85]' : 'text-[#f6465d]'
                        }`}
                      >
                        {isProfit ? '+' : ''}${pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({isProfit ? '+' : ''}{pos.pnlPercent}%)
                      </span>
                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="text-[#8a94a6] hover:text-[#f6465d] transition-colors p-0.5"
                        title="Close Position (reduce_only: true)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#8a94a6] tabular-nums">
                    <span>
                      Qty: {pos.quantity} @ ${pos.entryPrice.toLocaleString('en-US')}
                    </span>
                    <span className="text-[#f6465d] font-semibold">
                      Liq Px: ${pos.liquidationPrice > 0 ? pos.liquidationPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : 'None'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
