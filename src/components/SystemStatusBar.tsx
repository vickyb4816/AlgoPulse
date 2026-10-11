import React from 'react';
import { Shield, Lock, AlertTriangle, Zap, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ApiConnectionState } from '../types';

interface SystemStatusBarProps {
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  onTriggerKillSwitch: () => void;
  onOpenApiVault: () => void;
  apiConnection: ApiConnectionState;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  isLiveMode,
  onToggleLiveMode,
  onTriggerKillSwitch,
  onOpenApiVault,
  apiConnection,
}) => {
  const isWsConnected = apiConnection.isKeyVerified;

  return (
    <div className="w-full bg-[#050f1c] border-b border-[#212a39] px-3 py-1.5 flex flex-wrap items-center justify-between text-xs font-mono gap-2 select-none">
      {/* Left Telemetry Cluster */}
      <div className="flex items-center gap-3 overflow-x-auto text-[11px]">
        {/* Real-time WS Connection */}
        <div
          className={`flex items-center gap-1.5 whitespace-nowrap ${
            isWsConnected
              ? 'text-[#2ebd85]'
              : 'text-[#f6465d]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isWsConnected
                ? 'bg-[#2ebd85] animate-pulse'
                : 'bg-[#f6465d]'
            }`}
          ></span>
          <span className="font-semibold">
            {isWsConnected
              ? 'COINDCX LIVE WS: CONNECTED'
              : 'COINDCX LIVE WS: AUTH REQUIRED'}
          </span>
          <span className="text-[#8a94a6]">
            {isWsConnected ? `${apiConnection.latencyMs || 12}ms` : 'Offline'}
          </span>
        </div>

        <span className="text-[#212a39]">|</span>

        {/* Engine Stack */}
        <div className="flex items-center gap-1.5 text-[#8a94a6] whitespace-nowrap">
          <Server className="w-3 h-3 text-[#f2ca50]" />
          <span className="text-[#d9e3f7] font-medium">ENGINE: VPS 24/7</span>
          <span className="text-[#8a94a6]">FastAPI • Postgres • Redis</span>
        </div>

        <span className="text-[#212a39] hidden lg:inline">|</span>

        {/* API Verification Notice & Tax Compliance */}
        {!apiConnection.isKeyVerified ? (
          <div
            className="flex items-center gap-1.5 text-[#f6465d] whitespace-nowrap bg-[#93000a]/20 px-2 py-0.5 rounded border border-[#ffb4ab]/30 cursor-pointer"
            onClick={onOpenApiVault}
          >
            <AlertCircle className="w-3 h-3 text-[#ffdad6]" />
            <span className="text-[10px] font-bold">
              API ERROR: Exchange Unconnected — Click to Add CoinDCX API Key
            </span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 text-[#f2ca50] whitespace-nowrap bg-[#f2ca50]/10 px-2 py-0.5 rounded border border-[#f2ca50]/20">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] tracking-tight">
              IN COMPLIANCE: 1% TDS (194S) & 30% VDA (115BBH) Trade-Only Key Enforced
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0 text-xs">
        {/* Segmented Mode Button */}
        <div className="flex items-center bg-[#091421] border border-[#212a39] rounded p-0.5">
          <button
            onClick={() => isLiveMode && onToggleLiveMode()}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              !isLiveMode
                ? 'bg-[#d4af37] text-[#091421]'
                : 'text-[#8a94a6] hover:text-[#f0f4f8]'
            }`}
          >
            DEMO • ₹1,00,000 FREE
          </button>
          <button
            onClick={() => !isLiveMode && onToggleLiveMode()}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
              isLiveMode
                ? 'bg-[#2ebd85] text-[#091421]'
                : 'text-[#8a94a6] hover:text-[#f0f4f8]'
            }`}
          >
            <Lock className="w-2.5 h-2.5" />
            LIVE (ARMED)
          </button>
        </div>

        {/* Kill Switch Banner Button */}
        <button
          onClick={onTriggerKillSwitch}
          className="px-2.5 py-0.5 bg-[#93000a] hover:bg-[#b00010] text-[#ffdad6] border border-[#ffb4ab]/40 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3 text-[#ffdad6]" />
          <span>KILL SWITCH</span>
          <span className="text-[10px] opacity-80 font-normal">CANCEL & FLATTEN</span>
        </button>

        {/* API Vault Button */}
        <button
          onClick={onOpenApiVault}
          className="px-2 py-0.5 bg-[#151a23] hover:bg-[#1c2331] text-[#d9e3f7] hover:text-[#f2ca50] border border-[#212a39] rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
        >
          <Lock className="w-3 h-3 text-[#f2ca50]" />
          <span>API VAULT</span>
        </button>
      </div>
    </div>
  );
};
