import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050f1c] border-t border-[#212a39] px-4 py-3 text-xs font-mono select-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-[#d9e3f7]">
            ALGOPULSE V1 • OCTOBER 2026 <span className="text-[#8a94a6]">|</span> © 2026 Vicky Bhalerao. All rights reserved.
          </div>
          <p className="text-[10px] text-[#8a94a6] max-w-4xl leading-relaxed">
            Regulatory Disclaimer: Cryptocurrency trading via CoinDCX API involves substantial market volatility and systemic risk of financial loss. High-frequency and algorithmic strategies run automatically at user discretion.
          </p>
        </div>

        {/* Health status cluster */}
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 text-[#2ebd85]">
            <span className="w-2 h-2 rounded-full bg-[#2ebd85] animate-pulse"></span>
            <span>API V2 HEALTHY</span>
          </div>

          <span className="text-[#212a39]">|</span>

          <span className="text-[#d9e3f7]">REST: 200 OK</span>

          <span className="text-[#212a39]">|</span>

          <div className="flex items-center gap-1 text-[#f2ca50]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>COINDCX VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
