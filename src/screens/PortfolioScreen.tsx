import React, { useState } from 'react';
import { Position, TaxLedgerSummary } from '../types';
import { Wallet, PieChart, FileText, Download, CheckCircle2, RotateCcw, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PortfolioScreenProps {
  equity: number;
  unreservedCash: number;
  allocatedMargin: number;
  positions: Position[];
  taxLedger: TaxLedgerSummary;
  onResetBankroll: () => void;
  onOpenTaxModal: () => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  equity,
  unreservedCash,
  allocatedMargin,
  positions,
  taxLedger,
  onResetBankroll,
  onOpenTaxModal,
}) => {
  const [downloadAck, setDownloadAck] = useState(false);

  const handleDownload = () => {
    setDownloadAck(true);
    setTimeout(() => setDownloadAck(false), 2500);
  };

  return (
    <div className="px-3 pb-8 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Portfolio Overview Banner */}
      <div className="bg-[#121c2a] border border-[#212a39] rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#2ebd85]/15 text-[#2ebd85] flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-[#f0f4f8]">
                Institutional Demo Portfolio & Tax Ledger
              </h2>
              <span className="text-[10px] bg-[#d4af37]/15 text-[#f2ca50] px-2 py-0.5 rounded font-bold border border-[#d4af37]/30">
                INR Base Currency
              </span>
            </div>
            <p className="text-[11px] text-[#8a94a6] mt-0.5">
              Real-time balance, automated risk reservation, and strict statutory tax accounting compliant with Indian Income Tax Act 1961.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetBankroll}
            className="py-1.5 px-3 bg-[#16202e] hover:bg-[#212a39] text-[#f2ca50] border border-[#212a39] rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET BANKROLL (₹1,00,000)</span>
          </button>
        </div>
      </div>

      {/* Asset Allocation & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">NET PORTFOLIO EQUITY</span>
          <span className="font-display text-lg font-bold text-[#2ebd85] tabular-nums mt-0.5 block">
            ₹{equity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2ebd85] font-semibold">
            +{(((equity - 100000) / 100000) * 100).toFixed(2)}% Lifetime Yield
          </span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">AVAILABLE FREE CASH</span>
          <span className="font-display text-lg font-bold text-[#f0f4f8] tabular-nums mt-0.5 block">
            ₹{unreservedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#8a94a6]">Unencumbered Liquidity</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">ACTIVE MARGIN ALLOCATION</span>
          <span className="font-display text-lg font-bold text-[#f2ca50] tabular-nums mt-0.5 block">
            ₹{allocatedMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#8a94a6]">{positions.length} Open Positions</span>
        </div>

        <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block">TDS WITHHELD (SEC 194S)</span>
          <span className="font-display text-lg font-bold text-[#f6465d] tabular-nums mt-0.5 block">
            -₹{taxLedger.tds194s.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#2ebd85]">Traceable via 26AS</span>
        </div>
      </div>

      {/* Form 26AS TDS Credit Ledger Table */}
      <div className="bg-[#121c2a] border border-[#212a39] rounded p-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#212a39] gap-2">
          <div>
            <h3 className="font-display text-sm font-bold text-[#f0f4f8]">
              Form 26AS TDS Withholding Ledger (Section 194S)
            </h3>
            <p className="text-[10px] text-[#8a94a6]">
              All 1% TDS deductions on cryptocurrency transfer consideration recorded by CoinDCX
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="py-1 px-3 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center gap-1.5 transition-colors"
            >
              {downloadAck ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>EXPORT COMPLETED</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT 26AS CERTIFICATE</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-[#8a94a6] border-b border-[#212a39]/60 pb-1">
                <th className="py-1.5">Date</th>
                <th className="py-1.5">Trade Reference</th>
                <th className="py-1.5">Pair</th>
                <th className="py-1.5">Gross Turnover</th>
                <th className="py-1.5">TDS Rate</th>
                <th className="py-1.5">TDS Deducted</th>
                <th className="py-1.5 text-right">Form 26AS Ack #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212a39]/40 tabular-nums">
              {taxLedger.tdsEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#16202e] transition-colors">
                  <td className="py-2 text-[#d9e3f7]">{entry.date}</td>
                  <td className="py-2 text-[#f2ca50] font-semibold">{entry.tradeId}</td>
                  <td className="py-2 text-[#f0f4f8]">{entry.pair}</td>
                  <td className="py-2">₹{entry.sellTurnover.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 text-[#8a94a6]">1.00%</td>
                  <td className="py-2 text-[#f6465d] font-bold">-₹{entry.tdsDeducted.toFixed(2)}</td>
                  <td className="py-2 text-right text-[11px] text-[#2ebd85] font-semibold">{entry.form26asAck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
