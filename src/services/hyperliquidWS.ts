/**
 * Official Hyperliquid WebSocket Client
 * Production-ready persistent client with auto-reconnect, heartbeat ping/pong,
 * and subscription handlers for allMids, l2Book, and trades.
 */

export type WSConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSED' | 'ERROR';

export interface L2BookLevel {
  px: number;
  sz: number;
  n: number;
}

export interface L2BookData {
  coin: string;
  time: number;
  levels: [L2BookLevel[], L2BookLevel[]]; // [bids, asks]
}

export interface WSTradeData {
  coin: string;
  side: 'B' | 'A';
  px: number;
  sz: number;
  time: number;
  hash: string;
}

export interface WSCandleData {
  coin: string;
  interval: string;
  t: number;
  T: number;
  o: number;
  c: number;
  h: number;
  l: number;
  v: number;
}

type MidsListener = (mids: Record<string, number>) => void;
type L2BookListener = (book: L2BookData) => void;
type TradesListener = (trades: WSTradeData[]) => void;
type CandleListener = (candle: WSCandleData) => void;
type StatusListener = (status: WSConnectionStatus, latencyMs: number) => void;

class HyperliquidWebSocketService {
  private ws: WebSocket | null = null;
  private url: string = 'wss://api.hyperliquid.xyz/ws';
  private testnetUrl: string = 'wss://api.hyperliquid-testnet.xyz/ws';
  private isTestnet: boolean = false;
  private pingInterval: any = null;
  private reconnectTimeout: any = null;
  private reconnectAttempts: number = 0;
  private maxReconnectDelay: number = 10000;
  private lastPingTime: number = 0;
  private latencyMs: number = 14;
  private currentStatus: WSConnectionStatus = 'CLOSED';
  private isExplicitlyClosed: boolean = false;

  private activeCoin: string = 'BTC';
  private activeInterval: string = '15m';
  private midsListeners: Set<MidsListener> = new Set();
  private bookListeners: Set<L2BookListener> = new Set();
  private tradeListeners: Set<TradesListener> = new Set();
  private candleListeners: Set<CandleListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();

  constructor() {
    // Lazy connect on initialization
  }

  public getStatus(): WSConnectionStatus {
    return this.currentStatus;
  }

  public getLatency(): number {
    return this.latencyMs;
  }

