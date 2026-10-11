import React from 'react';
import { OrderBookItem, CryptoPair } from '../types';

interface OrderBookProps {
  pair: CryptoPair;
  asks: OrderBookItem[];
  bids: OrderBookItem[];
  onSelectPrice: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  pair,
  asks,
  bids,
  onSelectPrice,
}) => {
  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider">
          L2 Order Book ({pair.symbol})
        </span>

        <span className="text-[10px] text-[#8a94a6]">
          Decimals: 0
        </span>
      </div>

      {/* Table Column Titles */}
      <div className="grid grid-cols-3 text-[10px] text-[#8a94a6] py-1.5 border-b border-[#212a39]/60">
        <span className="text-left">PRICE ({pair.quote})</span>
        <span className="text-center">QTY ({pair.base})</span>
        <span className="text-right">TOTAL (LAKH)</span>
      </div>

      {/* Asks (Sells / Red) */}
      <div className="space-y-0.5 my-1">
        {asks.map((ask, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrice(ask.price)}
            className="relative grid grid-cols-3 py-0.5 px-1 rounded hover:bg-[#1c2331] cursor-pointer transition-colors text-[11px] tabular-nums items-center"
          >
            {/* Depth bar indicator */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/12 rounded-r pointer-events-none"
              style={{ width: `${ask.depthPercent}%` }}
            />
            <span className="text-[#f6465d] font-semibold text-left relative z-10">
              {ask.priceFormatted}
            </span>
            <span className="text-[#d9e3f7] text-center relative z-10">
              {ask.qty.toFixed(3)}
            </span>
            <span className="text-[#8a94a6] text-right relative z-10">
              {ask.totalLakh.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Mid Market Price & Spread */}
      <div className="my-1.5 py-1 px-2 rounded bg-[#091421] border border-[#212a39] flex items-center justify-between font-bold text-xs">
        <span className="text-[#2ebd85] font-display text-sm tabular-nums">
          ₹{pair.price.toLocaleString('en-IN')}
        </span>
        <span className="text-[10px] text-[#8a94a6] font-normal tracking-wide">
          SPREAD: <strong className="text-[#d9e3f7] font-semibold">₹230</strong>
        </span>
      </div>

      {/* Bids (Buys / Green) */}
      <div className="space-y-0.5 my-1">
        {bids.map((bid, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrice(bid.price)}
            className="relative grid grid-cols-3 py-0.5 px-1 rounded hover:bg-[#1c2331] cursor-pointer transition-colors text-[11px] tabular-nums items-center"
          >
            {/* Depth bar indicator */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#2ebd85]/12 rounded-r pointer-events-none"
              style={{ width: `${bid.depthPercent}%` }}
            />
            <span className="text-[#2ebd85] font-semibold text-left relative z-10">
              {bid.priceFormatted}
            </span>
            <span className="text-[#d9e3f7] text-center relative z-10">
              {bid.qty.toFixed(3)}
            </span>
            <span className="text-[#8a94a6] text-right relative z-10">
              {bid.totalLakh.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
