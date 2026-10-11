import React from 'react';
import { 
  CryptoPair, 
  Candle, 
  Position, 
  TaxLedgerSummary, 
  OrderBookItem, 
  InstitutionalAlgo, 
  ASTResult 
} from '../types';
import { TickerBar } from '../components/TickerBar';
import { CandlestickChart } from '../components/CandlestickChart';
import { PromptToStrategyEngine } from '../components/PromptToStrategyEngine';
import { AlgoGrid } from '../components/AlgoGrid';
import { VirtualBankroll } from '../components/VirtualBankroll';
import { TaxLedger } from '../components/TaxLedger';
import { OrderBook } from '../components/OrderBook';
import { ApiVault } from '../components/ApiVault';

interface DashboardScreenProps {
  pairs: CryptoPair[];
  selectedPair: CryptoPair;
  onSelectPair: (pair: CryptoPair) => void;
  feedType: 'SPOT' | 'FUTURES' | 'OPTIONS';
  onChangeFeedType: (feed: 'SPOT' | 'FUTURES' | 'OPTIONS') => void;
  candles: Candle[];
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
  equity: number;
  unreservedCash: number;
  allocatedMargin: number;
  positions: Position[];
  onResetBankroll: () => void;
  onClosePosition: (id: string) => void;
  taxLedger: TaxLedgerSummary;
  onOpenTaxModal: () => void;
  orderBook: { asks: OrderBookItem[]; bids: OrderBookItem[] };
  onSelectOrderBookPrice: (price: number) => void;
  onPurgeKeys: () => void;
  onVerifyKeys: (key: string, secret: string) => void;
  apiConnection: any;
  livePriceTickDirection?: 'UP' | 'DOWN' | 'NEUTRAL';
  algos: InstitutionalAlgo[];
  onToggleAlgo: (id: string) => void;
  onConfigureAlgo: (algo: InstitutionalAlgo) => void;
  onDeployDemoAST: (ast: ASTResult) => void;
  onDeployLiveAST: (ast: ASTResult) => void;
  onOpenBacktestAST: (ast: ASTResult) => void;
  onOpenOrderModal: (action: 'BUY' | 'SELL', price?: number) => void;
  onNavigateToStrategies: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  pairs,
  selectedPair,
  onSelectPair,
  feedType,
  onChangeFeedType,
  candles,
  timeframe,
  onChangeTimeframe,
  equity,
  unreservedCash,
  allocatedMargin,
  positions,
  onResetBankroll,
  onClosePosition,
  taxLedger,
  onOpenTaxModal,
  orderBook,
  onSelectOrderBookPrice,
  onPurgeKeys,
  onVerifyKeys,
  apiConnection,
  livePriceTickDirection = 'NEUTRAL',
  algos,
  onToggleAlgo,
  onConfigureAlgo,
  onDeployDemoAST,
  onDeployLiveAST,
  onOpenBacktestAST,
  onOpenOrderModal,
  onNavigateToStrategies,
}) => {
  return (
    <div className="flex flex-col gap-2.5 pb-4">
      {/* CoinDCX Feed & Tickers Bar */}
      <TickerBar
        pairs={pairs}
        selectedPair={selectedPair}
        onSelectPair={onSelectPair}
        feedType={feedType}
        onChangeFeedType={onChangeFeedType}
      />

      {/* Main 2-Column Responsive Institutional Terminal Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2.5 px-3">
        {/* Left / Center Column (8 of 12 cols on desktop) */}
        <div className="xl:col-span-8 flex flex-col gap-2.5">
          {/* Main Candlestick Chart */}
          <CandlestickChart
            pair={selectedPair}
            candles={candles}
            timeframe={timeframe}
            onChangeTimeframe={onChangeTimeframe}
            onOpenOrderModal={onOpenOrderModal}
            livePriceTickDirection={livePriceTickDirection}
          />

          {/* Offline Prompt-to-Strategy Engine */}
          <PromptToStrategyEngine
            onDeployDemo={onDeployDemoAST}
            onDeployLive={onDeployLiveAST}
            onOpenBacktest={onOpenBacktestAST}
          />

          {/* 15 Preinstalled Institutional Algos Grid */}
          <AlgoGrid
            algos={algos}
            onToggleAlgo={onToggleAlgo}
            onConfigureAlgo={onConfigureAlgo}
            onViewAll={onNavigateToStrategies}
          />
        </div>

        {/* Right Sidebar Column (4 of 12 cols on desktop) */}
        <div className="xl:col-span-4 flex flex-col gap-2.5">
          {/* Virtual Bankroll & Active Positions */}
          <VirtualBankroll
            equity={equity}
            unreservedCash={unreservedCash}
            allocatedMargin={allocatedMargin}
            positions={positions}
            onResetBankroll={onResetBankroll}
            onClosePosition={onClosePosition}
          />

          {/* Indian Tax & Fee Ledger (FY 2026-27) */}
          <TaxLedger
            ledger={taxLedger}
            onOpenTaxModal={onOpenTaxModal}
          />

          {/* L2 Order Book */}
          <OrderBook
            pair={selectedPair}
            asks={orderBook.asks}
            bids={orderBook.bids}
            onSelectPrice={onSelectOrderBookPrice}
          />

          {/* API Hardening Vault */}
          <ApiVault
            apiConnection={apiConnection}
            onVerifyKeys={onVerifyKeys}
            onPurgeKeys={onPurgeKeys}
          />
        </div>
      </div>
    </div>
  );
};
