import React, { useState, useEffect } from 'react';
import { HyperliquidAsset, HyperliquidOrderRequest, OrderExecutionDebugLog } from '../types';
import { 
  buildHyperliquidOrderPayload, 
  buildUpdateLeveragePayload, 
  formatPrice, 
  formatSize, 
  calculateEstimatedLiquidationPrice 
} from '../services/hyperliquidAPI';
import { Sliders, Shield, AlertTriangle, ArrowDown, ArrowUp, Code2, Check, RefreshCw, Info } from 'lucide-react';

interface HyperliquidOrderDockProps {
  asset: HyperliquidAsset;
  availableCash: number;
  onExecuteOrder: (orderReq: HyperliquidOrderRequest, debugLog: OrderExecutionDebugLog) => void;
  onUpdateLeverage: (assetIndex: number, leverage: number, isCross: boolean) => void;
}

export const HyperliquidOrderDock: React.FC<HyperliquidOrderDockProps> = ({
  asset,
  availableCash,
  onExecuteOrder,
  onUpdateLeverage,
}) => {
  // Order parameters
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY'); // BUY = Long, SELL = Short
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [priceInput, setPriceInput] = useState<string>(() => formatPrice(asset.markPx, asset.szDecimals));
  const [sizeInput, setSizeInput] = useState<string>('0.05');

  // Leverage & Margin settings
  const [leverage, setLeverage] = useState<number>(Math.min(20, asset.maxLeverage));
  const [isCross, setIsCross] = useState<boolean>(true);
  const [reduceOnly, setReduceOnly] = useState<boolean>(false);

  // Debug payload viewer modal state
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [activeDebugPayload, setActiveDebugPayload] = useState<any>(null);
  const [lastExecutedLog, setLastExecutedLog] = useState<OrderExecutionDebugLog | null>(null);

  // Sync price when asset changes
  useEffect(() => {
    setPriceInput(formatPrice(asset.markPx, asset.szDecimals));
    // Cap leverage at coin maxLeverage
    if (leverage > asset.maxLeverage) {
      setLeverage(asset.maxLeverage);
    }
  }, [asset.name, asset.markPx]);

  const numPrice = parseFloat(priceInput) || asset.markPx;
  const numSize = parseFloat(sizeInput) || 0;
  const notionalValue = numPrice * numSize;
  const requiredMargin = leverage > 0 ? notionalValue / leverage : notionalValue;

  // Estimated Liquidation Price
  const isLong = side === 'BUY';
  const estLiquidationPx = calculateEstimatedLiquidationPrice(numPrice, isLong, leverage);

  // Leverage update handler
  const handleLeverageChange = (newLev: number) => {
    const clamped = Math.max(1, Math.min(newLev, asset.maxLeverage));
    setLeverage(clamped);
    onUpdateLeverage(asset.assetIndex, clamped, isCross);
  };

  const handleMarginModeToggle = (cross: boolean) => {
    setIsCross(cross);
    onUpdateLeverage(asset.assetIndex, leverage, cross);
  };

  // Percentage allocation
  const handleSetPercent = (pct: number) => {
    const marginToSpend = (availableCash * pct) / 100;
    const notional = marginToSpend * leverage;
    const calcSize = numPrice > 0 ? notional / numPrice : 0;
    setSizeInput(formatSize(calcSize, asset.szDecimals));
  };

  // Build and execute order
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isBuy = side === 'BUY';
    const formattedPx = orderType === 'MARKET' ? formatPrice(asset.markPx, asset.szDecimals) : priceInput;
    const formattedSz = formatSize(numSize, asset.szDecimals);

    // FIX FOR SHORT EXECUTION FAILURE:
    // 1. is_buy MUST be false for Short / Sell orders!
    // 2. assetIndex MUST match asset index in meta.universe (e.g. 0 for BTC, 1 for ETH)
    // 3. reduce_only MUST be false for opening a new short, true only if explicitly closing long
    // 4. sz & limit_px strictly formatted according to szDecimals!
    const orderRequest: HyperliquidOrderRequest = {
      coin: asset.name,
      assetIndex: asset.assetIndex,
      is_buy: isBuy, // false for SHORT, true for LONG
      sz: formattedSz,
      limit_px: formattedPx,
      reduce_only: reduceOnly,
      order_type: {
        limit: {
          tif: 'Gtc'
        }
      },
      leverage,
      isCross
    };

    const { action, debugLog } = buildHyperliquidOrderPayload(orderRequest);
    setActiveDebugPayload(action);
    setLastExecutedLog(debugLog);

    onExecuteOrder(orderRequest, debugLog);
  };

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-[#f0f4f8]">
            Order Execution Dock
          </span>
          <span className="text-[10px] bg-[#212a39] text-[#f2ca50] font-bold px-1.5 py-0.2 rounded">
            {asset.name}
          </span>
        </div>

        <span className="text-[11px] text-[#8a94a6]">
          Avail: <strong className="text-[#f0f4f8]">${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </span>
      </div>

      {/* Side Selector: LONG vs SHORT */}
      <div className="grid grid-cols-2 gap-2 mt-2.5">
        <button
          type="button"
          onClick={() => {
            setSide('BUY');
            setReduceOnly(false);
          }}
          className={`py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            side === 'BUY'
              ? 'bg-[#2ebd85] text-[#091421] shadow-md'
              : 'bg-[#091421] text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#16202e]'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
          <span>BUY / LONG</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSide('SELL');
            setReduceOnly(false);
          }}
          className={`py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            side === 'SELL'
              ? 'bg-[#f6465d] text-[#f0f4f8] shadow-md'
              : 'bg-[#091421] text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#16202e]'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
          <span>SELL / SHORT</span>
        </button>
      </div>

      {/* Margin Mode & Leverage Controls (Requirement #4) */}
      <div className="mt-3 p-2.5 bg-[#091421] rounded border border-[#212a39] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#8a94a6] uppercase font-bold">Margin Mode:</span>
            <div className="flex bg-[#121c2a] p-0.5 rounded border border-[#212a39]">
              <button
                type="button"
                onClick={() => handleMarginModeToggle(true)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isCross ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
                }`}
              >
                Cross
              </button>
              <button
                type="button"
                onClick={() => handleMarginModeToggle(false)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  !isCross ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
                }`}
              >
                Isolated
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8a94a6]">Max:</span>
            <span className="text-[10px] text-[#2ebd85] font-bold">{asset.maxLeverage}x</span>
          </div>
        </div>

        {/* Interactive Leverage Slider */}
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-[#8a94a6]">Target Leverage:</span>
            <span className="font-bold text-[#f2ca50] text-xs tabular-nums">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max={asset.maxLeverage}
            value={leverage}
            onChange={(e) => handleLeverageChange(parseInt(e.target.value) || 1)}
            className="w-full accent-[#d4af37] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-[#8a94a6] mt-0.5">
            <span>1x</span>
            <span>{Math.round(asset.maxLeverage * 0.25)}x</span>
            <span>{Math.round(asset.maxLeverage * 0.5)}x</span>
            <span>{asset.maxLeverage}x</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleOrderSubmit} className="mt-3 space-y-2.5">
        {/* Order Type Toggle */}
        <div className="flex bg-[#091421] p-0.5 rounded border border-[#212a39]">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`flex-1 py-1 text-center text-[10.5px] rounded transition-colors ${
              orderType === 'MARKET' ? 'bg-[#1c2331] text-[#f2ca50] font-bold' : 'text-[#8a94a6]'
            }`}
          >
            Market Order
          </button>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className={`flex-1 py-1 text-center text-[10.5px] rounded transition-colors ${
              orderType === 'LIMIT' ? 'bg-[#1c2331] text-[#f2ca50] font-bold' : 'text-[#8a94a6]'
            }`}
          >
            Limit Order
          </button>
        </div>

        {/* Price Input */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-0.5">
              Limit Price (USD)
            </label>
            <input
              type="text"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
            />
          </div>
        )}

        {/* Size Input */}
        <div>
          <div className="flex justify-between text-[10px] text-[#8a94a6] mb-0.5">
            <span className="uppercase tracking-wider">Order Size ({asset.name})</span>
            <span>Notional: ${notionalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
          <input
            type="text"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
          />
        </div>

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleSetPercent(pct)}
              className="py-0.5 bg-[#091421] hover:bg-[#16202e] text-[#8a94a6] hover:text-[#f2ca50] border border-[#212a39] rounded text-[10px]"
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Reduce Only Checkbox */}
        <label className="flex items-center gap-2 text-[10.5px] text-[#8a94a6] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={reduceOnly}
            onChange={(e) => setReduceOnly(e.target.checked)}
            className="accent-[#f2ca50]"
          />
          <span>Reduce-Only (Close existing position without reversing)</span>
        </label>

        {/* Margin & Liquidation Price Telemetry Summary */}
        <div className="p-2.5 bg-[#091421] rounded border border-[#212a39] space-y-1.5 text-[11px]">
          <div className="flex justify-between text-[#8a94a6]">
            <span>Required Margin:</span>
            <span className="text-[#f0f4f8] font-bold tabular-nums">
              ${requiredMargin.toFixed(2)} USD
            </span>
          </div>

          <div className="flex justify-between text-[#8a94a6]">
            <span>Est. Liquidation Price:</span>
            <span className="text-[#f6465d] font-bold tabular-nums">
              ${estLiquidationPx.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between text-[#8a94a6]">
            <span>Hyperliquid Asset Index:</span>
            <span className="text-[#2ebd85] font-semibold tabular-nums">
              #{asset.assetIndex} ({asset.szDecimals} Decimals)
            </span>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={requiredMargin > availableCash && !reduceOnly}
          className={`w-full py-2.5 rounded font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
            side === 'BUY'
              ? 'bg-[#2ebd85] hover:bg-[#26a673] text-[#091421]'
              : 'bg-[#f6465d] hover:bg-[#df3a50] text-[#f0f4f8]'
          }`}
        >
          {side === 'BUY' ? <ArrowUp className="w-3.5 h-3.5 stroke-[3]" /> : <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />}
          <span>{side === 'BUY' ? `OPEN LONG (${leverage}x)` : `OPEN SHORT (${leverage}x)`}</span>
        </button>

        {/* Payload Inspector Button (Requirement #3) */}
        <div className="pt-1 flex items-center justify-between text-[10px]">
          <button
            type="button"
            onClick={() => {
              const req: HyperliquidOrderRequest = {
                coin: asset.name,
                assetIndex: asset.assetIndex,
                is_buy: side === 'BUY',
                sz: formatSize(numSize, asset.szDecimals),
                limit_px: formatPrice(numPrice, asset.szDecimals),
                reduce_only: reduceOnly,
                order_type: { limit: { tif: 'Gtc' } },
                leverage,
                isCross
              };
              const { action, debugLog } = buildHyperliquidOrderPayload(req);
              setActiveDebugPayload(action);
              setLastExecutedLog(debugLog);
              setShowPayloadModal(true);
            }}
            className="text-[#f2ca50] hover:underline flex items-center gap-1"
          >
            <Code2 className="w-3 h-3" />
            <span>Inspect Hyperliquid Order JSON Payload</span>
          </button>

          <span className="text-[#8a94a6]">
            Side: <strong className={side === 'BUY' ? 'text-[#2ebd85]' : 'text-[#f6465d]'}>{side === 'BUY' ? 'is_buy: true' : 'is_buy: false'}</strong>
          </span>
        </div>
      </form>

      {/* JSON Payload Inspector Modal */}
      {showPayloadModal && activeDebugPayload && (
        <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-lg w-full p-5 shadow-2xl font-mono text-xs select-none">
            <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#f2ca50]" />
                <span className="font-display font-bold text-sm text-[#f0f4f8]">
                  Hyperliquid Exact Order Action Payload
                </span>
              </div>
              <button
                onClick={() => setShowPayloadModal(false)}
                className="text-[#8a94a6] hover:text-[#f0f4f8]"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 p-2.5 bg-[#091421] rounded border border-[#212a39] text-[11px] leading-relaxed text-[#8a94a6]">
              <strong className="text-[#f2ca50] block mb-1">Payload Specification Verified:</strong>
              • <strong className="text-[#d9e3f7]">"a":</strong> {activeDebugPayload.orders[0]?.a} (Asset Index integer mapped from meta.universe)<br />
              • <strong className="text-[#d9e3f7]">"b":</strong> {String(activeDebugPayload.orders[0]?.b)} ({activeDebugPayload.orders[0]?.b ? 'Long / Buy' : 'Short / Sell'})<br />
              • <strong className="text-[#d9e3f7]">"p":</strong> "{activeDebugPayload.orders[0]?.p}" (Price rounded to tick precision)<br />
              • <strong className="text-[#d9e3f7]">"s":</strong> "{activeDebugPayload.orders[0]?.s}" (Size rounded to {asset.szDecimals} decimals)<br />
              • <strong className="text-[#d9e3f7]">"r":</strong> {String(activeDebugPayload.orders[0]?.r)} (Reduce-Only flag)
            </div>

            <pre className="mt-3 p-3 bg-[#050f1c] rounded border border-[#212a39] text-[#57dea3] text-[10.5px] leading-relaxed overflow-x-auto max-h-56 font-mono">
              {JSON.stringify(activeDebugPayload, null, 2)}
            </pre>

            <button
              onClick={() => setShowPayloadModal(false)}
              className="w-full mt-4 py-2 bg-[#d4af37] text-[#091421] font-bold rounded text-xs"
            >
              CLOSE INSPECTOR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
