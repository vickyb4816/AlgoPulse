import React from 'react';
import { TabType, ApiConnectionState } from '../types';
import { ShieldAlert, User, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  onTriggerKillSwitch: () => void;
  apiConnection: ApiConnectionState;
  onOpenConnectModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isLiveMode,
  onToggleLiveMode,
  onTriggerKillSwitch,
  apiConnection,
  onOpenConnectModal,
}) => {
  const tabs: TabType[] = [
    'Dashboard',
    'Live Terminal & Charts',
    '15 Strategies',
    'Prompt Builder',
    'Backtester',
    'Demo Portfolio',
    'Settings',
  ];

  const isWsConnected = apiConnection.isKeyVerified;

  return (
    <header className="w-full bg-[#091421] border-b border-[#212a39] px-3 py-2 flex items-center justify-between gap-2 select-none">
      {/* Left: Brand & Engine status */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          onClick={() => onSelectTab('Dashboard')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#f2ca50] to-[#d4af37] flex items-center justify-center text-[#091421] shadow-sm">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-[#f0f4f8] group-hover:text-[#f2ca50] transition-colors">
            Algo<span className="text-[#f2ca50]">Pulse</span>
            <span className="text-[10px] ml-1.5 px-1 py-0.2 rounded bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/30 font-mono">
              CoinDCX PRO
            </span>
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[#212a39] text-xs">
          {/* WebSocket Status */}
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8a94a6] leading-none uppercase tracking-wider font-mono">
              CoinDCX Live WS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isWsConnected
                    ? 'bg-[#2ebd85] animate-pulse'
                    : 'bg-[#f6465d]'
                }`}
              ></span>
              <span
                className={`text-[11px] font-mono font-medium ${
                  isWsConnected
                    ? 'text-[#2ebd85]'
                    : 'text-[#f6465d]'
                }`}
              >
                {isWsConnected
                  ? `WS LIVE (${apiConnection.latencyMs || 12}ms)`
                  : 'WS OFFLINE (ADD KEY)'}
              </span>
            </div>
          </div>

          {/* API Credentials Status */}
          <div className="flex flex-col pl-3 border-l border-[#212a39]">
            <span className="text-[10px] text-[#8a94a6] leading-none uppercase tracking-wider font-mono">
              Exchange API Status
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiConnection.isKeyVerified
                    ? 'bg-[#2ebd85]'
                    : 'bg-[#f6465d]'
                }`}
              ></span>
              {apiConnection.isKeyVerified ? (
                <span className="text-[11px] font-mono font-medium text-[#2ebd85]">
                  VERIFIED & ACTIVE
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenConnectModal}
                  className="text-[10px] font-mono font-bold text-[#f2ca50] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>NOT CONNECTED (CONNECT KEY)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Navigation tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto py-0.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#1c2331] text-[#f2ca50] shadow-sm border border-[#f2ca50]/30 font-semibold'
                  : 'text-[#8a94a6] hover:text-[#f0f4f8] hover:bg-[#151a23]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right: Mode Toggle, Kill Switch, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleLiveMode}
          className={`px-2.5 py-1 rounded text-xs font-mono font-medium tracking-tight border flex items-center gap-1.5 transition-colors ${
            !isLiveMode
              ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f2ca50] hover:bg-[#d4af37]/25'
              : 'bg-[#2ebd85]/15 border-[#2ebd85]/40 text-[#2ebd85] hover:bg-[#2ebd85]/25'
          }`}
          title="Switch between Demo Virtual Bankroll and Live CoinDCX Exchange"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{isLiveMode ? 'LIVE EXCHANGE' : 'DEMO (₹1,00,000)'}</span>
        </button>

        <button
          onClick={onTriggerKillSwitch}
          className="px-2.5 py-1 bg-[#93000a]/80 hover:bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/40 rounded text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm transition-colors active:scale-95"
          title="Emergency Kill Switch: Flatten all active positions and cancel open limit orders"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#ffdad6]" />
          <span className="hidden sm:inline">KILL SWITCH</span>
        </button>

        <button 
          onClick={() => onSelectTab('Settings')}
          className="w-7 h-7 rounded border border-[#212a39] bg-[#151a23] hover:bg-[#1c2331] flex items-center justify-center text-[#8a94a6] hover:text-[#f0f4f8] transition-colors"
          title="CoinDCX API & Trader Settings"
        >
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
