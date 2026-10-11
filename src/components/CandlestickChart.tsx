import React, { useState, useRef, useEffect } from 'react';
import { Candle, CryptoPair, DrawingElement, IndicatorSettings } from '../types';
import { 
  Sliders, 
  Eye, 
  TrendingUp, 
  Crosshair, 
  Zap, 
  Minus, 
  TrendingDown, 
  Trash2, 
  Maximize2, 
  LineChart, 
  CandlestickChart as CandleIcon,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface CandlestickChartProps {
  pair: CryptoPair;
  candles: Candle[];
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
  onOpenOrderModal?: (action: 'BUY' | 'SELL', price?: number) => void;
  livePriceTickDirection?: 'UP' | 'DOWN' | 'NEUTRAL';
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  pair,
  candles,
  timeframe,
  onChangeTimeframe,
  onOpenOrderModal,
  livePriceTickDirection = 'NEUTRAL',
}) => {
  // Indicator Visibility States
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showEMA9: true,
    showEMA21: true,
    showEMA50: false,
    showEMA200: false,
    showVWAP: true,
    showBB: true,
    showRSI: true,
    showMACD: false,
    showSupertrend: false,
    showVolume: true,
  });

  const [algoEngineActive, setAlgoEngineActive] = useState(true);
  const [chartMode, setChartMode] = useState<'CANDLE' | 'LINE'>('CANDLE');
  const [activeTool, setActiveTool] = useState<'cursor' | 'crosshair' | 'hLine' | 'longPos'>('crosshair');
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1D'];

  const currentCandle = candles[candles.length - 1] || {
    open: pair.price,
    high: pair.price,
    low: pair.price,
    close: pair.price,
    volume: 10,
    time: 'Now',
    timestamp: Date.now()
  };

  // Dimensions
  const svgWidth = 860;
  const mainChartHeight = indicators.showRSI ? 270 : 340;
  const rsiHeight = indicators.showRSI ? 80 : 0;
  const totalSvgHeight = mainChartHeight + rsiHeight;
  const padding = { top: 25, right: 95, bottom: 25, left: 20 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = mainChartHeight - padding.top - padding.bottom;

  // Dynamic TP and SL scaled to this pair's price
  const isBtc = pair.symbol.includes('BTC');
  const entryPrice = isBtc ? 8390400 : currentCandle.close * 0.995;
  const tpPrice = isBtc ? 8630000 : currentCandle.close * 1.03;
  const slPrice = isBtc ? 8310000 : currentCandle.close * 0.985;

  // Price bounds
  const prices = candles.flatMap(c => [
    c.low,
    c.high,
    c.ema9 || c.close,
    c.ema21 || c.close,
    indicators.showEMA50 && c.ema50 ? c.ema50 : c.close,
    indicators.showBB && c.bbUpper ? c.bbUpper : c.high,
    indicators.showBB && c.bbLower ? c.bbLower : c.low,
    algoEngineActive ? tpPrice : c.high,
    algoEngineActive ? slPrice : c.low,
    ...drawings.map(d => d.price1),
  ]).filter(p => !isNaN(p) && p > 0);

  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (price: number) => {
    return padding.top + chartH - ((price - minPrice) / priceRange) * chartH;
  };

  const candleSpacing = chartW / (candles.length + 1);
  const candleWidth = Math.max(8, Math.min(22, candleSpacing * 0.6));

  const candlePositions = candles.map((c, i) => ({
    candle: c,
    x: padding.left + (i + 1) * candleSpacing,
    yOpen: getY(c.open),
    yClose: getY(c.close),
    yHigh: getY(c.high),
    yLow: getY(c.low),
  }));

  // Max volume for volume bars
  const maxVol = Math.max(...candles.map(c => c.volume)) || 1;

  // Paths
  const ema9Path = candles
    .filter(c => c.ema9)
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getY(c.ema9!)}`)
    .join(' ');

  const ema21Path = candles
    .filter(c => c.ema21)
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getY(c.ema21!)}`)
    .join(' ');

  const ema50Path = candles
    .filter(c => c.ema50)
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getY(c.ema50!)}`)
    .join(' ');

  const vwapPath = candles
    .filter(c => c.vwap)
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getY(c.vwap!)}`)
    .join(' ');

  const lineChartPath = candles
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getY(c.close)}`)
    .join(' ');

  // Bollinger Bands
  const bbUpperPoints = candles.filter(c => c.bbUpper).map((c, i) => ({
    x: padding.left + (i + 1) * candleSpacing,
    y: getY(c.bbUpper!)
  }));
  const bbLowerPoints = candles.filter(c => c.bbLower).map((c, i) => ({
    x: padding.left + (i + 1) * candleSpacing,
    y: getY(c.bbLower!)
  }));
  let bbAreaPath = '';
  if (bbUpperPoints.length && bbLowerPoints.length) {
    const fwd = bbUpperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const bwd = [...bbLowerPoints].reverse().map(p => `L ${p.x} ${p.y}`).join(' ');
    bbAreaPath = `${fwd} ${bwd} Z`;
  }

  // RSI Path (0 to 100 scaled into rsiHeight)
  const rsiYBase = mainChartHeight;
  const rsiH = rsiHeight - 15;
  const getRsiY = (rsiVal: number) => {
    return rsiYBase + rsiH - (rsiVal / 100) * rsiH;
  };
  const rsiPath = candles
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${padding.left + (i + 1) * candleSpacing} ${getRsiY(c.rsi || 50)}`)
    .join(' ');

  // Current Live Market Price Y
  const currentPriceY = getY(pair.price);

  // Cross candle & signal marker
  const crossIndex = candles.findIndex(c => c.signal === 'BUY' || c.time.includes('Cross'));
  const entryCandle = crossIndex !== -1 ? candlePositions[crossIndex] : candlePositions[Math.max(0, candlePositions.length - 4)];
  const yEntry = getY(entryPrice);
  const yTP = getY(tpPrice);
  const ySL = getY(slPrice);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    setMousePos({ x: clientX, y: clientY });

    let closest = candlePositions[0];
    let minDist = 99999;
    candlePositions.forEach(cp => {
      const dist = Math.abs(cp.x - clientX);
      if (dist < minDist) {
        minDist = dist;
        closest = cp;
      }
    });

    if (minDist < candleSpacing * 0.9) {
      setHoveredCandle(closest.candle);
    } else {
      setHoveredCandle(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'hLine' && mousePos) {
      // Calculate clicked price
      const priceAtY = minPrice + ((padding.top + chartH - mousePos.y) / chartH) * priceRange;
      const newDrawing: DrawingElement = {
        id: `hline_${Date.now()}`,
        type: 'hLine',
        price1: Math.round(priceAtY),
        color: '#f2ca50',
        label: `Support/Resistance @ ${pair.currencyPrefix}${Math.round(priceAtY).toLocaleString('en-IN')}`
      };
      setDrawings([...drawings, newDrawing]);
      setActiveTool('crosshair');
    }
  };

  // Grid steps
  const gridSteps = 5;
  const gridPrices = Array.from({ length: gridSteps }).map((_, i) => {
    const p = minPrice + (priceRange / (gridSteps - 1)) * i;
    return {
      price: Math.round(p),
      y: getY(p)
    };
  });

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded overflow-hidden flex flex-col select-none">
      {/* Chart Top Toolbar */}
      <div className="bg-[#16202e] border-b border-[#212a39] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Left: Symbol & Timeframe selectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm text-[#f0f4f8]">{pair.symbol}</span>
            <span className="text-[10px] bg-[#212a39] text-[#f2ca50] font-semibold px-1.5 py-0.5 rounded">
              COINDCX {pair.quote}
            </span>
          </div>

          <div className="flex items-center bg-[#091421] border border-[#212a39] rounded p-0.5 ml-2">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onChangeTimeframe(tf)}
                className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#d4af37] text-[#091421] font-bold'
                    : 'text-[#8a94a6] hover:text-[#d9e3f7]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-[#091421] border border-[#212a39] rounded p-0.5 ml-1">
            <button
              onClick={() => setChartMode('CANDLE')}
              className={`p-1 rounded text-[10px] ${chartMode === 'CANDLE' ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'}`}
              title="Candlestick Chart"
            >
              <CandleIcon className="w-3 h-3" />
            </button>
            <button
              onClick={() => setChartMode('LINE')}
              className={`p-1 rounded text-[10px] ${chartMode === 'LINE' ? 'bg-[#1c2331] text-[#f2ca50]' : 'text-[#8a94a6]'}`}
              title="Line Chart"
            >
              <LineChart className="w-3 h-3" />
            </button>
          </div>

          {/* Indicators Button */}
          <button
            onClick={() => setShowIndicatorModal(true)}
            className="px-2 py-0.5 rounded bg-[#091421] border border-[#212a39] hover:border-[#f2ca50] text-[#d9e3f7] hover:text-[#f2ca50] text-[10.5px] font-semibold flex items-center gap-1 ml-2 transition-colors"
          >
            <PlusCircle className="w-3 h-3 text-[#f2ca50]" />
            <span>INDICATORS ({Object.values(indicators).filter(Boolean).length})</span>
          </button>
        </div>

        {/* Right: Engine Switch & Active Indicator Pills */}
        <div className="flex items-center gap-2">
          {/* Quick Active Indicators Pills */}
          <div className="hidden xl:flex items-center gap-1 text-[10px]">
            {indicators.showEMA9 && (
              <span className="px-1.5 py-0.5 rounded bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 font-semibold">
                EMA 9
              </span>
            )}
            {indicators.showEMA21 && (
              <span className="px-1.5 py-0.5 rounded bg-[#57dea3]/15 text-[#57dea3] border border-[#57dea3]/30 font-semibold">
                EMA 21
              </span>
            )}
            {indicators.showVWAP && (
              <span className="px-1.5 py-0.5 rounded bg-[#d9e3f7]/15 text-[#d9e3f7] border border-[#d9e3f7]/30 font-semibold">
                VWAP
              </span>
            )}
            {indicators.showRSI && (
              <span className="px-1.5 py-0.5 rounded bg-[#ff959a]/15 text-[#ff959a] border border-[#ff959a]/30 font-semibold">
                RSI(14): {currentCandle.rsi || 54}
              </span>
            )}
          </div>

          <button
            onClick={() => setAlgoEngineActive(!algoEngineActive)}
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
              algoEngineActive
                ? 'bg-[#1c2331] text-[#f2ca50] border-[#d4af37]/50 shadow-sm'
                : 'bg-[#091421] text-[#8a94a6] border-[#212a39]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${algoEngineActive ? 'text-[#f2ca50] fill-[#f2ca50]' : 'text-[#8a94a6]'}`} />
            <span>ALGOPULSE SIGNAL ENGINE</span>
          </button>
        </div>
      </div>

      {/* Drawing Tools Sub-bar */}
      <div className="bg-[#0e1622] border-b border-[#212a39] px-3 py-1 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#8a94a6] uppercase font-bold mr-1">Tools:</span>
          <button
            onClick={() => setActiveTool('crosshair')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              activeTool === 'crosshair' ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40' : 'text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Crosshair</span>
          </button>

          <button
            onClick={() => setActiveTool('hLine')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
              activeTool === 'hLine' ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 font-bold' : 'text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
            title="Click anywhere on chart to place a horizontal Support/Resistance line"
          >
            <Minus className="w-3 h-3" />
            <span>Horizontal Line {activeTool === 'hLine' ? '(Click to Place)' : ''}</span>
          </button>

          {drawings.length > 0 && (
            <button
              onClick={() => setDrawings([])}
              className="px-2 py-0.5 rounded text-[#ffdad6] hover:bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-center gap-1 ml-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Drawings ({drawings.length})</span>
            </button>
          )}
        </div>

        <div className="text-[10px] text-[#8a94a6]">
          Live CoinDCX Feed: <strong className="text-[#2ebd85]">Streaming Ticks</strong>
        </div>
      </div>

      {/* Chart Telemetry & Live Price Bar */}
      <div className="px-3 py-2 bg-[#091421] border-b border-[#212a39] flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-baseline gap-3">
          {/* Dynamic live price with pulse effect on tick! */}
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-2xl font-bold tracking-tight tabular-nums transition-colors duration-300 ${
                livePriceTickDirection === 'UP'
                  ? 'text-[#2ebd85]'
                  : livePriceTickDirection === 'DOWN'
                  ? 'text-[#f6465d]'
                  : 'text-[#f0f4f8]'
              }`}
            >
              {pair.currencyPrefix}{pair.price.toLocaleString('en-IN', { maximumFractionDigits: pair.price < 100 ? 4 : 2 })}
            </span>
            <span
              className={`text-xs font-bold tabular-nums ${
                pair.change24h >= 0 ? 'text-[#2ebd85]' : 'text-[#f6465d]'
              }`}
            >
              {pair.change24h >= 0 ? `+${pair.change24h}%` : `${pair.change24h}%`}
            </span>
          </div>

          {/* Current Candle OHLC values */}
          <div className="text-[11px] text-[#8a94a6] flex items-center gap-2 tabular-nums">
            <span>O: <strong className="text-[#d9e3f7] font-normal">{currentCandle.open.toLocaleString('en-IN')}</strong></span>
            <span>H: <strong className="text-[#2ebd85] font-normal">{currentCandle.high.toLocaleString('en-IN')}</strong></span>
            <span>L: <strong className="text-[#f6465d] font-normal">{currentCandle.low.toLocaleString('en-IN')}</strong></span>
            <span>C: <strong className="text-[#2ebd85] font-normal">{currentCandle.close.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Algo Signal Trigger Strip */}
        {algoEngineActive && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2ebd85]/15 border border-[#2ebd85]/40 text-[#2ebd85] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ebd85] animate-pulse"></span>
              <span>LIVE BUY TRIGGER ACTIVE</span>
            </div>

            <span className="text-[10px] text-[#8a94a6] hidden xl:inline">
              STRATEGY TRIGGER: <strong className="text-[#d9e3f7]">EMA 9/21 BULL CROSS • CANDLE CLOSE CONFIRMED</strong>
            </span>

            <div className="px-2 py-0.5 rounded bg-[#1c2331] border border-[#2ebd85]/30 text-[10px] text-[#2ebd85] font-medium flex items-center gap-1">
              <span>Target 1:3</span>
              <span className="text-[#8a94a6]">|</span>
              <span className="font-bold">
                TP: {pair.currencyPrefix}{tpPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      <div 
        ref={containerRef}
        className="relative w-full h-[380px] bg-[#091421] cursor-crosshair overflow-hidden"
      >
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleChartClick}
        >
          <defs>
            <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ebd85" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2ebd85" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2ca50" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f2ca50" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridPrices.map((gp, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={gp.y}
                x2={svgWidth - padding.right}
                y2={gp.y}
                stroke="#1c2331"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={svgWidth - padding.right + 8}
                y={gp.y + 3}
                fill="#8a94a6"
                fontSize="10"
                fontFamily="JetBrains Mono"
                className="tabular-nums"
              >
                {pair.currencyPrefix}{gp.price.toLocaleString('en-IN')}
              </text>
            </g>
          ))}

          {/* Volume Profile Bars at bottom of main chart */}
          {indicators.showVolume && (
            <g opacity="0.3">
              {candlePositions.map((cp, idx) => {
                const volH = (cp.candle.volume / maxVol) * 45;
                const isGreen = cp.candle.close >= cp.candle.open;
                return (
                  <rect
                    key={idx}
                    x={cp.x - candleWidth / 2}
                    y={mainChartHeight - padding.bottom - volH}
                    width={candleWidth}
                    height={volH}
                    fill={isGreen ? '#2ebd85' : '#f6465d'}
                    rx="1"
                  />
                );
              })}
            </g>
          )}

          {/* Bollinger Band channel fill */}
          {indicators.showBB && bbAreaPath && (
            <path d={bbAreaPath} fill="url(#bbGrad)" />
          )}

          {/* Bollinger Band borders */}
          {indicators.showBB && (
            <>
              {bbUpperPoints.length > 0 && (
                <path
                  d={bbUpperPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2ebd85"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="2 2"
                />
              )}
              {bbLowerPoints.length > 0 && (
                <path
                  d={bbLowerPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  fill="none"
                  stroke="#2ebd85"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="2 2"
                />
              )}
            </>
          )}

          {/* VWAP Line */}
          {indicators.showVWAP && (
            <path
              d={vwapPath}
              fill="none"
              stroke="#d9e3f7"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              strokeOpacity="0.6"
            />
          )}

          {/* EMA 50 Line */}
          {indicators.showEMA50 && (
            <path
              d={ema50Path}
              fill="none"
              stroke="#9d7cf7"
              strokeWidth="1.6"
            />
          )}

          {/* EMA 21 Line */}
          {indicators.showEMA21 && (
            <path
              d={ema21Path}
              fill="none"
              stroke="#57dea3"
              strokeWidth="1.8"
            />
          )}

          {/* EMA 9 Line */}
          {indicators.showEMA9 && (
            <path
              d={ema9Path}
              fill="none"
              stroke="#f2ca50"
              strokeWidth="2"
            />
          )}

          {/* Line Chart Area or Candlesticks */}
          {chartMode === 'LINE' ? (
            <g>
              <path
                d={`${lineChartPath} L ${candlePositions[candlePositions.length - 1]?.x || 0} ${mainChartHeight - padding.bottom} L ${candlePositions[0]?.x || 0} ${mainChartHeight - padding.bottom} Z`}
                fill="url(#chartAreaGrad)"
              />
              <path
                d={lineChartPath}
                fill="none"
                stroke="#f2ca50"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            candlePositions.map((cp, idx) => {
              const isGreen = cp.candle.close >= cp.candle.open;
              const bodyY = isGreen ? cp.yClose : cp.yOpen;
              const bodyH = Math.max(2, Math.abs(cp.yClose - cp.yOpen));
              const color = isGreen ? '#2ebd85' : '#f6465d';

              return (
                <g key={idx}>
                  {/* Wick */}
                  <line
                    x1={cp.x}
                    y1={cp.yHigh}
                    x2={cp.x}
                    y2={cp.yLow}
                    stroke={color}
                    strokeWidth="1.5"
                  />
                  {/* Body */}
                  <rect
                    x={cp.x - candleWidth / 2}
                    y={bodyY}
                    width={candleWidth}
                    height={bodyH}
                    fill={color}
                    rx="1"
                  />
                  {/* Time label on x-axis */}
                  <text
                    x={cp.x}
                    y={mainChartHeight - 8}
                    fill={cp.candle.time.includes('Cross') ? '#f2ca50' : '#8a94a6'}
                    fontSize="9.5"
                    fontWeight={cp.candle.time.includes('Cross') ? 'bold' : 'normal'}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {cp.candle.time.replace(' (Cross)', '').replace(' (Now)', '')}
                  </text>
                </g>
              );
            })
          )}

          {/* Institutional Algo Trigger Overlay (Entry, TP line, SL line) */}
          {algoEngineActive && entryCandle && (
            <g>
              {/* Take Profit (TP) Line */}
              <line
                x1={entryCandle.x}
                y1={yTP}
                x2={svgWidth - padding.right}
                y2={yTP}
                stroke="#2ebd85"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x={svgWidth - padding.right - 180}
                y={yTP - 18}
                width="170"
                height="16"
                fill="#16202e"
                stroke="#2ebd85"
                strokeWidth="0.8"
                rx="2"
              />
              <text
                x={svgWidth - padding.right - 95}
                y={yTP - 6}
                fill="#2ebd85"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                TP (1:3): {pair.currencyPrefix}{tpPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </text>

              {/* Stop Loss (SL) Line */}
              <line
                x1={entryCandle.x}
                y1={ySL}
                x2={svgWidth - padding.right}
                y2={ySL}
                stroke="#f6465d"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x={svgWidth - padding.right - 180}
                y={ySL + 3}
                width="170"
                height="16"
                fill="#16202e"
                stroke="#f6465d"
                strokeWidth="0.8"
                rx="2"
              />
              <text
                x={svgWidth - padding.right - 95}
                y={ySL + 15}
                fill="#f6465d"
                fontSize="9.5"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                SL: {pair.currencyPrefix}{slPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </text>

              {/* Entry Anchor Marker */}
              <circle
                cx={entryCandle.x}
                cy={yEntry}
                r="6"
                fill="#091421"
                stroke="#2ebd85"
                strokeWidth="2.5"
              />
              <circle cx={entryCandle.x} cy={yEntry} r="2" fill="#2ebd85" />
              <g transform={`translate(${entryCandle.x + 10}, ${yEntry - 10})`}>
                <rect
                  x="0"
                  y="0"
                  width="155"
                  height="20"
                  fill="#1c2331"
                  stroke="#2ebd85"
                  strokeWidth="1"
                  rx="3"
                />
                <circle cx="10" cy="10" r="3" fill="#2ebd85" />
                <text
                  x="18"
                  y="14"
                  fill="#2ebd85"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                >
                  BUY ENTRY @ {pair.currencyPrefix}{entryPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </text>
              </g>
            </g>
          )}

          {/* User Drawings (Horizontal support & resistance lines) */}
          {drawings.map(d => {
            const dy = getY(d.price1);
            return (
              <g key={d.id}>
                <line
                  x1={padding.left}
                  y1={dy}
                  x2={svgWidth - padding.right}
                  y2={dy}
                  stroke={d.color}
                  strokeWidth="1.5"
                  strokeDasharray="5 3"
                />
                <rect
                  x={svgWidth - padding.right - 160}
                  y={dy - 16}
                  width="155"
                  height="16"
                  fill="#1c2331"
                  stroke={d.color}
                  strokeWidth="0.8"
                  rx="2"
                />
                <text
                  x={svgWidth - padding.right - 82}
                  y={dy - 4}
                  fill={d.color}
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* LIVE TICKING MARKET PRICE HORIZONTAL LINE */}
          <line
            x1={padding.left}
            y1={currentPriceY}
            x2={svgWidth - padding.right}
            y2={currentPriceY}
            stroke="#2ebd85"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            opacity="0.9"
          />
          {/* Live Price Tag on Right Axis */}
          <g transform={`translate(${svgWidth - padding.right + 4}, ${currentPriceY - 9})`}>
            <rect
              x="0"
              y="0"
              width="85"
              height="18"
              fill="#2ebd85"
              rx="2"
            />
            <text
              x="42"
              y="13"
              fill="#091421"
              fontSize="10"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
              textAnchor="middle"
            >
              {pair.currencyPrefix}{pair.price.toLocaleString('en-IN', { maximumFractionDigits: pair.price < 100 ? 2 : 0 })}
            </text>
          </g>

          {/* RSI Sub-Chart Panel (If enabled) */}
          {indicators.showRSI && (
            <g>
              {/* Divider */}
              <line
                x1={padding.left}
                y1={mainChartHeight}
                x2={svgWidth - padding.right}
                y2={mainChartHeight}
                stroke="#212a39"
                strokeWidth="1.5"
              />
              {/* Overbought 70 Line */}
              <line
                x1={padding.left}
                y1={getRsiY(70)}
                x2={svgWidth - padding.right}
                y2={getRsiY(70)}
                stroke="#f6465d"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text x={svgWidth - padding.right + 6} y={getRsiY(70) + 3} fill="#f6465d" fontSize="9" fontFamily="JetBrains Mono">70</text>

              {/* Oversold 30 Line */}
              <line
                x1={padding.left}
                y1={getRsiY(30)}
                x2={svgWidth - padding.right}
                y2={getRsiY(30)}
                stroke="#2ebd85"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text x={svgWidth - padding.right + 6} y={getRsiY(30) + 3} fill="#2ebd85" fontSize="9" fontFamily="JetBrains Mono">30</text>

              {/* RSI Line */}
              <path
                d={rsiPath}
                fill="none"
                stroke="#ff959a"
                strokeWidth="1.8"
              />
              <text
                x={padding.left + 5}
                y={mainChartHeight + 14}
                fill="#ff959a"
                fontSize="10"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                RSI (14): {currentCandle.rsi || 54.2}
              </text>
            </g>
          )}

          {/* Crosshair Cursor Tracking */}
          {mousePos && (
            <g>
              <line
                x1={padding.left}
                y1={mousePos.y}
                x2={svgWidth - padding.right}
                y2={mousePos.y}
                stroke="#f2ca50"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <line
                x1={mousePos.x}
                y1={padding.top}
                x2={mousePos.x}
                y2={totalSvgHeight - padding.bottom}
                stroke="#f2ca50"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.7"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredCandle && (
          <div className="absolute top-2 left-3 bg-[#16202e]/95 backdrop-blur border border-[#212a39] px-3 py-1.5 rounded text-[11px] font-mono shadow-xl flex items-center gap-3 pointer-events-none">
            <span className="text-[#f2ca50] font-bold">{hoveredCandle.time}</span>
            <div className="flex items-center gap-2 tabular-nums">
              <span>O: <strong className="text-[#d9e3f7] font-normal">{hoveredCandle.open.toLocaleString('en-IN')}</strong></span>
              <span>H: <strong className="text-[#2ebd85] font-normal">{hoveredCandle.high.toLocaleString('en-IN')}</strong></span>
              <span>L: <strong className="text-[#f6465d] font-normal">{hoveredCandle.low.toLocaleString('en-IN')}</strong></span>
              <span>C: <strong className="text-[#2ebd85] font-normal">{hoveredCandle.close.toLocaleString('en-IN')}</strong></span>
              <span>Vol: <strong className="text-[#d9e3f7] font-normal">{hoveredCandle.volume}</strong></span>
            </div>
            {hoveredCandle.rsi && (
              <span className="text-[#ff959a] font-semibold">RSI: {hoveredCandle.rsi}</span>
            )}
          </div>
        )}
      </div>

      {/* Quick Execution Dock Bottom Bar */}
      <div className="bg-[#16202e] border-t border-[#212a39] px-3 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3 text-[11px] text-[#8a94a6]">
          <span>STRATEGY STATE: <strong className="text-[#2ebd85]">POSITION ARMED (1X LEVERAGE)</strong></span>
          <span className="text-[#212a39]">|</span>
          <span>EST. COINDCX SLIPPAGE: <strong className="text-[#d9e3f7]">0.02%</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenOrderModal && onOpenOrderModal('BUY', pair.price)}
            className="px-3 py-1 bg-[#2ebd85] hover:bg-[#26a673] text-[#091421] font-bold text-xs rounded transition-colors active:scale-95 shadow-sm"
          >
            QUICK BUY (MARKET)
          </button>
          <button
            onClick={() => onOpenOrderModal && onOpenOrderModal('SELL', pair.price)}
            className="px-3 py-1 bg-[#f6465d] hover:bg-[#df3a50] text-[#f0f4f8] font-bold text-xs rounded transition-colors active:scale-95 shadow-sm"
          >
            QUICK SELL (MARKET)
          </button>
        </div>
      </div>

      {/* Indicator Addition Modal */}
      {showIndicatorModal && (
        <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-md w-full p-4 shadow-2xl font-mono text-xs select-none">
            <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
              <span className="font-display font-bold text-sm text-[#f0f4f8]">
                Technical Indicators & Overlays
              </span>
              <button onClick={() => setShowIndicatorModal(false)} className="text-[#8a94a6] hover:text-[#f0f4f8]">✕</button>
            </div>

            <div className="mt-3 space-y-2">
              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#f2ca50]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50]"></span>
                  <span className="font-semibold text-[#f0f4f8]">EMA 9 (Fast Exponential Moving Average)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showEMA9}
                  onChange={(e) => setIndicators({ ...indicators, showEMA9: e.target.checked })}
                  className="rounded accent-[#f2ca50]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#57dea3]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#57dea3]"></span>
                  <span className="font-semibold text-[#f0f4f8]">EMA 21 (Medium Trend Filter)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showEMA21}
                  onChange={(e) => setIndicators({ ...indicators, showEMA21: e.target.checked })}
                  className="rounded accent-[#57dea3]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#9d7cf7]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9d7cf7]"></span>
                  <span className="font-semibold text-[#f0f4f8]">EMA 50 (Macro Structural Trend)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showEMA50}
                  onChange={(e) => setIndicators({ ...indicators, showEMA50: e.target.checked })}
                  className="rounded accent-[#9d7cf7]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#d9e3f7]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d9e3f7]"></span>
                  <span className="font-semibold text-[#f0f4f8]">VWAP (Volume-Weighted Average Price)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showVWAP}
                  onChange={(e) => setIndicators({ ...indicators, showVWAP: e.target.checked })}
                  className="rounded accent-[#d9e3f7]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#2ebd85]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ebd85]"></span>
                  <span className="font-semibold text-[#f0f4f8]">Bollinger Bands (20, 2.0 Sigma)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showBB}
                  onChange={(e) => setIndicators({ ...indicators, showBB: e.target.checked })}
                  className="rounded accent-[#2ebd85]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#ff959a]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff959a]"></span>
                  <span className="font-semibold text-[#f0f4f8]">RSI (14) Relative Strength Oscillator</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showRSI}
                  onChange={(e) => setIndicators({ ...indicators, showRSI: e.target.checked })}
                  className="rounded accent-[#ff959a]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#091421] border border-[#212a39] cursor-pointer hover:border-[#8a94a6]/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8a94a6]"></span>
                  <span className="font-semibold text-[#f0f4f8]">Volume Profile Bars (Sub-Chart)</span>
                </div>
                <input
                  type="checkbox"
                  checked={indicators.showVolume}
                  onChange={(e) => setIndicators({ ...indicators, showVolume: e.target.checked })}
                  className="rounded accent-[#8a94a6]"
                />
              </label>
            </div>

            <button
              onClick={() => setShowIndicatorModal(false)}
              className="w-full mt-4 py-2 bg-[#d4af37] text-[#091421] font-bold rounded text-xs"
            >
              APPLY INDICATORS TO CHART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
