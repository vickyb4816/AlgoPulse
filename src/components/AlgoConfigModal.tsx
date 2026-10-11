import React, { useState } from 'react';
import { InstitutionalAlgo } from '../types';
import { X, Sliders, CheckCircle2, Play, Code2, Sparkles } from 'lucide-react';

interface AlgoConfigModalProps {
  algo: InstitutionalAlgo | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAndDeploy: (algoId: string, updatedParams: any) => void;
}

export const AlgoConfigModal: React.FC<AlgoConfigModalProps> = ({
  algo,
  isOpen,
  onClose,
  onSaveAndDeploy,
}) => {
  if (!isOpen || !algo) return null;

  const [riskReward, setRiskReward] = useState('1:3.0');
  const [stopLossPct, setStopLossPct] = useState('1.5');
  const [allocation, setAllocation] = useState('25000');
  const [slippageBps, setSlippageBps] = useState('12');

  const handleSave = () => {
    onSaveAndDeploy(algo.id, {
      riskReward,
      stopLossPct,
      allocation,
      slippageBps,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c2a] border border-[#212a39] rounded-lg max-w-lg w-full p-5 shadow-2xl font-mono select-none">
        <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f0f4f8]">
                {algo.name} Parameters
              </h3>
              <p className="text-[10px] text-[#8a94a6]">{algo.subtitle}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#8a94a6] hover:text-[#d9e3f7]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Algo description */}
        <p className="mt-3 text-xs text-[#8a94a6] leading-relaxed">
          {algo.description}
        </p>

        {/* Code Snippet Box */}
        <div className="mt-3 p-2 bg-[#091421] rounded border border-[#212a39]">
          <div className="flex items-center gap-1.5 text-[10px] text-[#8a94a6] mb-1">
            <Code2 className="w-3 h-3 text-[#f2ca50]" />
            <span>EXECUTION LOGIC SNIPPET</span>
          </div>
          <code className="text-[11px] text-[#57dea3] block font-mono">
            {algo.codeSnippet}
          </code>
        </div>

        {/* Parameter Controls */}
        <div className="mt-4 space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-[#8a94a6] mb-1">
              <span>Target Risk-to-Reward Multiple:</span>
              <strong className="text-[#f2ca50]">{riskReward}</strong>
            </div>
            <select
              value={riskReward}
              onChange={(e) => setRiskReward(e.target.value)}
              className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-2.5 py-1.5 rounded outline-none"
            >
              <option value="1:1.5">1:1.5 (Quick Scalp)</option>
              <option value="1:2.0">1:2.0 (Conservative)</option>
              <option value="1:2.5">1:2.5 (Standard)</option>
              <option value="1:3.0">1:3.0 (Institutional Default)</option>
              <option value="1:4.0">1:4.0 (Aggressive Runner)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#8a94a6] uppercase tracking-wider mb-1">
                Stop Loss Buffer (%)
              </label>
              <input
                type="number"
                value={stopLossPct}
                onChange={(e) => setStopLossPct(e.target.value)}
                step="0.1"
                className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#8a94a6] uppercase tracking-wider mb-1">
                Allocated Capital (INR)
              </label>
              <input
                type="number"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                step="5000"
                className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-2.5 py-1.5 rounded text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 grid grid-cols-2 gap-2 pt-3 border-t border-[#212a39]">
          <button
            onClick={onClose}
            className="py-2 px-3 bg-[#16202e] hover:bg-[#212a39] text-[#d9e3f7] rounded text-xs font-semibold border border-[#212a39] transition-colors"
          >
            DISCARD
          </button>

          <button
            onClick={handleSave}
            className="py-2 px-3 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>SAVE & DEPLOY ALGO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
