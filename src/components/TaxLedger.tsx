import React from 'react';
import { TaxLedgerSummary } from '../types';
import { Receipt, FileText, ExternalLink, HelpCircle } from 'lucide-react';

interface TaxLedgerProps {
  ledger: TaxLedgerSummary;
  onOpenTaxModal: () => void;
}

export const TaxLedger: React.FC<TaxLedgerProps> = ({
  ledger,
  onOpenTaxModal,
}) => {
  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <div className="flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5 text-[#f2ca50]" />
          <span className="font-display font-bold text-sm text-[#f0f4f8]">
            Indian Tax & Fee Ledger
          </span>
        </div>

        <span className="text-[10px] bg-[#16202e] border border-[#212a39] text-[#f2ca50] font-bold px-1.5 py-0.2 rounded">
          FY 2026-27
        </span>
      </div>

      <p className="text-[10px] text-[#8a94a6] mt-2 leading-relaxed">
        Simulated accounting strictly compliant with Income Tax Act Sec 115BBH & Sec 194S (No loss set-off).
      </p>

      {/* Breakdown Items */}
      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#d9e3f7]">Gross Realized Profit</span>
          <span className="font-bold text-[#2ebd85] tabular-nums">
            +₹{ledger.grossRealizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8a94a6]">CoinDCX Taker Fee (0.2%)</span>
          <span className="text-[#f6465d] tabular-nums">
            -₹{ledger.coinDcxFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8a94a6]">GST on Brokerage (18%)</span>
          <span className="text-[#f6465d] tabular-nums">
            -₹{ledger.gstOnBrokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8a94a6]">1% TDS on Sells (Sec 194S)</span>
          <span className="text-[#f6465d] tabular-nums">
            -₹{ledger.tds194s.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#8a94a6]">30% Flat VDA Tax (Sec 115BBH)</span>
          <span className="text-[#f6465d] tabular-nums">
            -₹{ledger.vdaTax115bbh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Net In-Pocket PnL Box */}
      <div className="mt-3 p-2 rounded bg-[#2ebd85]/15 border border-[#2ebd85]/40 flex items-center justify-between">
        <span className="font-bold text-xs text-[#2ebd85] uppercase tracking-wider">
          NET IN-POCKET PNL
        </span>
        <span className="font-display text-base font-bold text-[#2ebd85] tabular-nums">
          +₹{ledger.netInPocketPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Regulatory Audit Note */}
      <div className="mt-2.5 p-2 rounded bg-[#091421] border border-[#212a39]/70 text-[10px] text-[#8a94a6] leading-relaxed">
        <strong className="text-[#d9e3f7]">Regulatory Audit:</strong> Crypto gains are taxed flat @ 30% plus applicable 4% cess. Losses in one crypto pair cannot be set off against profits in another. TDS certificates are reconcilable via Form 26AS.
      </div>

      {/* Action to open comprehensive breakdown */}
      <button
        onClick={onOpenTaxModal}
        className="w-full mt-2.5 py-1.5 px-2 bg-[#16202e] hover:bg-[#1c2331] text-[#f2ca50] border border-[#212a39] rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        <FileText className="w-3 h-3" />
        <span>TAX BREAKDOWN & FORM 26AS RECONCILIATION</span>
      </button>
    </div>
  );
};
