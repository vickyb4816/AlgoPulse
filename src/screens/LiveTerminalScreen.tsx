import React, { useState } from 'react';
import { 
  CryptoPair, 
  Candle, 
  Position, 
  OrderBookItem,
  HyperliquidAsset
} from '../types';
import { CandlestickChart } from '../components/CandlestickChart';
import { LightweightTradingChart } from '../components/LightweightTradingChart';
import { CoinDCXOrderDock } from '../components/CoinDCXOrderDock';
import { OrderBook } from '../components/OrderBook';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Sliders, 
  Shield, 
  Zap, 
  TrendingUp, 
  Check, 
  Radio,
  Search,
  Key
} from 'lucide-react';

interface LiveTerminalScreenProps {
  pair: CryptoPair;
  pairs: CryptoPair[];
  onSelectPair: (p: CryptoPair) => void;
  candles: Candle[];
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
  orderBook: { asks: OrderBookItem[]; bids: OrderBookItem[] };
  positions: Position[];
  availableCash: number;
  isKeyVerified: boolean;
  onOpenConnectModal: () => void;
  onPlaceOrder: (order: {
    pair: string;
    action: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LOSS';
    price: number;
    quantity: number;
    leverage: number;
    isCross: boolean;
    totalAmount: number;
  }) => void;
  onClosePosition: (id: string) => void;
  livePriceTickDirection?: 'UP' | 'DOWN' | 'NEUTRAL';
  activeMarketType?: 'SPOT' | 'FUTURES';
  onChangeMarketType?: (type: 'SPOT' | 'FUTURES') => void;
}

