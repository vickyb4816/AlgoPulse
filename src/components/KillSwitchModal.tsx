import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, Check, Lock } from 'lucide-react';

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmFlatten: () => void;
  activePositionsCount: number;
}

export const KillSwitchModal: React.FC<KillSwitchModalProps> = ({
  isOpen,
  onClose,
  onConfirmFlatten,
  activePositionsCount,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleExecute = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirmFlatten();
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c2a] border border-[#ffb4ab]/40 rounded-lg max-w-md w-full p-5 shadow-2xl font-mono select-none">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#93000a]/40 border border-[#ffb4ab]/50 flex items-center justify-center text-[#ffdad6]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#ffdad6]">
                EMERGENCY KILL SWITCH
              </h3>
              <p className="text-[11px] text-[#ffb4ab]">
                Cancel All Orders & Flatten Active Positions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8a94a6] hover:text-[#d9e3f7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 bg-[#091421] rounded border border-[#212a39] space-y-2 text-xs">
          <div className="flex justify-between text-[#d9e3f7]">
            <span>Active Positions to Market Flatten:</span>
            <strong className="text-[#ffb4ab]">{activePositionsCount}</strong>
          </div>
          <div className="flex justify-between text-[#d9e3f7]">
            <span>Open Limit & Stop Orders:</span>
            <strong className="text-[#f2ca50]">3 Orders (Pending Cancel)</strong>
          </div>
          <div className="flex justify-between text-[#d9e3f7]">
            <span>Algo Execution Daemons:</span>
            <strong className="text-[#ffb4ab]">Instant Pause</strong>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-[#8a94a6] leading-relaxed">
          Executing the kill switch will send market exit orders directly through the CoinDCX low-latency gateway and lock algorithmic triggers until manually re-armed.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2 px-3 bg-[#16202e] hover:bg-[#212a39] text-[#d9e3f7] rounded text-xs font-semibold border border-[#212a39] transition-colors"
          >
            CANCEL
          </button>

          <button
            onClick={handleExecute}
            disabled={confirmed}
            className="py-2 px-3 bg-[#93000a] hover:bg-[#b00010] text-[#ffdad6] rounded text-xs font-bold flex items-center justify-center gap-1.5 border border-[#ffb4ab]/50 transition-colors shadow-lg"
          >
            {confirmed ? (
              <>
                <Check className="w-4 h-4 text-[#ffdad6]" />
                <span>FLATTENING ALL...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-[#ffdad6]" />
                <span>EXECUTE KILL SWITCH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
