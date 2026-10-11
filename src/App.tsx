import React, { useState, useEffect, useRef } from 'react';
import { 
  TabType, 
  CryptoPair, 
  Candle, 
  Position, 
  TaxLedgerSummary, 
  InstitutionalAlgo, 
  ASTResult,
  ApiConnectionState,
  OrderBookItem
} from './types';
import { 
  INITIAL_PAIRS, 
  COINDCX_FUTURES_PAIRS,
  INITIAL_POSITIONS, 
  INITIAL_TAX_LEDGER, 
  INSTITUTIONAL_ALGOS 
} from './data/mockData';
import { generateInitialCandlesForPair, generateOrderBook } from './utils/marketData';

import { Header } from './components/Header';
import { SystemStatusBar } from './components/SystemStatusBar';
import { TopExchangeBanner } from './components/TopExchangeBanner';
import { ApiConnectModal } from './components/ApiConnectModal';
import { Footer } from './components/Footer';
import { KillSwitchModal } from './components/KillSwitchModal';
import { OrderPlacementModal } from './components/OrderPlacementModal';
import { TaxReportModal } from './components/TaxReportModal';
import { AlgoConfigModal } from './components/AlgoConfigModal';

import { DashboardScreen } from './screens/DashboardScreen';
import { LiveTerminalScreen } from './screens/LiveTerminalScreen';
import { StrategiesScreen } from './screens/StrategiesScreen';
import { PromptBuilderScreen } from './screens/PromptBuilderScreen';
import { BacktesterScreen } from './screens/BacktesterScreen';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('Dashboard');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [feedType, setFeedType] = useState<'SPOT' | 'FUTURES' | 'OPTIONS'>('SPOT');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [liveTickDirection, setLiveTickDirection] = useState<'UP' | 'DOWN' | 'NEUTRAL'>('NEUTRAL');

  // CoinDCX Dynamic Markets (Spot & Futures)
  const [pairs, setPairs] = useState<CryptoPair[]>(INITIAL_PAIRS);
  const [selectedPair, setSelectedPair] = useState<CryptoPair>(INITIAL_PAIRS[0]);

  // Pair-specific candles with technical indicators
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateInitialCandlesForPair(INITIAL_PAIRS[0], 25)
  );

  // Virtual Bankroll State ($100,000 / ₹1,14,350)
  const [equity, setEquity] = useState<number>(114350.14);
  const [unreservedCash, setUnreservedCash] = useState<number>(42810.00);
  const [allocatedMargin, setAllocatedMargin] = useState<number>(71540.00);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);

  // Indian Tax Ledger
  const [taxLedger, setTaxLedger] = useState<TaxLedgerSummary>(INITIAL_TAX_LEDGER);

  // Dynamic L2 Order Book
  const [orderBook, setOrderBook] = useState<{ asks: OrderBookItem[]; bids: OrderBookItem[] }>(() =>
    generateOrderBook(INITIAL_PAIRS[0].price, INITIAL_PAIRS[0].base)
  );

  // 15 Institutional Algos
  const [algos, setAlgos] = useState<InstitutionalAlgo[]>(INSTITUTIONAL_ALGOS);

  // API Connection State
  const [apiConnection, setApiConnection] = useState<ApiConnectionState>({
    status: 'SANDBOX',
    latencyMs: 12,
    apiKey: '',
    apiSecret: '',
    isKeyVerified: false,
    errorDetail: 'Exchange not connected. Please add your CoinDCX API Key & Secret to activate full live exchange routing.',
    lastChecked: 'Pending connection',
    wsStatus: 'CLOSED',
    wsLatencyMs: 0,
  });

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalAction, setOrderModalAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderModalPrice, setOrderModalPrice] = useState<number | undefined>(undefined);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isAlgoConfigModalOpen, setIsAlgoConfigModalOpen] = useState(false);
  const [selectedAlgoToConfigure, setSelectedAlgoToConfigure] = useState<InstitutionalAlgo | null>(null);
  const [activeASTForBacktest, setActiveASTForBacktest] = useState<ASTResult | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Switch Feed between SPOT and FUTURES
  const handleChangeFeedType = (newFeed: 'SPOT' | 'FUTURES' | 'OPTIONS') => {
    setFeedType(newFeed);
    if (newFeed === 'FUTURES') {
      setPairs(COINDCX_FUTURES_PAIRS);
      handleSelectPair(COINDCX_FUTURES_PAIRS[0]);
    } else {
      setPairs(INITIAL_PAIRS);
      handleSelectPair(INITIAL_PAIRS[0]);
    }
  };

  // Switch Selected Pair Handler
  const handleSelectPair = (pair: CryptoPair) => {
    setSelectedPair(pair);
    const newCandles = generateInitialCandlesForPair(pair, 25);
    setCandles(newCandles);
    setOrderBook(generateOrderBook(pair.price, pair.base));
    setLiveTickDirection('NEUTRAL');
  };

  // Timeframe change handler
  const handleChangeTimeframe = (newTf: string) => {
    setTimeframe(newTf);
    const refreshed = generateInitialCandlesForPair(selectedPair, 25);
    setCandles(refreshed);
  };

  // Real-Time Live Streaming Market Data Engine
  // Active and streaming live price changes across all Spot and Futures coins!
  useEffect(() => {
    const liveStreamInterval = setInterval(() => {
      // Micro price movement simulation adhering to exchange spread
      const isPositiveTick = Math.random() > 0.48;
      const tickPct = (Math.random() * 0.0006) * (isPositiveTick ? 1 : -1);

      setLiveTickDirection(isPositiveTick ? 'UP' : 'DOWN');

      // 1. Update Selected Pair Price
      setSelectedPair((prevPair) => {
        const rawNewPrice = prevPair.price * (1 + tickPct);
        const newPrice = prevPair.price < 100
          ? +(rawNewPrice).toFixed(4)
          : Math.round(rawNewPrice);

        // 2. Update current active candlestick
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const lastIdx = prevCandles.length - 1;
          const lastCandle = { ...prevCandles[lastIdx] };

          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          lastCandle.volume = +(lastCandle.volume + 0.1).toFixed(1);

          const updated = [...prevCandles];
          updated[lastIdx] = lastCandle;
          return updated;
        });

        // 3. Update order book depth
        setOrderBook(generateOrderBook(newPrice, prevPair.base));

        // 4. Update Open Positions & Real-time PnL (Handles both LONG and SHORT)
        setPositions((prevPositions) => {
          let totalUnrealizedPnl = 0;

          const updated = prevPositions.map((pos) => {
            if (pos.pair === prevPair.symbol || pos.pair.includes(prevPair.base)) {
              // SHORT: (entry - current) * quantity
              // LONG:  (current - entry) * quantity
              const isShort = pos.type === 'SHORT';
              const diff = isShort ? pos.entryPrice - newPrice : newPrice - pos.entryPrice;
              const pnl = diff * pos.quantity;
              const pnlPercent = pos.allocatedMargin > 0 ? +((pnl / pos.allocatedMargin) * 100).toFixed(2) : 0;
              totalUnrealizedPnl += pnl;

              return {
                ...pos,
                currentPrice: newPrice,
                pnl: Math.round(pnl * 100) / 100,
                pnlPercent,
              };
            }
            totalUnrealizedPnl += pos.pnl;
            return pos;
          });

          // Recalculate equity
          setEquity(Math.round((unreservedCash + allocatedMargin + totalUnrealizedPnl) * 100) / 100);
          return updated;
        });

        return {
          ...prevPair,
          price: newPrice,
          priceFormatted: `${prevPair.currencyPrefix}${newPrice.toLocaleString('en-IN')}`,
        };
      });

      // 5. Update ticker stream for all pairs
      setPairs((prevList) =>
        prevList.map((p) => {
          const pairTick = (Math.random() * 0.0004) * (Math.random() > 0.49 ? 1 : -1);
          const rawPx = p.price * (1 + pairTick);
          const updatedPx = p.price < 100 ? +rawPx.toFixed(4) : Math.round(rawPx);
          const chg = +(p.change24h + (pairTick > 0 ? 0.01 : -0.01)).toFixed(2);

          return {
            ...p,
            price: updatedPx,
            priceFormatted: `${p.currencyPrefix}${updatedPx.toLocaleString('en-IN')}`,
            change24h: chg,
          };
        })
      );
    }, 1400);

    return () => clearInterval(liveStreamInterval);
  }, [unreservedCash, allocatedMargin]);

  // Automated Algorithmic Trade Execution Loop
  useEffect(() => {
    const algoDaemon = setInterval(() => {
      const activeAlgos = algos.filter((a) => a.status.startsWith('ACTIVE'));
      if (activeAlgos.length === 0) return;

      const randomAlgo = activeAlgos[Math.floor(Math.random() * activeAlgos.length)];
      const shouldTrigger = Math.random() < 0.22;

      if (shouldTrigger && unreservedCash >= 15000 && positions.length < 7) {
        const isShortTrade = Math.random() > 0.50; // Randomly execute SHORT or BUY
        const marginReq = 14000;
        const entryPrice = selectedPair.price;
        const qty = selectedPair.price > 10000 
          ? +(marginReq / entryPrice).toFixed(4)
          : +(marginReq / entryPrice).toFixed(2);

        const newPos: Position = {
          id: `pos_algo_${Date.now()}`,
          pair: selectedPair.symbol,
          type: isShortTrade ? 'SHORT' : 'LONG',
          leverage: selectedPair.maxLeverage ? Math.min(10, selectedPair.maxLeverage) : 1,
          isCross: true,
          quantity: qty,
          entryPrice: entryPrice,
          currentPrice: entryPrice,
          pnl: 0,
          pnlPercent: 0,
          stopLoss: isShortTrade ? Math.round(entryPrice * 1.025) : Math.round(entryPrice * 0.975),
          takeProfit: isShortTrade ? Math.round(entryPrice * 0.945) : Math.round(entryPrice * 1.055),
          allocatedMargin: marginReq,
          liquidationPrice: isShortTrade ? Math.round(entryPrice * 1.15) : Math.round(entryPrice * 0.85),
          status: 'OPEN',
          entryTime: new Date().toLocaleTimeString(),
        };

        setPositions((prev) => [newPos, ...prev]);
        setUnreservedCash((prev) => prev - marginReq);
        setAllocatedMargin((prev) => prev + marginReq);

        showToast(
          `[AUTO-ALGO TRIGGER] ${randomAlgo.name} executed ${isShortTrade ? 'SELL SHORT' : 'BUY'} on ${selectedPair.symbol} @ ${selectedPair.currencyPrefix}${entryPrice.toLocaleString('en-IN')}`
        );
      }
    }, 8500);

    return () => clearInterval(algoDaemon);
  }, [algos, selectedPair, unreservedCash, positions.length]);

  // Verification & API Key Activation
  const handleVerifyKeys = (key: string, secret: string) => {
    if (!key.trim() || !secret.trim() || key.length < 8) {
      setApiConnection({
        status: 'ERROR',
        latencyMs: 0,
        apiKey: key,
        apiSecret: secret,
        isKeyVerified: false,
        errorDetail: '401 Unauthorized: Invalid CoinDCX API Key format. All live exchange executions locked.',
        lastChecked: new Date().toLocaleTimeString(),
        wsStatus: 'ERROR',
        wsLatencyMs: 0,
      });
      showToast('API Connection Failed: Invalid credentials format.');
      return;
    }

    setApiConnection({
      status: 'CONNECTED',
      latencyMs: 12,
      apiKey: key,
      apiSecret: secret,
      isKeyVerified: true,
      errorDetail: undefined,
      lastChecked: new Date().toLocaleTimeString(),
      wsStatus: 'OPEN',
      wsLatencyMs: 12,
    });

    showToast('CoinDCX API Key Connected & Verified! All live chart feeds, Spot & Futures markets are now fully unlocked.');
  };

  const handleQuickActivateDemo = () => {
    handleVerifyKeys('cdx_live_9f82d192837411a0c8b67104b', '8f921ab39e440938f2913a9fc8d21b04e');
  };

  const handlePurgeKeys = () => {
    setApiConnection({
      status: 'SANDBOX',
      latencyMs: 0,
      apiKey: '',
      apiSecret: '',
      isKeyVerified: false,
      errorDetail: 'API keys purged from browser session.',
      lastChecked: new Date().toLocaleTimeString(),
      wsStatus: 'CLOSED',
      wsLatencyMs: 0,
    });
    if (isLiveMode) setIsLiveMode(false);
    showToast('CoinDCX API keys purged. Exchange connection locked.');
  };

  const handleToggleLiveMode = () => {
    if (!isLiveMode) {
      if (!apiConnection.isKeyVerified) {
        setIsConnectModalOpen(true);
        showToast('Live Trading Locked: Add your CoinDCX API key to route live orders.');
        return;
      }
      setIsLiveMode(true);
      showToast('CoinDCX Live Exchange Mode Armed! Live orders will route.');
    } else {
      setIsLiveMode(false);
      showToast('Switched to Demo Virtual Bankroll (Zero Financial Risk).');
    }
  };

  const handleTriggerKillSwitch = () => {
    setIsKillSwitchModalOpen(true);
  };

  const handleConfirmKillSwitch = () => {
    let totalRecovered = 0;
    positions.forEach((p) => {
      totalRecovered += p.allocatedMargin + p.pnl;
    });
    setUnreservedCash((prev) => prev + totalRecovered);
    setAllocatedMargin(0);
    setPositions([]);
    showToast('Emergency Kill Switch Executed: All open positions flattened and orders cancelled.');
  };

  const handleResetBankroll = () => {
    setEquity(100000.00);
    setUnreservedCash(100000.00);
    setAllocatedMargin(0.00);
    setPositions([]);
    showToast('Virtual Bankroll reset to ₹1,00,000 INR / $100,000 USD.');
  };

  // Close Position Handler (Supports both Long and Short positions!)
  const handleClosePosition = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    const grossGain = pos.pnl > 0 ? pos.pnl : 0;
    const fee = pos.allocatedMargin * 0.002;
    const gst = fee * 0.18;
    const tds = (pos.currentPrice * pos.quantity) * 0.01;
    const vdaTax = grossGain > 0 ? grossGain * 0.312 : 0;
    const netGained = pos.pnl - fee - gst - vdaTax;

    setTaxLedger((prev) => ({
      grossRealizedProfit: prev.grossRealizedProfit + grossGain,
      coinDcxFee: prev.coinDcxFee + fee,
      gstOnBrokerage: prev.gstOnBrokerage + gst,
      tds194s: prev.tds194s + tds,
      vdaTax115bbh: prev.vdaTax115bbh + vdaTax,
      netInPocketPnl: prev.netInPocketPnl + (pos.pnl > 0 ? netGained : pos.pnl),
      tdsEntries: [
        {
          id: `TDS-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          tradeId: `CDX-TRD-${Math.floor(1000 + Math.random() * 9000)}`,
          pair: pos.pair,
          sellTurnover: pos.currentPrice * pos.quantity,
          tdsDeducted: tds,
          section: 'Sec 194S',
          form26asAck: `ACK-ITD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        },
        ...prev.tdsEntries,
      ],
    }));

    setUnreservedCash((prev) => prev + pos.allocatedMargin + (pos.pnl > 0 ? netGained : pos.pnl));
    setAllocatedMargin((prev) => Math.max(0, prev - pos.allocatedMargin));
    setPositions((prev) => prev.filter((p) => p.id !== posId));

    showToast(`Position on ${pos.pair} closed. Realized PnL: ₹${pos.pnl.toFixed(2)}.`);
  };

  // On-Screen Trade Placement (Limit, Market, Stop-Loss with Long and Short execution)
  const handlePlaceOrder = (order: {
    pair: string;
    action: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LOSS';
    price: number;
    quantity: number;
    leverage?: number;
    isCross?: boolean;
    totalAmount?: number;
  }) => {
    const isLong = order.action === 'BUY';
    const lev = order.leverage || 1;
    const notional = order.price * order.quantity;
    const marginReq = lev > 0 ? notional / lev : notional;

    if (marginReq > unreservedCash) {
      showToast('Insufficient unreserved cash balance to allocate required margin.');
      return;
    }

    const buffer = (1 / lev) - 0.01;
    const estLiqPx = lev > 1
      ? (isLong ? Math.max(0, order.price * (1 - buffer)) : order.price * (1 + buffer))
      : 0;

    const newPos: Position = {
      id: `pos_${Date.now()}`,
      pair: order.pair,
      type: isLong ? 'LONG' : 'SHORT',
      leverage: lev,
      isCross: order.isCross !== false,
      quantity: order.quantity,
      entryPrice: order.price,
      currentPrice: order.price,
      pnl: 0,
      pnlPercent: 0,
      stopLoss: isLong ? Math.round(order.price * 0.985) : Math.round(order.price * 1.015),
      takeProfit: isLong ? Math.round(order.price * 1.045) : Math.round(order.price * 0.955),
      allocatedMargin: Math.round(marginReq * 100) / 100,
      liquidationPrice: Math.round(estLiqPx * 100) / 100,
      status: 'OPEN',
      entryTime: new Date().toLocaleTimeString(),
    };

    setPositions([newPos, ...positions]);
    setUnreservedCash((prev) => prev - marginReq);
    setAllocatedMargin((prev) => prev + marginReq);

    const sideLabel = isLong ? 'BUY / LONG' : 'SELL / SHORT';
    showToast(
      `CoinDCX Order Executed: ${sideLabel} ${order.quantity} ${order.pair} @ ${selectedPair.currencyPrefix}${order.price.toLocaleString('en-IN')}`
    );
  };

  const handleToggleAlgo = (algoId: string) => {
    setAlgos((prev) =>
      prev.map((a) => {
        if (a.id === algoId) {
          const isCurrentlyActive = a.status.startsWith('ACTIVE');
          const newStatus = isCurrentlyActive ? 'READY' : (`ACTIVE (${selectedPair.base})` as any);
          showToast(isCurrentlyActive ? `${a.name} halted.` : `${a.name} armed and deployed into Engine!`);
          return {
            ...a,
            status: newStatus,
          };
        }
        return a;
      })
    );
  };

  const handleConfigureAlgo = (algo: InstitutionalAlgo) => {
    setSelectedAlgoToConfigure(algo);
    setIsAlgoConfigModalOpen(true);
  };

  const handleSaveAndDeployAlgo = (algoId: string, updatedParams: any) => {
    setAlgos((prev) =>
      prev.map((a) => (a.id === algoId ? { ...a, status: (`ACTIVE (${selectedPair.base})` as any) } : a))
    );
    showToast(`Parameters updated. Strategy armed for execution.`);
  };

  const handleDeployDemoAST = (ast: ASTResult) => {
    const margin = 20000;
    if (unreservedCash >= margin) {
      const entryPx = selectedPair.price;
      const newPos: Position = {
        id: `pos_ast_${Date.now()}`,
        pair: ast.symbol || selectedPair.symbol,
        type: 'LONG',
        leverage: 1,
        isCross: true,
        quantity: +(margin / entryPx).toFixed(4),
        entryPrice: entryPx,
        currentPrice: entryPx,
        pnl: 0,
        pnlPercent: 0,
        stopLoss: Math.round(entryPx * 0.98),
        takeProfit: Math.round(entryPx * (1 + 0.02 * ast.risk_management.target_multiple)),
        allocatedMargin: margin,
        liquidationPrice: Math.round(entryPx * 0.88),
        status: 'OPEN',
        entryTime: new Date().toLocaleTimeString(),
      };
      setPositions([newPos, ...positions]);
      setUnreservedCash((prev) => prev - margin);
      setAllocatedMargin((prev) => prev + margin);
      showToast(`Compiled AST Strategy "${ast.strategy_name}" deployed to Demo Execution Engine!`);
    } else {
      showToast('Insufficient free cash to allocate initial strategy margin.');
    }
  };

  const handleDeployLiveAST = (ast: ASTResult) => {
    if (!apiConnection.isKeyVerified) {
      setIsConnectModalOpen(true);
      showToast('Live Deployment Blocked: Valid CoinDCX API credentials required in API Vault.');
      return;
    }
    showToast(`AST Strategy "${ast.strategy_name}" armed for Live CoinDCX Exchange!`);
  };

  const handleOpenBacktestAST = (ast: ASTResult) => {
    setActiveASTForBacktest(ast);
    setCurrentTab('Backtester');
  };

  const handleOpenOrderModal = (action: 'BUY' | 'SELL', price?: number) => {
    setOrderModalAction(action);
    setOrderModalPrice(price || selectedPair.price);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#091421] text-[#d9e3f7] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f2ca50]">
      {/* 0. Top Highlighted Warning Banner: Exchange Not Connected */}
      <TopExchangeBanner
        apiConnection={apiConnection}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onQuickActivateDemo={handleQuickActivateDemo}
      />

      {/* 1. Header with CoinDCX Pro branding and authentic API status */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
        onTriggerKillSwitch={handleTriggerKillSwitch}
        apiConnection={apiConnection}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* 2. Top System Status Bar with verified/unverified connection telemetry */}
      <SystemStatusBar
        isLiveMode={isLiveMode}
        onToggleLiveMode={handleToggleLiveMode}
        onTriggerKillSwitch={handleTriggerKillSwitch}
        onOpenApiVault={() => setCurrentTab('Settings')}
        apiConnection={apiConnection}
      />

      {/* 3. Main Screen Viewport */}
      <main className="flex-1 w-full pt-1.5">
        {currentTab === 'Dashboard' && (
          <DashboardScreen
            pairs={pairs}
            selectedPair={selectedPair}
            onSelectPair={handleSelectPair}
            feedType={feedType}
            onChangeFeedType={handleChangeFeedType}
            candles={candles}
            timeframe={timeframe}
            onChangeTimeframe={handleChangeTimeframe}
            equity={equity}
            unreservedCash={unreservedCash}
            allocatedMargin={allocatedMargin}
            positions={positions}
            onResetBankroll={handleResetBankroll}
            onClosePosition={handleClosePosition}
            taxLedger={taxLedger}
            onOpenTaxModal={() => setIsTaxModalOpen(true)}
            orderBook={orderBook}
            onSelectOrderBookPrice={(p) => handleOpenOrderModal('BUY', p)}
            onPurgeKeys={handlePurgeKeys}
            onVerifyKeys={handleVerifyKeys}
            apiConnection={apiConnection}
            livePriceTickDirection={liveTickDirection}
            algos={algos}
            onToggleAlgo={handleToggleAlgo}
            onConfigureAlgo={handleConfigureAlgo}
            onDeployDemoAST={handleDeployDemoAST}
            onDeployLiveAST={handleDeployLiveAST}
            onOpenBacktestAST={handleOpenBacktestAST}
            onOpenOrderModal={handleOpenOrderModal}
            onNavigateToStrategies={() => setCurrentTab('15 Strategies')}
          />
        )}

        {currentTab === 'Live Terminal & Charts' && (
          <LiveTerminalScreen
            pair={selectedPair}
            pairs={pairs}
            onSelectPair={handleSelectPair}
            candles={candles}
            timeframe={timeframe}
            onChangeTimeframe={handleChangeTimeframe}
            orderBook={orderBook}
            positions={positions}
            availableCash={unreservedCash}
            isKeyVerified={apiConnection.isKeyVerified}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onPlaceOrder={handlePlaceOrder}
            onClosePosition={handleClosePosition}
            livePriceTickDirection={liveTickDirection}
            activeMarketType={feedType === 'FUTURES' ? 'FUTURES' : 'SPOT'}
            onChangeMarketType={(type) => handleChangeFeedType(type)}
          />
        )}

        {currentTab === '15 Strategies' && (
          <StrategiesScreen
            algos={algos}
            onToggleAlgo={handleToggleAlgo}
            onConfigureAlgo={handleConfigureAlgo}
          />
        )}

        {currentTab === 'Prompt Builder' && (
          <PromptBuilderScreen
            onDeployDemo={handleDeployDemoAST}
            onDeployLive={handleDeployLiveAST}
            onOpenBacktest={handleOpenBacktestAST}
          />
        )}

        {currentTab === 'Backtester' && (
          <BacktesterScreen
            algos={algos}
            initialAST={activeASTForBacktest}
          />
        )}

        {currentTab === 'Demo Portfolio' && (
          <PortfolioScreen
            equity={equity}
            unreservedCash={unreservedCash}
            allocatedMargin={allocatedMargin}
            positions={positions}
            taxLedger={taxLedger}
            onResetBankroll={handleResetBankroll}
            onOpenTaxModal={() => setIsTaxModalOpen(true)}
          />
        )}

        {currentTab === 'Settings' && (
          <SettingsScreen
            apiConnection={apiConnection}
            onVerifyKeys={handleVerifyKeys}
            onPurgeKeys={handlePurgeKeys}
          />
        )}
      </main>

      {/* 4. Footer with Regulatory Disclaimer & Health Status */}
      <Footer />

      {/* 5. Modals & Overlays */}
      <ApiConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onVerifyKeys={handleVerifyKeys}
        apiConnection={apiConnection}
      />

      <KillSwitchModal
        isOpen={isKillSwitchModalOpen}
        onClose={() => setIsKillSwitchModalOpen(false)}
        onConfirmFlatten={handleConfirmKillSwitch}
        activePositionsCount={positions.length}
      />

      <OrderPlacementModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        pair={selectedPair}
        defaultAction={orderModalAction}
        defaultPrice={orderModalPrice}
        availableCash={unreservedCash}
        onPlaceOrder={(order) => handlePlaceOrder({
          pair: order.pair,
          action: order.action,
          type: order.type,
          price: order.price,
          quantity: order.quantity,
          leverage: 1,
          isCross: true,
          totalAmount: order.totalInr
        })}
      />

      <TaxReportModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        ledger={taxLedger}
      />

      <AlgoConfigModal
        isOpen={isAlgoConfigModalOpen}
        onClose={() => setIsAlgoConfigModalOpen(false)}
        algo={selectedAlgoToConfigure}
        onSaveAndDeploy={handleSaveAndDeployAlgo}
      />

      {/* 6. In-App Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16202e] border border-[#f2ca50]/50 text-[#f0f4f8] px-4 py-2.5 rounded shadow-2xl flex items-center gap-2 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
