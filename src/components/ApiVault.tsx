import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, XCircle, Trash2, Key, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { ApiConnectionState } from '../types';

interface ApiVaultProps {
  apiConnection: ApiConnectionState;
  onVerifyKeys: (key: string, secret: string) => void;
  onPurgeKeys: () => void;
  onOpenVaultSettings?: () => void;
}

export const ApiVault: React.FC<ApiVaultProps> = ({
  apiConnection,
  onVerifyKeys,
  onPurgeKeys,
  onOpenVaultSettings,
}) => {
  const [purged, setPurged] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handlePurge = () => {
    setPurged(true);
    onPurgeKeys();
    setTimeout(() => setPurged(false), 2500);
  };

  const handleTestKey = () => {
    setIsTesting(true);
    setTimeout(() => {
      onVerifyKeys(apiConnection.apiKey, apiConnection.apiSecret);
      setIsTesting(false);
    }, 800);
  };

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#f2ca50]" />
          <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider">
            API Hardening Vault
          </span>
        </div>

        <span
          className={`text-[10px] border px-1.5 py-0.2 rounded font-bold ${
            apiConnection.isKeyVerified
              ? 'bg-[#2ebd85]/15 border-[#2ebd85]/40 text-[#2ebd85]'
              : 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]'
          }`}
        >
          {apiConnection.isKeyVerified ? 'AUTHENTICATED' : 'UNVERIFIED / DUMMY'}
        </span>
      </div>

      {/* Keys preview */}
      <div className="mt-2.5 space-y-2">
        <div>
          <div className="flex justify-between text-[9px] uppercase tracking-wider text-[#8a94a6] mb-0.5">
            <span>HYPERLIQUID AGENT WALLET</span>
            <span className={apiConnection.isKeyVerified ? 'text-[#2ebd85]' : 'text-[#f6465d]'}>
              {apiConnection.isKeyVerified ? 'Verified' : 'Invalid / Dummy'}
            </span>
          </div>
          <div className="flex items-center justify-between px-2 py-1.5 bg-[#091421] border border-[#212a39] rounded">
            <span className="text-[#d9e3f7] text-[11px] font-mono">
              {apiConnection.apiKey ? `${apiConnection.apiKey.substring(0, 10)}••••••••${apiConnection.apiKey.slice(-4)}` : 'No Key Set'}
            </span>
            {apiConnection.isKeyVerified ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2ebd85]" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[#f6465d]" />
            )}
          </div>
        </div>

        <div>
          <span className="text-[9px] uppercase tracking-wider text-[#8a94a6] block mb-0.5">
            EIP-712 SESSION KEY (HARDWARE PROTECTED)
          </span>
          <div className="flex items-center justify-between px-2 py-1.5 bg-[#091421] border border-[#212a39] rounded">
            <span className="text-[#8a94a6] text-[11px] font-mono">
              ••••••••••••••{apiConnection.apiSecret ? apiConnection.apiSecret.slice(-4) : '••••'}
            </span>
            <Lock className="w-3.5 h-3.5 text-[#f2ca50]" />
          </div>
        </div>
      </div>

      {/* Error detail if unverified */}
      {!apiConnection.isKeyVerified && (
        <div className="mt-2 p-2 bg-[#93000a]/15 border border-[#ffb4ab]/30 rounded text-[10px] text-[#ffdad6] leading-snug">
          <strong className="block text-[#ffb4ab]">API Status Check:</strong>
          {apiConnection.errorDetail || 'Unverified or dummy credentials detected. Live exchange execution is locked. Use Demo mode or verify genuine Hyperliquid API Agent keys in Settings.'}
        </div>
      )}

      {/* Permissions Box */}
      <div className="mt-2.5 p-2 bg-[#091421] border border-[#212a39] rounded">
        <div className="text-[10px] font-bold text-[#f2ca50] flex items-center gap-1.5 mb-1.5">
          <ShieldCheck className="w-3 h-3 text-[#f2ca50]" />
          <span>RESTRICTED PERMISSIONS AUDIT</span>
        </div>

        <div className="space-y-1 text-[10.5px]">
          <div className="flex items-center justify-between text-[#d9e3f7]">
            <span>Trade Execution:</span>
            <span className={apiConnection.isKeyVerified ? 'text-[#2ebd85] font-semibold' : 'text-[#8a94a6]'}>
              {apiConnection.isKeyVerified ? 'Allowed' : 'Locked (Unverified)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#d9e3f7]">
            <span>Read Balance & Fills:</span>
            <span className={apiConnection.isKeyVerified ? 'text-[#2ebd85] font-semibold' : 'text-[#8a94a6]'}>
              {apiConnection.isKeyVerified ? 'Allowed' : 'Simulated (Demo Only)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#d9e3f7]">
            <span>Fund Withdrawal:</span>
            <span className="text-[#f6465d] font-bold">FORBIDDEN & REJECTED</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          onClick={handleTestKey}
          disabled={isTesting}
          className="py-1.5 px-2 bg-[#16202e] hover:bg-[#1c2331] text-[#f2ca50] border border-[#212a39] hover:border-[#f2ca50]/50 rounded text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors"
          title="Test key against CoinDCX API signature endpoint"
        >
          <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'TESTING...' : 'VERIFY KEY'}</span>
        </button>

        <button
          onClick={handlePurge}
          className="py-1.5 px-2 bg-[#16202e] hover:bg-[#93000a]/20 text-[#8a94a6] hover:text-[#ffdad6] border border-[#212a39] hover:border-[#ffb4ab]/40 rounded text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-[#ffdad6]" />
          <span>{purged ? 'PURGED' : 'PURGE KEYS'}</span>
        </button>
      </div>
    </div>
  );
};
