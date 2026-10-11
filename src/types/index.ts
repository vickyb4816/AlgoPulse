export type TabType = 
  | 'Dashboard' 
  | 'Live Terminal & Charts' 
  | '15 Strategies' 
  | 'Prompt Builder' 
  | 'Backtester' 
  | 'Demo Portfolio' 
  | 'Settings';

export type HyperliquidMarketType = 'PERP' | 'SPOT';

export interface HyperliquidAsset {
  name: string;
  assetIndex: number;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
  markPx: number;
  midPx: number;
  prevDayPx: number;
  dayNtlVlm: number;
  funding: number;
  openInterest: number;
  marketType: HyperliquidMarketType;
  baseToken?: string;
  quoteToken?: string;
}

export interface HyperliquidOrderRequest {
  coin: string;
  assetIndex: number;
  is_buy: boolean; // false for Short/Sell, true for Long/Buy
  sz: string;      // Formatted according to szDecimals
  limit_px: string;// Formatted to tick size precision
  reduce_only: boolean; // false for Open Short, true for Close Long
  order_type: {
    limit: {
      tif: 'Gtc' | 'Ioc' | 'Alo';
    };
  };
  cloid?: string;
  leverage: number;
  isCross: boolean;
}

export interface OrderExecutionDebugLog {
  id: string;
  timestamp: string;
  coin: string;
  side: 'BUY/LONG' | 'SELL/SHORT' | 'CLOSE_LONG' | 'CLOSE_SHORT';
  is_buy: boolean;
  reduce_only: boolean;
  assetIndex: number;
  limit_px: string;
  sz: string;
  leverage: number;
  isCross: boolean;
  payload: any;
  response: any;
  status: 'SUBMITTED' | 'FILL_CONFIRMED' | 'REJECTED';
  rawExchangeMsg: string;
}

export interface CryptoPair {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  priceFormatted: string;
  change24h: number;
  high24h: string;
  low24h: string;
  volume: string;
  spread: string;
  currencyPrefix: string;
  sparkline: number[];
  assetIndex?: number;
  maxLeverage?: number;
  fundingRate?: number;
  openInterest?: number;
}

export interface DrawingElement {
  id: string;
  type: 'hLine' | 'trendline' | 'longPos';
  price1: number;
  time1?: string;
  price2?: number;
  time2?: string;
  color: string;
  label?: string;
}

export interface IndicatorSettings {
  showEMA9: boolean;
  showEMA21: boolean;
  showEMA50: boolean;
  showEMA200: boolean;
  showVWAP: boolean;
  showBB: boolean;
  showRSI: boolean;
  showMACD: boolean;
  showSupertrend: boolean;
  showVolume: boolean;
}

export interface AlgoExecutionLog {
  id: string;
  timestamp: string;
  algoId: string;
  algoName: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  qty: number;
  reason: string;
  pnl?: number;
}

export interface ApiConnectionState {
  status: 'SANDBOX' | 'CONNECTING' | 'CONNECTED' | 'ERROR';
  latencyMs: number;
  apiKey: string;
  apiSecret: string;
  agentWalletAddress?: string;
  isKeyVerified: boolean;
  errorDetail?: string;
  lastChecked: string;
  wsStatus: 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';
  wsLatencyMs: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema9?: number;
  ema21?: number;
  ema50?: number;
  ema200?: number;
  vwap?: number;
  bbUpper?: number;
  bbLower?: number;
  rsi?: number;
  macd?: { macd: number; signal: number; hist: number };
  supertrend?: { value: number; direction: 1 | -1 };
  signal?: 'BUY' | 'SELL';
  signalLabel?: string;
}

export interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  leverage: number;
  isCross: boolean;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercent: number;
  stopLoss: number;
  takeProfit: number;
  allocatedMargin: number;
  status: 'OPEN' | 'CLOSED';
  entryTime: string;
}

export interface TaxLedgerSummary {
  grossRealizedProfit: number;
  coinDcxFee: number;
  gstOnBrokerage: number;
  tds194s: number;
  vdaTax115bbh: number;
  netInPocketPnl: number;
  tdsEntries: TdsEntry[];
}

export interface TdsEntry {
  id: string;
  date: string;
  tradeId: string;
  pair: string;
  sellTurnover: number;
  tdsDeducted: number;
  section: string;
  form26asAck: string;
}

export interface OrderBookItem {
  price: number;
  priceFormatted: string;
  qty: number;
  totalLakh: number;
  depthPercent: number;
}

export interface InstitutionalAlgo {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  status: 'ACTIVE (BTC)' | 'ACTIVE (ETH)' | 'ACTIVE (SOL)' | 'READY' | 'IDLE';
  winRate: number;
  profitFactor: number;
  avgTrade?: string;
  trades3M?: number;
  maxDrawdown?: string;
  surgeAvg?: string;
  timeframe: string;
  leverage: string;
  description: string;
  codeSnippet: string;
  signalsToday: number;
  totalPnlPercent: number;
}

export interface ASTCondition {
  id: string;
  label: string;
  field: string;
  operator: string;
  value: string;
}

export interface ASTResult {
  strategy_name: string;
  symbol: string;
  execution: {
    type: string;
    trigger: string;
  };
  filters: Array<{
    indicator: string;
    length: number;
    operator: string;
    comparator?: string;
  }>;
  risk_management: {
    stop_loss: string;
    target_multiple: number;
    max_slippage_bps: number;
    tds_withholding_compliant: boolean;
  };
  raw_nodes: {
    conditions: string[];
    trigger: string;
    risk: string;
    target: string;
  };
}
