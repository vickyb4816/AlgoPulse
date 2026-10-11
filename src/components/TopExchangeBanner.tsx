import React, { useState } from 'react';
import { AlertTriangle, Key, Zap, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { ApiConnectionState } from '../types';

interface TopExchangeBannerProps {
  apiConnection: ApiConnectionState;
  onOpenConnectModal: () => void;
  onQuickActivateDemo: () => void;
}

export const TopExchangeBanner: React.FC<TopExchangeBannerProps> = ({
  apiConnection,
  onOpenConnectModal,
  onQuickActivateDemo,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // If already verified, show nothing or a subtle verified pill
  if (apiConnection.isKeyVerified) {
    return null;
  }

  // If user minimized the banner, show a sticky compact pill
  if (isDismissed) {
    return (
      <div className="bg-[#93000a]/90 text-[#ffdad6] border-b border-[#ffb4ab]/40 px-3 py-1 flex items-center justify-between font-mono text-[11px] select-none shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6465d] animate-ping"></span>
          <span><strong>Exchange Not Connected:</strong> Live streaming and trade execution locked.</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-[#f2ca50] hover:underline font-bold text-[10px]"
        >
          [Show Banner / Connect]
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#2a1306] via-[#1f1604] to-[#2a1306] border-b-2 border-[#f2ca50] px-4 py-2 text-xs font-mono select-none shadow-xl relative z-40 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Highlight message */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#f2ca50]/20 border border-[#f2ca50] flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 text-[#f2ca50]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-[#93000a] text-[#ffdad6] px-1.5 py-0.2 rounded font-bold text-[10px] tracking-wider uppercase border border-[#ffb4ab]/40">
                ACTION REQUIRED
              </span>
              <span className="font-bold text-[#f0f4f8] text-[12px] tracking-tight">
                Exchange Still Not Connected — Add Your Exchange API Key
              </span>
            </div>
            <p className="text-[11px] text-[#d9e3f7]/90 mt-0.5">
              Connect your CoinDCX API key to fully activate <strong className="text-[#f2ca50]">live charts</strong>, all <strong className="text-[#57dea3]">Spot & Futures coins</strong>, real-time price streaming, chart indicator tools, and on-screen trade execution.
            </p>
          </div>
        </div>

        {/* Right: Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenConnectModal}
            className="px-3.5 py-1.5 rounded bg-gradient-to-r from-[#d4af37] to-[#f2ca50] hover:brightness-110 text-[#091421] font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>CONNECT API KEY NOW</span>
          </button>

          <button
            onClick={onQuickActivateDemo}
            className="px-3 py-1.5 rounded bg-[#121c2a] hover:bg-[#16202e] text-[#2ebd85] border border-[#2ebd85]/50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Auto-fill verified demo key to test live features instantly"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1-CLICK ACTIVATE</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded text-[#8a94a6] hover:text-[#f0f4f8] hover:bg-[#121c2a] transition-colors ml-1"
            title="Minimize banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
