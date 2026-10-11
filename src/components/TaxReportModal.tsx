import React, { useState } from 'react';
import { TaxLedgerSummary } from '../types';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Calculator, ExternalLink } from 'lucide-react';

interface TaxReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledger: TaxLedgerSummary;
}

export const TaxReportModal: React.FC<TaxReportModalProps> = ({
  isOpen,
  onClose,
  ledger,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [calcProfit, setCalcProfit] = useState(50000);

  if (!isOpen) return null;

  // Real-time tax calculator math
  const calculatedTax = calcProfit * 0.30;
  const calculatedCess = calculatedTax * 0.04;
  const totalTaxLiability = calculatedTax + calculatedCess;
  const netTakeHome = calcProfit - totalTaxLiability;

  const handleDownload26AS = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-2xl w-full p-5 shadow-2xl font-mono select-none max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f0f4f8]">
                Indian Tax Compliance & Fee Audit (FY 2026-27)
              </h3>
              <p className="text-[10px] text-[#8a94a6]">
                Income Tax Act 1961: Section 115BBH (30% VDA) & Section 194S (1% TDS)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#8a94a6] hover:text-[#d9e3f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Principles Card */}
        <div className="mt-4 p-3 bg-[#091421] rounded border border-[#212a39] space-y-1.5 text-[11px] text-[#8a94a6] leading-relaxed">
          <div className="text-[#f2ca50] font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>MANDATORY STATUTORY TAX RULES IN INDIA:</span>
          </div>
          <p>
            1. <strong className="text-[#d9e3f7]">Flat 30% Tax (Sec 115BBH):</strong> Gains from Virtual Digital Assets (VDA) are taxed flat at 30% plus 4% Health & Education Cess (effective 31.2%).
          </p>
          <p>
            2. <strong className="text-[#d9e3f7]">No Set-Off Allowed:</strong> Losses from one cryptocurrency cannot be set off against gains from another cryptocurrency or any other income head.
          </p>
          <p>
            3. <strong className="text-[#d9e3f7]">1% TDS on Consideration (Sec 194S):</strong> Deducted by CoinDCX on all sell transactions and credited to ITD using PAN.
          </p>
        </div>

        {/* Current Session Ledger Table */}
        <div className="mt-4">
          <div className="text-xs font-bold text-[#d9e3f7] uppercase tracking-wider mb-2">
            Session Realized Tax Audit
          </div>

          <div className="bg-[#091421] rounded border border-[#212a39] overflow-hidden text-xs">
            <div className="flex justify-between p-2 border-b border-[#212a39]">
              <span className="text-[#8a94a6]">Gross Realized Trading Profit:</span>
              <span className="text-[#2ebd85] font-bold tabular-nums">
                +₹{ledger.grossRealizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-[#212a39]">
              <span className="text-[#8a94a6]">CoinDCX Brokerage (0.2% Taker):</span>
              <span className="text-[#f6465d] tabular-nums">
                -₹{ledger.coinDcxFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-[#212a39]">
              <span className="text-[#8a94a6]">GST on Brokerage (18%):</span>
              <span className="text-[#f6465d] tabular-nums">
                -₹{ledger.gstOnBrokerage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-[#212a39]">
              <span className="text-[#8a94a6]">1% TDS Deducted (Sec 194S):</span>
              <span className="text-[#f6465d] tabular-nums">
                -₹{ledger.tds194s.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2 border-b border-[#212a39]">
              <span className="text-[#8a94a6]">Flat 30% VDA Tax + 4% Cess (Sec 115BBH):</span>
              <span className="text-[#f6465d] tabular-nums font-semibold">
                -₹{ledger.vdaTax115bbh.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#2ebd85]/15 font-bold text-sm text-[#2ebd85]">
              <span>NET IN-POCKET CASH RETAINED:</span>
              <span className="tabular-nums font-display">
                +₹{ledger.netInPocketPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Tax Calculator */}
        <div className="mt-4 p-3 bg-[#16202e] rounded border border-[#212a39]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f2ca50] mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Projected Profit Tax Calculator</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
                Hypothetical Crypto Gains (INR)
              </label>
              <input
                type="number"
                value={calcProfit}
                onChange={(e) => setCalcProfit(parseFloat(e.target.value) || 0)}
                step="5000"
                className="w-full bg-[#091421] border border-[#212a39] text-[#d9e3f7] px-2.5 py-1 rounded text-xs outline-none"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8a94a6] block">Net In-Pocket (Post 31.2% Tax)</span>
              <span className="text-sm font-bold text-[#2ebd85] font-display tabular-nums">
                ₹{netTakeHome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Form 26AS Reconciliation Section */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#212a39]">
          <div className="text-[11px] text-[#8a94a6]">
            <span>Form 26AS TDS Certificate status: </span>
            <strong className="text-[#2ebd85]">Reconciled with TRACES Portal</strong>
          </div>

          <button
            onClick={handleDownload26AS}
            className="py-1.5 px-3 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#091421]" />
                <span>DOWNLOADED FORM 26AS JSON</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT FORM 26AS TDS CERTIFICATE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
