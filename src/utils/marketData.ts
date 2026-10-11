import { Candle, CryptoPair } from '../types';

// Helper to compute EMA series
export function computeEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let ema = data[0];
  emaArray.push(ema);
  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    emaArray.push(ema);
  }
  return emaArray;
}

// Helper to compute RSI series (14-period)
export function computeRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length < period) return closes.map(() => 50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      rsi.push(50);
      continue;
    }
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(Math.round((100 - (100 / (1 + rs))) * 10) / 10);
  }
  return rsi;
}

// Generate base candles for a specific crypto pair
export function generateInitialCandlesForPair(pair: CryptoPair, count: number = 16): Candle[] {
  const basePrice = pair.price;
  const candles: Candle[] = [];
  const now = Date.now();
  const stepMs = 15 * 60 * 1000; // 15 mins

  let currentClose = basePrice * 0.992;
  const closes: number[] = [];
  let cumVol = 0;
  let cumPv = 0;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    let timeLabel = `${hours}:${mins}`;

    // Volatility percentage based on price scale
    const volPct = 0.0035;
    const change = (Math.sin(i * 0.8) * 0.5 + (Math.random() - 0.45)) * basePrice * volPct;
    const open = Math.round(currentClose * 100) / 100;
    const close = Math.round((open + change) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * basePrice * 0.002) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * basePrice * 0.002) * 100) / 100;
    const volume = Math.round((10 + Math.random() * 40) * 10) / 10;

    currentClose = close;
    closes.push(close);

    const typicalPrice = (high + low + close) / 3;
    cumPv += typicalPrice * volume;
    cumVol += volume;
    const vwap = Math.round((cumPv / cumVol) * 100) / 100;

    if (i === 3) timeLabel += ' (Cross)';
    if (i === 0) timeLabel += ' (Now)';

    candles.push({
      time: timeLabel,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      vwap
    });
  }

  // Calculate EMA 9, EMA 21, EMA 50
  const ema9 = computeEMA(closes, 9);
  const ema21 = computeEMA(closes, 21);
  const ema50 = computeEMA(closes, 50);
  const rsi = computeRSI(closes, 14);

  // Attach indicators to each candle
  candles.forEach((c, idx) => {
    c.ema9 = Math.round(ema9[idx] * 100) / 100;
    c.ema21 = Math.round(ema21[idx] * 100) / 100;
    c.ema50 = Math.round(ema50[idx] * 100) / 100;
    c.bbUpper = Math.round((c.ema21 + basePrice * 0.006) * 100) / 100;
    c.bbLower = Math.round((c.ema21 - basePrice * 0.006) * 100) / 100;
    c.rsi = rsi[idx] || 54.2;

    const macdVal = (c.ema9 - c.ema21);
    c.macd = {
      macd: Math.round(macdVal * 10) / 10,
      signal: Math.round((macdVal * 0.8) * 10) / 10,
      hist: Math.round((macdVal * 0.2) * 10) / 10
    };

    c.supertrend = {
      value: Math.round((c.close > (c.vwap || c.close) ? c.low * 0.995 : c.high * 1.005) * 100) / 100,
      direction: c.close > (c.vwap || c.close) ? 1 : -1
    };

    // Trigger on cross candle
    if (c.time.includes('Cross')) {
      c.signal = 'BUY';
      c.signalLabel = `BUY ENTRY @ ${pair.currencyPrefix}${c.close.toLocaleString('en-IN')}`;
    }
  });

  return candles;
}

// Generate realistic L2 order book based on current price
export function generateOrderBook(price: number, baseSymbol: string) {
  const tickSize = price > 10000 ? 50 : price > 100 ? 0.5 : 0.01;
  const spread = tickSize * 3;

  const asks = [
    {
      price: price + spread * 3,
      priceFormatted: (price + spread * 3).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.8 + Math.random() * 0.5).toFixed(3),
      totalLakh: +(70 + Math.random() * 10).toFixed(2),
      depthPercent: 88,
    },
    {
      price: price + spread * 2,
      priceFormatted: (price + spread * 2).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.4 + Math.random() * 0.3).toFixed(3),
      totalLakh: +(34 + Math.random() * 5).toFixed(2),
      depthPercent: 44,
    },
    {
      price: price + spread,
      priceFormatted: (price + spread).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.2 + Math.random() * 0.2).toFixed(3),
      totalLakh: +(16 + Math.random() * 3).toFixed(2),
      depthPercent: 22,
    },
  ];

  const bids = [
    {
      price: price - spread,
      priceFormatted: (price - spread).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.3 + Math.random() * 0.2).toFixed(3),
      totalLakh: +(26 + Math.random() * 4).toFixed(2),
      depthPercent: 35,
    },
    {
      price: price - spread * 2,
      priceFormatted: (price - spread * 2).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.9 + Math.random() * 0.3).toFixed(3),
      totalLakh: +(82 + Math.random() * 8).toFixed(2),
      depthPercent: 95,
    },
    {
      price: price - spread * 3,
      priceFormatted: (price - spread * 3).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
      qty: +(0.6 + Math.random() * 0.3).toFixed(3),
      totalLakh: +(51 + Math.random() * 6).toFixed(2),
      depthPercent: 64,
    },
  ];

  return { asks, bids };
}