  public connect(useTestnet: boolean = false) {
    this.isTestnet = useTestnet;
    this.isExplicitlyClosed = false;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const endpoint = this.isTestnet ? this.testnetUrl : this.url;
    this.emitStatus('CONNECTING', this.latencyMs);

    try {
      this.ws = new WebSocket(endpoint);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.emitStatus('OPEN', this.latencyMs);
        this.startHeartbeat();
        this.resubscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (err) {
          console.error('[Hyperliquid WS] JSON Parse Error:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('[Hyperliquid WS] Error event received:', error);
        this.emitStatus('ERROR', this.latencyMs);
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.emitStatus('CLOSED', this.latencyMs);
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[Hyperliquid WS] Connection creation failure:', err);
      this.emitStatus('ERROR', this.latencyMs);
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.emitStatus('CLOSED', 0);
  }

  public setCoin(coin: string, interval: string = '15m') {
    const rawCoin = coin.replace('/USDC', '');
    const oldCoin = this.activeCoin;
    const oldInterval = this.activeInterval;
    this.activeCoin = rawCoin;
    this.activeInterval = interval;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (oldCoin !== rawCoin || oldInterval !== interval) {
        // Unsubscribe old
        this.send({
          method: 'unsubscribe',
          subscription: { type: 'l2Book', coin: oldCoin }
        });
        this.send({
          method: 'unsubscribe',
          subscription: { type: 'trades', coin: oldCoin }
        });
        this.send({
          method: 'unsubscribe',
          subscription: { type: 'candle', coin: oldCoin, interval: oldInterval }
        });

        // Subscribe new
        this.send({
          method: 'subscribe',
          subscription: { type: 'l2Book', coin: rawCoin }
        });
        this.send({
          method: 'subscribe',
          subscription: { type: 'trades', coin: rawCoin }
        });
        this.send({
          method: 'subscribe',
          subscription: { type: 'candle', coin: rawCoin, interval }
        });
      }
    }
  }

  private resubscribe() {
    // 1. Subscribe to all mids (global price ticker for all coins)
    this.send({
      method: 'subscribe',
      subscription: { type: 'allMids' }
    });

    // 2. Subscribe to current active coin L2 Book
    if (this.activeCoin) {
      this.send({
        method: 'subscribe',
        subscription: { type: 'l2Book', coin: this.activeCoin }
      });

      // 3. Subscribe to active coin trades
      this.send({
        method: 'subscribe',
        subscription: { type: 'trades', coin: this.activeCoin }
      });

      // 4. Subscribe to active coin candle updates
      this.send({
        method: 'subscribe',
        subscription: { type: 'candle', coin: this.activeCoin, interval: this.activeInterval }
      });
    }
  }

  private handleMessage(msg: any) {
    if (msg.channel === 'pong') {
      const now = Date.now();
      if (this.lastPingTime > 0) {
        this.latencyMs = Math.max(4, now - this.lastPingTime);
        this.emitStatus('OPEN', this.latencyMs);
      }
      return;
    }

    if (msg.channel === 'allMids') {
      const rawMids = msg.data?.mids || {};
      const numericMids: Record<string, number> = {};
      for (const [coin, pxStr] of Object.entries(rawMids)) {
        numericMids[coin] = parseFloat(pxStr as string);
      }
      this.midsListeners.forEach(fn => fn(numericMids));
      return;
    }

    if (msg.channel === 'candle') {
      const data = msg.data;
      if (data) {
        const parsedCandle: WSCandleData = {
          coin: data.s,
          interval: data.i,
          t: data.t,
          T: data.T,
          o: parseFloat(data.o),
          c: parseFloat(data.c),
          h: parseFloat(data.h),
          l: parseFloat(data.l),
          v: parseFloat(data.v)
        };
        this.candleListeners.forEach(fn => fn(parsedCandle));
      }
      return;
    }

    if (msg.channel === 'l2Book') {
      const data = msg.data;
      if (data && data.levels) {
        const bookData: L2BookData = {
          coin: data.coin,
          time: data.time,
          levels: [
            data.levels[0].map((lvl: any) => ({
              px: parseFloat(lvl.px),
              sz: parseFloat(lvl.sz),
              n: lvl.n
            })),
            data.levels[1].map((lvl: any) => ({
              px: parseFloat(lvl.px),
              sz: parseFloat(lvl.sz),
              n: lvl.n
            }))
          ]
        };
        this.bookListeners.forEach(fn => fn(bookData));
      }
      return;
    }

    if (msg.channel === 'trades') {
      const tradesArr = msg.data;
      if (Array.isArray(tradesArr)) {
        const parsedTrades: WSTradeData[] = tradesArr.map((t: any) => ({
          coin: t.coin,
          side: t.side,
          px: parseFloat(t.px),
          sz: parseFloat(t.sz),
          time: t.time,
          hash: t.hash
        }));
        this.tradeListeners.forEach(fn => fn(parsedTrades));
      }
      return;
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        this.send({ method: 'ping' });
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    console.log(`[Hyperliquid WS] Reconnecting in ${(delay / 1000).toFixed(1)}s (Attempt #${this.reconnectAttempts})...`);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.isTestnet);
    }, delay);
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private emitStatus(status: WSConnectionStatus, latency: number) {
    this.currentStatus = status;
    this.latencyMs = latency;
    this.statusListeners.forEach(fn => fn(status, latency));
  }

  // Listener registrations
  public subscribeMids(listener: MidsListener) {
    this.midsListeners.add(listener);
    return () => this.midsListeners.delete(listener);
  }

  public subscribeCandles(listener: CandleListener) {
    this.candleListeners.add(listener);
    return () => this.candleListeners.delete(listener);
  }

  public subscribeL2Book(listener: L2BookListener) {
    this.bookListeners.add(listener);
    return () => this.bookListeners.delete(listener);
  }

  public subscribeTrades(listener: TradesListener) {
    this.tradeListeners.add(listener);
    return () => this.tradeListeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }
}

export const hyperliquidWS = new HyperliquidWebSocketService();
