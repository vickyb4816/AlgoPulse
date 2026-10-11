import { ASTResult } from '../types';

export const SAMPLE_PROMPTS = [
  {
    name: "EMA 50 + VWAP Candle Breakout (Default)",
    text: "If price is above 50 EMA and above VWAP then buy after the top of the candle breaks, previous candle low is stop loss and target 1:3"
  },
  {
    name: "Golden Cross 50/200 + RSI Oversold",
    text: "When 50 EMA crosses above 200 EMA and RSI(14) is below 45 then enter long, stop loss 2.5% and target 1:2.5"
  },
  {
    name: "Supertrend Trailing Breakout",
    text: "If price is above Supertrend(10,3) and volume is above 20 SMA then buy spot, risk is previous swing low and target 1:4"
  },
  {
    name: "Bollinger Squeeze Mean Reversion",
    text: "If price touches lower Bollinger Band and RSI is below 30 then buy market, stop loss 1.8% and take profit 1:2"
  }
];

export function parseNaturalTradingLogic(promptText: string, symbol: string = "BTC/INR"): ASTResult {
  const text = promptText.toLowerCase().trim();

  // Extract Conditions
  const conditions: string[] = [];
  const filters: Array<{ indicator: string; length: number; operator: string; comparator?: string }> = [];

  // 1. EMA condition
  const emaMatch = text.match(/(\d+)\s*(?:period\s*)?ema|ema\s*\(?(\d+)\)?/i);
  if (emaMatch || text.includes('ema')) {
    const period = parseInt(emaMatch?.[1] || emaMatch?.[2] || '50', 10);
    const isAbove = text.includes('above') || text.includes('crosses above') || text.includes('>');
    const op = isAbove ? '>' : '<';
    conditions.push(`Close ${op} EMA(${period})`);
    filters.push({
      indicator: 'EMA',
      length: period,
      operator: op,
      comparator: 'CLOSE'
    });
  }

  // 2. VWAP condition
  if (text.includes('vwap')) {
    const isAbove = text.includes('above vwap') || text.includes('> vwap') || text.includes('above the vwap');
    const op = isAbove ? '>' : '<';
    conditions.push(`Close ${op} VWAP`);
    filters.push({
      indicator: 'VWAP',
      length: 1,
      operator: op,
      comparator: 'CLOSE'
    });
  }

  // 3. RSI condition
  const rsiMatch = text.match(/rsi(?:\s*\(\s*(\d+)\s*\))?\s*(?:is\s*)?(below|<|above|>)\s*(\d+)/i);
  if (rsiMatch) {
    const period = parseInt(rsiMatch[1] || '14', 10);
    const op = rsiMatch[2].includes('below') || rsiMatch[2] === '<' ? '<' : '>';
    const val = rsiMatch[3];
    conditions.push(`RSI(${period}) ${op} ${val}`);
    filters.push({
      indicator: 'RSI',
      length: period,
      operator: op,
      comparator: val
    });
  }

  // 4. Supertrend
  if (text.includes('supertrend')) {
    conditions.push(`Supertrend(10,3) == BULLISH`);
    filters.push({
      indicator: 'SUPERTREND',
      length: 10,
      operator: '==',
      comparator: 'BULLISH'
    });
  }

  // 5. Bollinger Bands
  if (text.includes('bollinger') || text.includes('bb')) {
    conditions.push(`Close <= Lower BollingerBand(20,2)`);
    filters.push({
      indicator: 'BOLLINGER_BANDS',
      length: 20,
      operator: '<=',
      comparator: 'LOWER'
    });
  }

  // Fallback condition if none caught
  if (conditions.length === 0) {
    conditions.push('Close > EMA(20)');
    filters.push({
      indicator: 'EMA',
      length: 20,
      operator: '>',
      comparator: 'CLOSE'
    });
  }

  // Extract Trigger
  let triggerNode = 'Breakout Prev Candle High';
  let execType = 'MARKET_IF_TOUCHED';
  let execTrigger = 'HIGH[-1]';

  if (text.includes('top of the candle breaks') || text.includes('candle breaks') || text.includes('candle high')) {
    triggerNode = 'Breakout Prev Candle High';
    execType = 'MARKET_IF_TOUCHED';
    execTrigger = 'HIGH[-1]';
  } else if (text.includes('crosses above')) {
    triggerNode = 'Moving Average Bullish Crossover';
    execType = 'CROSSOVER_INSTANT';
    execTrigger = 'FAST_MA_CROSS_SLOW_MA';
  } else if (text.includes('market') || text.includes('buy market')) {
    triggerNode = 'Market Immediate Execution';
    execType = 'MARKET_ORDER';
    execTrigger = 'CANDLE_CLOSE';
  } else if (text.includes('touches')) {
    triggerNode = 'Limit Touch Rejection';
    execType = 'LIMIT_MAKER';
    execTrigger = 'LEVEL_RETEST';
  }

  // Extract Stop Loss / Risk
  let riskNode = 'SL = Prev Candle Low';
  let stopLossVal = 'LOW[-1]';
  const slPctMatch = text.match(/stop\s*loss\s*(?:at\s*)?(\d+(?:\.\d+)?)\s*%/i);
  if (slPctMatch) {
    riskNode = `SL = -${slPctMatch[1]}% Fixed ATR Buffer`;
    stopLossVal = `-${slPctMatch[1]}%`;
  } else if (text.includes('swing low')) {
    riskNode = 'SL = Swing Low (10-bar)';
    stopLossVal = 'SWING_LOW[10]';
  }

  // Extract Target / R:R
  let targetNode = 'R:R = 1:3.0';
  let targetMult = 3.0;
  const rrMatch = text.match(/target\s*(?:1:)?(\d+(?:\.\d+)?)|1:(\d+(?:\.\d+)?)/i);
  if (rrMatch) {
    const val = parseFloat(rrMatch[1] || rrMatch[2] || '3.0');
    targetMult = isNaN(val) ? 3.0 : val;
    targetNode = `R:R = 1:${targetMult.toFixed(1)}`;
  } else if (text.includes('take profit') && text.match(/(\d+(?:\.\d+)?)\s*%/)) {
    const tpPct = text.match(/(\d+(?:\.\d+)?)\s*%/)?.[1];
    targetMult = parseFloat(tpPct || '4.0') / 2;
    targetNode = `TP = +${tpPct}% (${targetMult.toFixed(1)}x R:R)`;
  }

  // Strategy naming
  const cleanSym = symbol.replace('/', '_');
  const baseName = filters.map(f => f.indicator + (f.length > 1 ? f.length : '')).join('_') || 'ALGO';
  const stratName = `${baseName}_BREAKOUT_RR${Math.round(targetMult)}_${cleanSym}`.toUpperCase();

  return {
    strategy_name: stratName,
    symbol: symbol,
    execution: {
      type: execType,
      trigger: execTrigger
    },
    filters: filters,
    risk_management: {
      stop_loss: stopLossVal,
      target_multiple: targetMult,
      max_slippage_bps: 12,
      tds_withholding_compliant: true
    },
    raw_nodes: {
      conditions,
      trigger: triggerNode,
      risk: riskNode,
      target: targetNode
    }
  };
}
