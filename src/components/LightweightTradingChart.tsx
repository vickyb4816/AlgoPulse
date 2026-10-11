import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CandlestickData, 
  LineData, 
  HistogramData,
  UTCTimestamp
} from 'lightweight-charts';
import { Candle, HyperliquidAsset } from '../types';
import { Sliders, PlusCircle, Maximize2, Zap, Settings2, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';

interface IndicatorConfig {
  ema9: { enabled: boolean; period: number; color: string; lineWidth: number };
  ema21: { enabled: boolean; period: number; color: string; lineWidth: number };
  ema50: { enabled: boolean; period: number; color: string; lineWidth: number };
  vwap: { enabled: boolean; color: string; lineWidth: number };
  volume: { enabled: boolean; upColor: string; downColor: string };
  rsi: { enabled: boolean; period: number; overbought: number; oversold: number; color: string };
}

const DEFAULT_INDICATOR_CONFIG: IndicatorConfig = {
  ema9: { enabled: true, period: 9, color: '#f2ca50', lineWidth: 2 },
  ema21: { enabled: true, period: 21, color: '#57dea3', lineWidth: 2 },
  ema50: { enabled: false, period: 50, color: '#9d7cf7', lineWidth: 2 },
  vwap: { enabled: true, color: '#e2e8f0', lineWidth: 1 },
  volume: { enabled: true, upColor: 'rgba(46, 189, 133, 0.4)', downColor: 'rgba(246, 70, 93, 0.4)' },
  rsi: { enabled: true, period: 14, overbought: 70, oversold: 30, color: '#ff959a' }
};

interface LightweightTradingChartProps {
  asset: HyperliquidAsset;
  candles: Candle[];
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
  onOpenOrderModal?: (action: 'BUY' | 'SELL', price?: number) => void;
  onQuickShort?: () => void;
  onQuickLong?: () => void;
  liveMidPrice?: number;
}

export const LightweightTradingChart: React.FC<LightweightTradingChartProps> = ({
  asset,
  candles,
  timeframe,
  onChangeTimeframe,
  onOpenOrderModal,
  onQuickShort,
  onQuickLong,
  liveMidPrice,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig>(() => {
    try {
      const saved = localStorage.getItem('hl_chart_indicator_config');
      return saved ? JSON.parse(saved) : DEFAULT_INDICATOR_CONFIG;
    } catch {
      return DEFAULT_INDICATOR_CONFIG;
    }
  });

  const timeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1D'];

  const saveConfig = (newConfig: IndicatorConfig) => {
    setIndicatorConfig(newConfig);
    try {
      localStorage.setItem('hl_chart_indicator_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  // Initialize TradingView Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const width = container.clientWidth || 800;
    const height = indicatorConfig.rsi.enabled ? 320 : 380;

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#091421' },
        textColor: '#8a94a6',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(33, 42, 57, 0.5)' },
        horzLines: { color: 'rgba(33, 42, 57, 0.5)' },
      },
      crosshair: {
        vertLine: {
          color: '#f2ca50',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#f2ca50',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
      },
      rightPriceScale: {
        borderColor: '#212a39',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.18,
        },
      },
      timeScale: {
        borderColor: '#212a39',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#2ebd85',
      downColor: '#f6465d',
      borderVisible: false,
      wickUpColor: '#2ebd85',
      wickDownColor: '#f6465d',
    });
    candleSeriesRef.current = candleSeries;

    // 2. Volume Series
    if (indicatorConfig.volume.enabled) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: indicatorConfig.volume.upColor,
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.82,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // 3. EMA 9 Line
    if (indicatorConfig.ema9.enabled) {
      ema9SeriesRef.current = chart.addSeries(LineSeries, {
        color: indicatorConfig.ema9.color,
        lineWidth: indicatorConfig.ema9.lineWidth as any,
        title: `EMA ${indicatorConfig.ema9.period}`,
      });
    }

    // 4. EMA 21 Line
    if (indicatorConfig.ema21.enabled) {
      ema21SeriesRef.current = chart.addSeries(LineSeries, {
        color: indicatorConfig.ema21.color,
        lineWidth: indicatorConfig.ema21.lineWidth as any,
        title: `EMA ${indicatorConfig.ema21.period}`,
      });
    }

    // 5. EMA 50 Line
    if (indicatorConfig.ema50.enabled) {
      ema50SeriesRef.current = chart.addSeries(LineSeries, {
        color: indicatorConfig.ema50.color,
        lineWidth: indicatorConfig.ema50.lineWidth as any,
        title: `EMA ${indicatorConfig.ema50.period}`,
      });
    }

    // 6. VWAP Line
    if (indicatorConfig.vwap.enabled) {
      vwapSeriesRef.current = chart.addSeries(LineSeries, {
        color: indicatorConfig.vwap.color,
        lineWidth: indicatorConfig.vwap.lineWidth as any,
        lineStyle: 2,
        title: 'VWAP',
      });
    }

    // Resize handler
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
      if (rsiChartRef.current && rsiContainerRef.current) {
        rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [asset.name, indicatorConfig]);

  // Secondary RSI Sub-Chart instance
  useEffect(() => {
    if (!rsiContainerRef.current || !indicatorConfig.rsi.enabled) return;

    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current = null;
    }

    const rsiContainer = rsiContainerRef.current;
    const rsiChart = createChart(rsiContainer, {
      width: rsiContainer.clientWidth || 800,
      height: 90,
      layout: {
        background: { type: ColorType.Solid, color: '#050f1c' },
        textColor: '#8a94a6',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(33, 42, 57, 0.3)' },
        horzLines: { color: 'rgba(33, 42, 57, 0.3)' },
      },
      rightPriceScale: {
        borderColor: '#212a39',
        autoScale: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#212a39',
        timeVisible: true,
        secondsVisible: false,
        visible: false, // sync with main chart
      },
    });

    rsiChartRef.current = rsiChart;

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: indicatorConfig.rsi.color,
      lineWidth: 2,
      title: `RSI (${indicatorConfig.rsi.period})`,
    });
    rsiSeriesRef.current = rsiSeries;

    // Add 70 / 30 baseline markers
    rsiSeries.createPriceLine({
      price: indicatorConfig.rsi.overbought,
      color: '#f6465d',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '70 Overbought',
    });

    rsiSeries.createPriceLine({
      price: indicatorConfig.rsi.oversold,
      color: '#2ebd85',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
      title: '30 Oversold',
    });

    return () => {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
    };
  }, [indicatorConfig.rsi.enabled, indicatorConfig.rsi.period]);

  // Feed Data into Charts
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    // Convert candles to Lightweight Charts formatted data
    const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp);
    const validData: CandlestickData<UTCTimestamp>[] = [];
    const volData: HistogramData<UTCTimestamp>[] = [];
    const ema9Data: LineData<UTCTimestamp>[] = [];
    const ema21Data: LineData<UTCTimestamp>[] = [];
    const ema50Data: LineData<UTCTimestamp>[] = [];
    const vwapData: LineData<UTCTimestamp>[] = [];
    const rsiData: LineData<UTCTimestamp>[] = [];

    sortedCandles.forEach((c) => {
      const time = Math.floor(c.timestamp / 1000) as UTCTimestamp;
      validData.push({
        time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });

      if (indicatorConfig.volume.enabled) {
        volData.push({
          time,
          value: c.volume,
          color: c.close >= c.open ? indicatorConfig.volume.upColor : indicatorConfig.volume.downColor,
        });
      }

      if (c.ema9 && indicatorConfig.ema9.enabled) {
        ema9Data.push({ time, value: c.ema9 });
      }
      if (c.ema21 && indicatorConfig.ema21.enabled) {
        ema21Data.push({ time, value: c.ema21 });
      }
      if (c.ema50 && indicatorConfig.ema50.enabled) {
        ema50Data.push({ time, value: c.ema50 });
      }
      if (c.vwap && indicatorConfig.vwap.enabled) {
        vwapData.push({ time, value: c.vwap });
      }
      if (c.rsi && indicatorConfig.rsi.enabled) {
        rsiData.push({ time, value: c.rsi });
      }
    });

    candleSeriesRef.current.setData(validData);

    if (volumeSeriesRef.current) volumeSeriesRef.current.setData(volData);
    if (ema9SeriesRef.current) ema9SeriesRef.current.setData(ema9Data);
    if (ema21SeriesRef.current) ema21SeriesRef.current.setData(ema21Data);
    if (ema50SeriesRef.current) ema50SeriesRef.current.setData(ema50Data);
    if (vwapSeriesRef.current) vwapSeriesRef.current.setData(vwapData);
    if (rsiSeriesRef.current) rsiSeriesRef.current.setData(rsiData);

    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles, indicatorConfig]);

  const currentCandle = candles[candles.length - 1] || {
    open: asset.markPx,
    high: asset.markPx,
    low: asset.markPx,
    close: asset.markPx,
    volume: 100,
    time: 'Now',
    rsi: 54,
  };

  const displayPrice = liveMidPrice || asset.markPx;

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded overflow-hidden flex flex-col font-mono select-none">
      {/* Chart Top Toolbar */}
      <div className="bg-[#16202e] border-b border-[#212a39] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Symbol & Timeframe */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm text-[#f0f4f8]">{asset.name}</span>
            <span className="text-[10px] bg-[#212a39] text-[#f2ca50] font-semibold px-1.5 py-0.5 rounded">
              {asset.marketType === 'PERP' ? `${asset.maxLeverage}x MAX PERP` : 'SPOT'}
            </span>
          </div>

          <div className="flex items-center bg-[#091421] border border-[#212a39] rounded p-0.5 ml-2">
            {timeframes.map((tf) => (
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

          {/* Indicator Configuration Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-2 py-0.5 rounded bg-[#091421] hover:bg-[#1c2331] text-[#f2ca50] border border-[#212a39] hover:border-[#f2ca50]/50 text-[10.5px] font-semibold flex items-center gap-1 ml-2 transition-colors"
          >
            <Settings2 className="w-3 h-3 text-[#f2ca50]" />
            <span>INDICATORS & STYLES</span>
          </button>
        </div>

        {/* Live Active Indicators Readout */}
        <div className="flex items-center gap-2 text-[10.5px]">
          {indicatorConfig.ema9.enabled && (
            <span className="flex items-center gap-1" style={{ color: indicatorConfig.ema9.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: indicatorConfig.ema9.color }}></span>
              <span>EMA 9: ${(currentCandle.ema9 || displayPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
            </span>
          )}
          {indicatorConfig.ema21.enabled && (
            <span className="flex items-center gap-1" style={{ color: indicatorConfig.ema21.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: indicatorConfig.ema21.color }}></span>
              <span>EMA 21: ${(currentCandle.ema21 || displayPrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
            </span>
          )}
          {indicatorConfig.rsi.enabled && (
            <span className="flex items-center gap-1" style={{ color: indicatorConfig.rsi.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: indicatorConfig.rsi.color }}></span>
              <span>RSI: {currentCandle.rsi || 54.2}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price Telemetry Kicker */}
      <div className="px-3 py-2 bg-[#091421] border-b border-[#212a39] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-bold tracking-tight text-[#f0f4f8] tabular-nums">
            ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: displayPrice < 1 ? 4 : 2 })}
          </span>

          <div className="text-[11px] text-[#8a94a6] flex items-center gap-2 tabular-nums">
            <span>O: <strong className="text-[#d9e3f7] font-normal">${currentCandle.open.toLocaleString()}</strong></span>
            <span>H: <strong className="text-[#2ebd85] font-normal">${currentCandle.high.toLocaleString()}</strong></span>
            <span>L: <strong className="text-[#f6465d] font-normal">${currentCandle.low.toLocaleString()}</strong></span>
            <span>C: <strong className="text-[#2ebd85] font-normal">${currentCandle.close.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Quick Order Actions (Long / Short) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onQuickLong}
            className="px-3 py-1 bg-[#2ebd85] hover:bg-[#26a673] text-[#091421] font-bold text-xs rounded transition-colors active:scale-95 shadow-sm"
          >
            OPEN LONG
          </button>
          <button
            onClick={onQuickShort}
            className="px-3 py-1 bg-[#f6465d] hover:bg-[#df3a50] text-[#f0f4f8] font-bold text-xs rounded transition-colors active:scale-95 shadow-sm"
          >
            OPEN SHORT
          </button>
        </div>
      </div>

      {/* Main Lightweight Candlestick Chart */}
      <div ref={chartContainerRef} className="w-full relative" />

      {/* Sub-Pane: RSI (14) if enabled */}
      {indicatorConfig.rsi.enabled && (
        <div className="border-t border-[#212a39] bg-[#050f1c] relative">
          <div className="absolute top-1 left-2 z-10 text-[9px] text-[#ff959a] font-bold flex items-center gap-1.5">
            <span>RSI (14) OSCILLATOR</span>
            <span className="text-[#8a94a6]">• OB: {indicatorConfig.rsi.overbought} | OS: {indicatorConfig.rsi.oversold}</span>
          </div>
          <div ref={rsiContainerRef} className="w-full" />
        </div>
      )}

      {/* Indicator Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-lg w-full p-5 shadow-2xl font-mono text-xs select-none">
            <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-[#f2ca50]" />
                <span className="font-display font-bold text-sm text-[#f0f4f8]">
                  TradingView Technical Indicators & Styles
                </span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#8a94a6] hover:text-[#f0f4f8]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {/* EMA 9 */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={indicatorConfig.ema9.enabled}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        ema9: { ...indicatorConfig.ema9, enabled: e.target.checked }
                      })}
                      className="accent-[#f2ca50]"
                    />
                    <span className="font-bold text-[#f0f4f8]">Exponential Moving Average (EMA 1)</span>
                  </div>
                  <input
                    type="color"
                    value={indicatorConfig.ema9.color}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema9: { ...indicatorConfig.ema9, color: e.target.value }
                    })}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#8a94a6]">
                  <span>Period:</span>
                  <input
                    type="number"
                    value={indicatorConfig.ema9.period}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema9: { ...indicatorConfig.ema9, period: parseInt(e.target.value) || 9 }
                    })}
                    className="w-16 bg-[#121c2a] border border-[#212a39] text-[#d9e3f7] px-2 py-0.5 rounded text-center outline-none"
                  />
                </div>
              </div>

              {/* EMA 21 */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={indicatorConfig.ema21.enabled}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        ema21: { ...indicatorConfig.ema21, enabled: e.target.checked }
                      })}
                      className="accent-[#57dea3]"
                    />
                    <span className="font-bold text-[#f0f4f8]">Exponential Moving Average (EMA 2)</span>
                  </div>
                  <input
                    type="color"
                    value={indicatorConfig.ema21.color}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema21: { ...indicatorConfig.ema21, color: e.target.value }
                    })}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#8a94a6]">
                  <span>Period:</span>
                  <input
                    type="number"
                    value={indicatorConfig.ema21.period}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema21: { ...indicatorConfig.ema21, period: parseInt(e.target.value) || 21 }
                    })}
                    className="w-16 bg-[#121c2a] border border-[#212a39] text-[#d9e3f7] px-2 py-0.5 rounded text-center outline-none"
                  />
                </div>
              </div>

              {/* EMA 50 */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={indicatorConfig.ema50.enabled}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        ema50: { ...indicatorConfig.ema50, enabled: e.target.checked }
                      })}
                      className="accent-[#9d7cf7]"
                    />
                    <span className="font-bold text-[#f0f4f8]">Structural Macro Trend (EMA 3)</span>
                  </div>
                  <input
                    type="color"
                    value={indicatorConfig.ema50.color}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema50: { ...indicatorConfig.ema50, color: e.target.value }
                    })}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#8a94a6]">
                  <span>Period:</span>
                  <input
                    type="number"
                    value={indicatorConfig.ema50.period}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      ema50: { ...indicatorConfig.ema50, period: parseInt(e.target.value) || 50 }
                    })}
                    className="w-16 bg-[#121c2a] border border-[#212a39] text-[#d9e3f7] px-2 py-0.5 rounded text-center outline-none"
                  />
                </div>
              </div>

              {/* VWAP */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={indicatorConfig.vwap.enabled}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      vwap: { ...indicatorConfig.vwap, enabled: e.target.checked }
                    })}
                    className="accent-[#d9e3f7]"
                  />
                  <span className="font-bold text-[#f0f4f8]">Volume-Weighted Average Price (VWAP)</span>
                </div>
                <input
                  type="color"
                  value={indicatorConfig.vwap.color}
                  onChange={(e) => saveConfig({
                    ...indicatorConfig,
                    vwap: { ...indicatorConfig.vwap, color: e.target.value }
                  })}
                  className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                />
              </div>

              {/* RSI Sub-Panel */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={indicatorConfig.rsi.enabled}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        rsi: { ...indicatorConfig.rsi, enabled: e.target.checked }
                      })}
                      className="accent-[#ff959a]"
                    />
                    <span className="font-bold text-[#f0f4f8]">RSI (Relative Strength Index) Sub-Pane</span>
                  </div>
                  <input
                    type="color"
                    value={indicatorConfig.rsi.color}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      rsi: { ...indicatorConfig.rsi, color: e.target.value }
                    })}
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10.5px] text-[#8a94a6]">
                  <div>
                    <span>Period:</span>
                    <input
                      type="number"
                      value={indicatorConfig.rsi.period}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        rsi: { ...indicatorConfig.rsi, period: parseInt(e.target.value) || 14 }
                      })}
                      className="w-full bg-[#121c2a] border border-[#212a39] text-[#d9e3f7] px-2 py-0.5 rounded text-center outline-none mt-1"
                    />
                  </div>
                  <div>
                    <span>Overbought:</span>
                    <input
                      type="number"
                      value={indicatorConfig.rsi.overbought}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        rsi: { ...indicatorConfig.rsi, overbought: parseInt(e.target.value) || 70 }
                      })}
                      className="w-full bg-[#121c2a] border border-[#212a39] text-[#f6465d] px-2 py-0.5 rounded text-center outline-none mt-1"
                    />
                  </div>
                  <div>
                    <span>Oversold:</span>
                    <input
                      type="number"
                      value={indicatorConfig.rsi.oversold}
                      onChange={(e) => saveConfig({
                        ...indicatorConfig,
                        rsi: { ...indicatorConfig.rsi, oversold: parseInt(e.target.value) || 30 }
                      })}
                      className="w-full bg-[#121c2a] border border-[#212a39] text-[#2ebd85] px-2 py-0.5 rounded text-center outline-none mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="p-3 bg-[#091421] rounded border border-[#212a39] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={indicatorConfig.volume.enabled}
                    onChange={(e) => saveConfig({
                      ...indicatorConfig,
                      volume: { ...indicatorConfig.volume, enabled: e.target.checked }
                    })}
                    className="accent-[#2ebd85]"
                  />
                  <span className="font-bold text-[#f0f4f8]">Volume Overlay Histogram</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#212a39] flex items-center justify-between">
              <button
                onClick={() => saveConfig(DEFAULT_INDICATOR_CONFIG)}
                className="py-1.5 px-3 bg-[#16202e] hover:bg-[#212a39] text-[#8a94a6] hover:text-[#d9e3f7] rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET TO DEFAULTS</span>
              </button>

              <button
                onClick={() => setShowConfigModal(false)}
                className="py-1.5 px-4 bg-[#d4af37] text-[#091421] font-bold rounded text-xs"
              >
                SAVE & APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
