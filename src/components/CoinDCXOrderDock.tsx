import React, { useState, useEffect } from 'react';
import { CryptoPair } from '../types';
import { Sliders, Shield, AlertTriangle, ArrowDown, ArrowUp, Zap, Calculator, Info, Check } from 'lucide-react';

interface CoinDCXOrderDockProps {
  pair: CryptoPair;
  availableCash: number;
  isKeyVerified: boolean;
  onOpenConnectModal: () => void;
  onExecuteOrder: (order: {
    pair: string;
    action: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LOSS';
    price: number;
    quantity: number;
    leverage: number;
    isCross: boolean;
    totalAmount: number;
  }) => void;
}

export const CoinDCXOrderDock: React.FC<CoinDCXOrderDockProps> = ({
  pair,
  availableCash,
  isKeyVerified,
  onOpenConnectModal,
  onExecuteOrder,
}) => {
  const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP_LOSS'>('LIMIT');
  const [priceInput, setPriceInput] = useState<string>(() => pair.price.toString());
  const [quantityInput, setQuantityInput] = useState<string>('0.05');
  const [leverage, setLeverage] = useState<number>(pair.maxLeverage ? Math.min(20, pair.maxLeverage) : 1);
  const [isCross, setIsCross] = useState<boolean>(true);

  // Sync price when pair changes
  useEffect(() => {
    setPriceInput(pair.price.toString());
    if (pair.maxLeverage && leverage > pair.maxLeverage) {
      setLeverage(pair.maxLeverage);
    }
  }, [pair.symbol, pair.price]);

  const numPrice = parseFloat(priceInput) || pair.price;
  const numQty = parseFloat(quantityInput) || 0;
  const notionalValue = numPrice * numQty;
  const requiredMargin = leverage > 0 ? notionalValue / leverage : notionalValue;

  // Indian Tax / Fee calculations
  const feeRate = 0.002;
  const estFee = notionalValue * feeRate;
  const estGst = estFee * 0.18;
  const estTds = action === 'SELL' ? notionalValue * 0.01 : 0;

  // Estimated Liquidation Price for Margin / Futures
  const isLong = action === 'BUY';
  const buffer = (1 / leverage) - 0.01;
  const estLiqPx = leverage > 1 
    ? (isLong ? Math.max(0, numPrice * (1 - buffer)) : numPrice * (1 + buffer))
    : 0;

  const handleSetPercent = (pct: number) => {
    const marginToSpend = (availableCash * pct) / 100;
    const notional = marginToSpend * leverage;
    const calcQty = numPrice > 0 ? notional / numPrice : 0;
    const formatted = pair.price > 1000 ? calcQty.toFixed(4) : calcQty.toFixed(2);
    setQuantityInput(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isKeyVerified) {
      onOpenConnectModal();
      return;
    }

    onExecuteOrder({
      pair: pair.symbol,
      action,
      type: orderType,
      price: orderType === 'MARKET' ? pair.price : numPrice,
      quantity: numQty,
      leverage,
      isCross,
      totalAmount: notionalValue,
    });
  };

  const prefix = pair.currencyPrefix || '₹';

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-[#f0f4f8]">
            CoinDCX Order Dock
          </span>
          <span className="text-[10px] bg-[#16202e] text-[#f2ca50] font-bold px-1.5 py-0.2 rounded border border-[#f2ca50]/30">
            {pair.symbol}
          </span>
        </div>

        <span className="text-[11px] text-[#8a94a6]">
          Avail: <strong className="text-[#f0f4f8]">{prefix}{availableCash.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
        </span>
      </div>

      {/* Buy / Sell Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => setAction('BUY')}
          className={`py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            action === 'BUY'
              ? 'bg-[#2ebd85] text-[#091421] shadow-md'
              : 'bg-[#091421] text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#16202e]'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
          <span>BUY / LONG</span>
        </button>

        <button
          type="button"
          onClick={() => setAction('SELL')}
          className={`py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            action === 'SELL'
              ? 'bg-[#f6465d] text-[#f0f4f8] shadow-md'
              : 'bg-[#091421] text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#16202e]'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
          <span>SELL / SHORT</span>
        </button>
      </div>

      {/* Order Type Switcher */}
      <div className="flex bg-[#091421] p-0.5 rounded border border-[#212a39] mt-2.5">
        {(['LIMIT', 'MARKET', 'STOP_LOSS'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors ${
              orderType === t ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/30' : 'text-[#8a94a6]'
            }`}
          >
            {t === 'LIMIT' ? 'LIMIT' : t === 'MARKET' ? 'MARKET' : 'STOP-LOSS'}
          </button>
        ))}
      </div>

      {/* Leverage & Margin Controls */}
      <div className="mt-2.5 p-2 bg-[#091421] rounded border border-[#212a39] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#8a94a6] uppercase font-bold">Margin Mode:</span>
            <div className="flex bg-[#121c2a] p-0.5 rounded border border-[#212a39]">
              <button
                type="button"
                onClick={() => setIsCross(true)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isCross ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
                }`}
              >
                Cross
              </button>
              <button
                type="button"
                onClick={() => setIsCross(false)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  !isCross ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
                }`}
              >
                Isolated
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8a94a6]">Leverage:</span>
            <span className="text-[11px] text-[#f2ca50] font-bold">{leverage}x</span>
          </div>
        </div>

        {/* Leverage Slider */}
        <input
          type="range"
          min="1"
          max={pair.maxLeverage || 20}
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
          className="w-full accent-[#d4af37] cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-[#8a94a6]">
          <span>1x (Spot)</span>
          <span>5x</span>
          <span>10x</span>
          <span>{pair.maxLeverage || 20}x Max</span>
        </div>
      </div>

      {/* Inputs */}
      <form onSubmit={handleSubmit} className="mt-2.5 space-y-2.5">
        {orderType !== 'MARKET' && (
          <div>
            <div className="flex justify-between text-[10px] text-[#8a94a6] mb-0.5">
              <span>ORDER PRICE ({pair.quote})</span>
              <span>MARK: {prefix}{pair.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex bg-[#091421] border border-[#212a39] rounded px-2.5 py-1.5 focus-within:border-[#f2ca50]">
              <span className="text-[#8a94a6] mr-1">{prefix}</span>
              <input
                type="number"
                step="any"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full bg-transparent text-[#d9e3f7] text-xs font-mono outline-none"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between text-[10px] text-[#8a94a6] mb-0.5">
            <span>QUANTITY ({pair.base})</span>
            <span>MAX: {(availableCash * leverage / numPrice).toFixed(4)}</span>
          </div>
          <div className="flex bg-[#091421] border border-[#212a39] rounded px-2.5 py-1.5 focus-within:border-[#f2ca50]">
            <input
              type="number"
              step="any"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              className="w-full bg-transparent text-[#d9e3f7] text-xs font-mono outline-none"
            />
            <span className="text-[#8a94a6] text-[10px] uppercase font-bold">{pair.base}</span>
          </div>
        </div>

        {/* Percent Quick Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleSetPercent(pct)}
              className="py-1 rounded bg-[#091421] hover:bg-[#16202e] border border-[#212a39] text-[#8a94a6] hover:text-[#f2ca50] text-[10px] font-semibold transition-colors"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Margin & Tax Breakdown Summary */}
        <div className="p-2.5 bg-[#091421] rounded border border-[#212a39] space-y-1 text-[10.5px]">
          <div className="flex justify-between text-[#8a94a6]">
            <span>Order Value:</span>
            <strong className="text-[#d9e3f7]">{prefix}{notionalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="flex justify-between text-[#8a94a6]">
            <span>Required Margin:</span>
            <strong className="text-[#f2ca50]">{prefix}{requiredMargin.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
          </div>
          {leverage > 1 && estLiqPx > 0 && (
            <div className="flex justify-between text-[#8a94a6]">
              <span>Est. Liq Price:</span>
              <strong className="text-[#f6465d]">{prefix}{estLiqPx.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
            </div>
          )}
          <div className="flex justify-between text-[#8a94a6] pt-1 border-t border-[#212a39]">
            <span>1% TDS (u/s 194S):</span>
            <span className="text-[#d9e3f7]">{prefix}{estTds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#8a94a6]">
            <span>Brokerage + 18% GST:</span>
            <span className="text-[#d9e3f7]">{prefix}{(estFee + estGst).toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2.5 rounded font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            action === 'BUY'
              ? 'bg-[#2ebd85] hover:bg-[#34d399] text-[#091421]'
              : 'bg-[#f6465d] hover:bg-[#ff5a70] text-[#f0f4f8]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>
            {action === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT'} {pair.base} {leverage > 1 ? `(${leverage}x)` : ''}
          </span>
        </button>
      </form>
    </div>
  );
};
