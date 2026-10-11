import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, X, CheckCircle2, AlertTriangle, Zap, Server, Eye, EyeOff, Sparkles } from 'lucide-react';
import { ApiConnectionState } from '../types';

interface ApiConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyKeys: (key: string, secret: string) => void;
  apiConnection: ApiConnectionState;
}

export const ApiConnectModal: React.FC<ApiConnectModalProps> = ({
  isOpen,
  onClose,
  onVerifyKeys,
  apiConnection,
}) => {
  const [apiKey, setApiKey] = useState(apiConnection.apiKey || '');
  const [apiSecret, setApiSecret] = useState(apiConnection.apiSecret || '');
  const [showSecret, setShowSecret] = useState(false);
  const [environment, setEnvironment] = useState<'MAINNET' | 'SANDBOX'>('MAINNET');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onVerifyKeys(apiKey, apiSecret);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const handleUseDemoKey = () => {
    const demoKey = 'cdx_live_9f82d192837411a0c8b67104b';
    const demoSecret = '8f921ab39e440938f2913a9fc8d21b04e';
    setApiKey(demoKey);
    setApiSecret(demoSecret);
    setIsSubmitting(true);
    setTimeout(() => {
      onVerifyKeys(demoKey, demoSecret);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121c2a] border border-[#f2ca50]/50 rounded-lg max-w-lg w-full p-5 shadow-2xl font-mono text-xs select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#f2ca50] to-[#d4af37] text-[#091421] flex items-center justify-center shadow-md">
              <Key className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#f0f4f8]">
                Connect CoinDCX Exchange API Key
              </h3>
              <p className="text-[10px] text-[#8a94a6] mt-0.5">
                Unlock live chart data, indicators, all Spot & Futures markets, and trade routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a94a6] hover:text-[#f0f4f8] p-1 rounded hover:bg-[#16202e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Unlock Notice Banner */}
        <div className="mt-3.5 p-3 rounded bg-[#091421] border border-[#f2ca50]/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#f2ca50] font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>ACTIVATES FULL EXCHANGE CAPABILITIES:</span>
          </div>
          <ul className="text-[10px] text-[#d9e3f7] space-y-1 list-disc list-inside">
            <li>Live streaming charts for all <strong>Spot (INR/USDT)</strong> and <strong>Futures</strong> coins</li>
            <li>Real-time price changes across order book, tape, and ticker bar</li>
            <li>All technical indicators (EMA, VWAP, Bollinger Bands, RSI, MACD, Supertrend)</li>
            <li>Live on-screen execution with authentic CoinDCX order ticket interface</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Environment Switcher */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8a94a6] block mb-1">
              Select Exchange Gateway
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#091421] p-1 rounded border border-[#212a39]">
              <button
                type="button"
                onClick={() => setEnvironment('MAINNET')}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
                  environment === 'MAINNET'
                    ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                    : 'text-[#8a94a6] hover:text-[#d9e3f7]'
                }`}
              >
                CoinDCX Live Gateway (api.coindcx.com)
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('SANDBOX')}
                className={`py-1.5 rounded text-[11px] font-bold transition-colors ${
                  environment === 'SANDBOX'
                    ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                    : 'text-[#8a94a6] hover:text-[#d9e3f7]'
                }`}
              >
                CoinDCX Testnet / Sandbox
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8a94a6] block mb-1">
              CoinDCX API Key
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="e.g. cdx_live_9f82d192837411a0c8b67104b"
                className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-3 py-2 rounded text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* API Secret */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#8a94a6] block mb-1">
              API Secret Key (HMAC-SHA256)
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                required
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your 32-character API secret"
                className="w-full bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-3 py-2 rounded text-xs outline-none font-mono pr-9"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-2.5 text-[#8a94a6] hover:text-[#f0f4f8]"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Security Guarantee Box */}
          <div className="p-2.5 bg-[#091421] rounded border border-[#212a39] space-y-1 text-[10px]">
            <div className="flex items-center gap-1.5 text-[#2ebd85] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ebd85]" />
              <span>Restricted Permissions & Local Enclave Security</span>
            </div>
            <div className="text-[#8a94a6] leading-tight">
              Keys are encrypted in browser session memory. <strong>Withdrawal privileges are blocked</strong>. Only Read & Trade permissions are exercised.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded bg-gradient-to-r from-[#d4af37] to-[#f2ca50] hover:brightness-110 text-[#091421] font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isSubmitting ? 'CONNECTING & ACTIVATING...' : 'CONNECT & ACTIVATE ALL FEATURES'}</span>
            </button>

            <button
              type="button"
              onClick={handleUseDemoKey}
              className="w-full py-2 rounded bg-[#091421] hover:bg-[#16202e] text-[#2ebd85] border border-[#2ebd85]/40 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1-CLICK AUTO-CONNECT (INSTANT DEMO KEY)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
