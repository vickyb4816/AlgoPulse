import React, { useState } from 'react';
import { CryptoPair } from '../types';
import { X, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';

interface OrderPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair: CryptoPair;
  defaultAction?: 'BUY' | 'SELL';
  defaultPrice?: number;
  availableCash: number;
  onPlaceOrder: (order: {
    pair: string;
    action: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET';
    price: number;
    quantity: number;
    totalInr: number;
  }) => void;
}

export const OrderPlacementModal: React.FC<OrderPlacementModalProps> = ({
  isOpen,
  onClose,
  pair,
  defaultAction = 'BUY',
  defaultPrice,
  availableCash,
  onPlaceOrder,
}) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>(defaultAction);
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState<number>(defaultPrice || pair.price);
  const [quantity, setQuantity] = useState<number>(0.01);

  if (!isOpen) return null;

  const orderValue = price * quantity;
  const coinDcxFee = orderValue * 0.002;
  const gst = coinDcxFee * 0.18;
  const tds = action === 'SELL' ? orderValue * 0.01 : 0;
  const netRequired = action === 'BUY' ? orderValue + coinDcxFee + gst : orderValue - coinDcxFee - gst - tds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder({
      pair: pair.symbol,
      action,
      type: orderType,
      price: orderType === 'MARKET' ? pair.price : price,
      quantity,
      totalInr: orderValue,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-md w-full p-5 shadow-2xl font-mono select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-[#f0f4f8]">
              Place Order: {pair.symbol}
            </span>
            <span className="text-[10px] bg-[#16202e] text-[#f2ca50] px-1.5 py-0.5 rounded font-semibold">
              CoinDCX Spot
            </span>
          </div>

          <button onClick={onClose} className="text-[#8a94a6] hover:text-[#d9e3f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Buy / Sell toggle */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={() => setAction('BUY')}
            className={`py-2 text-xs font-bold rounded transition-colors ${
              action === 'BUY'
                ? 'bg-[#2ebd85] text-[#091421]'
                : 'bg-[#16202e] text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setAction('SELL')}
            className={`py-2 text-xs font-bold rounded transition-colors ${
              action === 'SELL'
                ? 'bg-[#f6465d] text-[#f0f4f8]'
                : 'bg-[#16202e] text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Order Type */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8a94a6] text-[11px] w-20">Type:</span>
            <div className="flex bg-[#091421] p-0.5 rounded border border-[#212a39] flex-1">
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`flex-1 py-1 text-center text-xs rounded transition-colors ${
                  orderType === 'LIMIT' ? 'bg-[#1c2331] text-[#f2ca50] font-bold' : 'text-[#8a94a6]'
                }`}
              >
                Limit Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`flex-1 py-1 text-center text-xs rounded transition-colors ${
                  orderType === 'MARKET' ? 'bg-[#1c2331] text-[#f2ca50] font-bold' : 'text-[#8a94a6]'
                }`}
              >
                Market Order
              </button>
            </div>
          </div>

          {/* Price */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-[10px] text-[#8a94a6] uppercase tracking-wider mb-1">
                Order Price (INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                step="100"
                className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-3 py-1.5 rounded text-xs outline-none"
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <div className="flex justify-between text-[10px] text-[#8a94a6] mb-1">
              <span className="uppercase tracking-wider">Quantity ({pair.base})</span>
              <span>Available: ₹{availableCash.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              step="0.001"
              min="0.0001"
              className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-3 py-1.5 rounded text-xs outline-none"
            />
          </div>

          {/* Tax & Fee Preview Box */}
          <div className="p-2.5 bg-[#091421] rounded border border-[#212a39] space-y-1 text-[11px]">
            <div className="flex justify-between text-[#8a94a6]">
              <span>Order Value:</span>
              <span className="text-[#d9e3f7] font-semibold tabular-nums">
                ₹{orderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-[#8a94a6]">
              <span>Taker Fee (0.2%) + GST (18%):</span>
              <span className="text-[#f6465d] tabular-nums">
                -₹{(coinDcxFee + gst).toFixed(2)}
              </span>
            </div>
            {action === 'SELL' && (
              <div className="flex justify-between text-[#8a94a6]">
                <span>1% TDS Withholding (Sec 194S):</span>
                <span className="text-[#f6465d] tabular-nums">
                  -₹{tds.toFixed(2)}
                </span>
              </div>
            )}
            <div className="pt-1 border-t border-[#212a39] flex justify-between font-bold text-xs text-[#2ebd85]">
              <span>Net Settlement:</span>
              <span>₹{netRequired.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 rounded font-bold text-xs tracking-wider transition-colors ${
              action === 'BUY'
                ? 'bg-[#2ebd85] hover:bg-[#26a673] text-[#091421]'
                : 'bg-[#f6465d] hover:bg-[#df3a50] text-[#f0f4f8]'
            }`}
          >
            CONFIRM {action} ORDER
          </button>
        </form>
      </div>
    </div>
  );
};