export const LiveTerminalScreen: React.FC<LiveTerminalScreenProps> = ({
  pair,
  pairs,
  onSelectPair,
  candles,
  timeframe,
  onChangeTimeframe,
  orderBook,
  positions,
  availableCash,
  isKeyVerified,
  onOpenConnectModal,
  onPlaceOrder,
  onClosePosition,
  livePriceTickDirection = 'NEUTRAL',
  activeMarketType = 'SPOT',
  onChangeMarketType,
}) => {
  const [chartEngine, setChartEngine] = useState<'LIGHTWEIGHT' | 'CANVAS'>('LIGHTWEIGHT');
  const [bottomTab, setBottomTab] = useState<'POSITIONS' | 'MARKETS'>('POSITIONS');
  const [search, setSearch] = useState('');

  const filteredPairs = pairs.filter((p) =>
    p.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-3 pb-8 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Top Asset & Engine Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between bg-[#050f1c] p-2 rounded border border-[#212a39] gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-[#8a94a6] uppercase font-bold px-1">CoinDCX Feed:</span>
          {pairs.slice(0, 8).map((p) => {
            const isSelected = p.symbol === pair.symbol;
            const isPositive = p.change24h >= 0;

            return (
              <button
                key={p.symbol}
                onClick={() => onSelectPair(p)}
                className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 font-bold'
                    : 'text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#121c2a]'
                }`}
              >
                <span>{p.symbol}</span>
                <span className={isPositive ? 'text-[#2ebd85]' : 'text-[#f6465d]'}>
                  {isPositive ? `+${p.change24h}%` : `${p.change24h}%`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Chart Engine Switcher */}
          <div className="flex bg-[#091421] p-0.5 rounded border border-[#212a39]">
            <button
              onClick={() => setChartEngine('LIGHTWEIGHT')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'LIGHTWEIGHT' ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
              }`}
            >
              TradingView Lightweight
            </button>
            <button
              onClick={() => setChartEngine('CANVAS')}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                chartEngine === 'CANVAS' ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'
              }`}
            >
              Canvas Multi-Tool
            </button>
          </div>

          {!isKeyVerified && (
            <button
              onClick={onOpenConnectModal}
              className="px-2.5 py-1 bg-[#f2ca50] hover:bg-[#d4af37] text-[#091421] rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>CONNECT API KEY</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Chart + Order Dock + Order Book */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Left Column (8 cols): Chart + Bottom Tabs */}
        <div className="xl:col-span-8 flex flex-col gap-3">
          {/* Chart View (TradingView Lightweight or Canvas Multi-Tool) */}
          {chartEngine === 'LIGHTWEIGHT' ? (
            <LightweightTradingChart
              asset={{
                name: pair.base,
                assetIndex: 0,
                szDecimals: pair.price > 1000 ? 4 : 2,
                maxLeverage: pair.maxLeverage || 20,
                markPx: pair.price,
                midPx: pair.price,
                prevDayPx: pair.price * 0.98,
                dayNtlVlm: 100000000,
                funding: pair.fundingRate || 0.0001,
                openInterest: 50000000,
                marketType: 'PERP'
              }}
              candles={candles}
              timeframe={timeframe}
              onChangeTimeframe={onChangeTimeframe}
              onQuickLong={() => {}}
              onQuickShort={() => {}}
              liveMidPrice={pair.price}
            />
          ) : (
            <CandlestickChart
              pair={pair}
              candles={candles}
              timeframe={timeframe}
              onChangeTimeframe={onChangeTimeframe}
              livePriceTickDirection={livePriceTickDirection}
            />
          )}

          {/* Bottom Multi-Tab Deck (Positions / CoinDCX Markets) */}
          <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBottomTab('POSITIONS')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    bottomTab === 'POSITIONS' ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40' : 'text-[#8a94a6]'
                  }`}
                >
                  Active Positions ({positions.length})
                </button>
                <button
                  onClick={() => setBottomTab('MARKETS')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    bottomTab === 'MARKETS' ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40' : 'text-[#8a94a6]'
                  }`}
                >
                  All CoinDCX Markets ({pairs.length})
                </button>
              </div>

              <span className="text-[10px] text-[#2ebd85] font-semibold flex items-center gap-1">
                <Radio className={`w-3 h-3 ${isKeyVerified ? 'text-[#2ebd85] animate-pulse' : 'text-[#8a94a6]'}`} />
                <span>{isKeyVerified ? 'CoinDCX Gateway Connected' : 'Exchange Unconnected'}</span>
              </span>
            </div>

            {/* Tab 1: Positions Table */}
            {bottomTab === 'POSITIONS' && (
              <div className="mt-2.5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] text-[#8a94a6] border-b border-[#212a39]/70 pb-1 uppercase tracking-wider">
                      <th className="py-1">Symbol</th>
                      <th className="py-1">Side / Mode</th>
                      <th className="py-1">Position Size</th>
                      <th className="py-1">Entry Price</th>
                      <th className="py-1">Mark Price</th>
                      <th className="py-1">Est. Liq Price</th>
                      <th className="py-1">Unrealized PnL</th>
                      <th className="py-1 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212a39]/40 tabular-nums">
                    {positions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-[#8a94a6]">
                          No open positions. Use the CoinDCX Order Dock on the right to open Long or Short trades.
                        </td>
                      </tr>
                    ) : (
                      positions.map((pos) => {
                        const isShort = pos.type === 'SHORT';
                        const isProfit = pos.pnl >= 0;
                        const prefix = pos.pair.includes('USDT') || pos.pair.includes('FUT') ? '$' : '₹';

                        return (
                          <tr key={pos.id} className="hover:bg-[#16202e] transition-colors">
                            <td className="py-2.5 font-bold text-[#f0f4f8]">{pos.pair}</td>
                            <td className="py-2.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  isShort
                                    ? 'bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/40'
                                    : 'bg-[#2ebd85]/20 text-[#2ebd85] border border-[#2ebd85]/40'
                                }`}
                              >
                                {pos.type} {pos.leverage}X ({pos.isCross ? 'Cross' : 'Isolated'})
                              </span>
                            </td>
                            <td className="py-2.5">{pos.quantity}</td>
                            <td className="py-2.5">{prefix}{pos.entryPrice.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 font-semibold">{prefix}{pos.currentPrice.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 text-[#f6465d] font-bold">
                              {pos.liquidationPrice > 0 ? `${prefix}${pos.liquidationPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'None'}
                            </td>
                            <td className={`py-2.5 font-bold ${isProfit ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                              {isProfit ? '+' : ''}{prefix}{pos.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({isProfit ? '+' : ''}{pos.pnlPercent}%)
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => onClosePosition(pos.id)}
                                className="px-2.5 py-1 rounded bg-[#93000a]/40 hover:bg-[#93000a] text-[#ffdad6] text-[10px] font-bold border border-[#ffb4ab]/30 transition-colors cursor-pointer"
                              >
                                Close Position
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: CoinDCX Markets */}
            {bottomTab === 'MARKETS' && (
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 bg-[#091421] border border-[#212a39] px-2.5 py-1 rounded max-w-xs w-full">
                    <Search className="w-3.5 h-3.5 text-[#8a94a6]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search coins (BTC, ETH, SOL, XRP)..."
                      className="bg-transparent text-xs text-[#d9e3f7] outline-none w-full"
                    />
                  </div>
                  <span className="text-[11px] text-[#8a94a6]">Showing {filteredPairs.length} markets</span>
                </div>

                <div className="overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-[#8a94a6] border-b border-[#212a39]/70 pb-1 uppercase tracking-wider">
                        <th className="py-1">Pair</th>
                        <th className="py-1">Last Price</th>
                        <th className="py-1">24h Change</th>
                        <th className="py-1">24h High / Low</th>
                        <th className="py-1">Volume</th>
                        <th className="py-1 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#212a39]/40 tabular-nums">
                      {filteredPairs.map((p) => {
                        const isPositive = p.change24h >= 0;
                        return (
                          <tr key={p.symbol} className="hover:bg-[#16202e] transition-colors">
                            <td className="py-2 font-bold text-[#f0f4f8]">{p.symbol}</td>
                            <td className="py-2 text-[#d9e3f7]">{p.priceFormatted}</td>
                            <td className={`py-2 font-semibold ${isPositive ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                              {isPositive ? `+${p.change24h}%` : `${p.change24h}%`}
                            </td>
                            <td className="py-2 text-[#8a94a6] text-[11px]">{p.high24h} / {p.low24h}</td>
                            <td className="py-2 text-[#8a94a6]">{p.volume}</td>
                            <td className="py-2 text-right">
                              <button
                                onClick={() => onSelectPair(p)}
                                className="px-2 py-0.5 rounded bg-[#1c2331] hover:bg-[#212a39] text-[#f2ca50] border border-[#f2ca50]/30 text-[10px] font-bold cursor-pointer"
                              >
                                Trade
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): CoinDCX Order Dock + L2 Order Book */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          {/* CoinDCX Order Dock */}
          <CoinDCXOrderDock
            pair={pair}
            availableCash={availableCash}
            isKeyVerified={isKeyVerified}
            onOpenConnectModal={onOpenConnectModal}
            onExecuteOrder={onPlaceOrder}
          />

          {/* L2 Order Book */}
          <OrderBook
            pair={pair}
            asks={orderBook.asks}
            bids={orderBook.bids}
            onSelectPrice={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
