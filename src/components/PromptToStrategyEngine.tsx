import React, { useState } from 'react';
import { parseNaturalTradingLogic, SAMPLE_PROMPTS } from '../utils/astCompiler';
import { ASTResult } from '../types';
import { Terminal, ShieldCheck, CheckCircle2, Zap, ArrowRight, Play, Copy, Check, Sparkles } from 'lucide-react';

interface PromptToStrategyEngineProps {
  onDeployDemo: (ast: ASTResult) => void;
  onDeployLive: (ast: ASTResult) => void;
  onOpenBacktest: (ast: ASTResult) => void;
}

export const PromptToStrategyEngine: React.FC<PromptToStrategyEngineProps> = ({
  onDeployDemo,
  onDeployLive,
  onOpenBacktest,
}) => {
  const [promptInput, setPromptInput] = useState(
    'If price is above 50 EMA and above VWAP then buy after the top of the candle breaks, previous candle low is stop loss and target 1:3'
  );
  const [compiledAST, setCompiledAST] = useState<ASTResult>(() =>
    parseNaturalTradingLogic('If price is above 50 EMA and above VWAP then buy after the top of the candle breaks, previous candle low is stop loss and target 1:3')
  );
  const [copied, setCopied] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  const handleCompile = () => {
    const ast = parseNaturalTradingLogic(promptInput);
    setCompiledAST(ast);
  };

  const handleLoadSample = (sample: typeof SAMPLE_PROMPTS[0], idx: number) => {
    setPromptInput(sample.text);
    setActivePresetIndex(idx);
    const ast = parseNaturalTradingLogic(sample.text);
    setCompiledAST(ast);
  };

  const handleCopyAST = () => {
    navigator.clipboard.writeText(JSON.stringify(compiledAST, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 text-xs font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#212a39] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#f2ca50]/15 text-[#f2ca50] flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#f0f4f8]">
                Offline Prompt-to-Strategy Engine
              </span>
            </div>
            <p className="text-[10px] text-[#8a94a6] leading-none mt-0.5">
              Deterministic Abstract Syntax Tree (AST) Tokenizer • Zero AI API dependencies • Sub-millisecond compiling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#2ebd85]/10 border border-[#2ebd85]/30 text-[#2ebd85] font-semibold">
            COINDCX GRAMMAR V2.4 LOADED
          </span>
          <span className="px-2 py-0.5 rounded bg-[#212a39] text-[#8a94a6] font-medium">
            100% CLIENT-SIDE PRIVACY
          </span>
        </div>
      </div>

      {/* Natural language input row */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#8a94a6] tracking-wider uppercase">
            Natural Trading Logic (Plain English Grammar)
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8a94a6]">Quick Presets:</span>
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample, idx)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  activePresetIndex === idx
                    ? 'bg-[#d4af37]/20 text-[#f2ca50] underline'
                    : 'text-[#8a94a6] hover:text-[#d9e3f7] hover:bg-[#16202e]'
                }`}
              >
                {sample.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCompile()}
            placeholder="Type trading rule in plain English (e.g., If price is above 50 EMA and above VWAP...)"
            className="flex-1 bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] px-3 py-2 rounded text-xs outline-none transition-colors"
          />

          <button
            onClick={handleCompile}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#091421]" />
            <span>PARSE & COMPILE TO AST</span>
          </button>
        </div>
      </div>

      {/* Grammar Nodes State Machine Badges */}
      <div className="mt-3 pt-2.5 border-t border-[#212a39]/60">
        <div className="text-[10px] font-bold text-[#8a94a6] tracking-wider uppercase mb-1.5">
          Detected Grammar Nodes (Deterministic State Machine):
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {compiledAST.raw_nodes.conditions.map((cond, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#16202e] border border-[#d4af37]/40 text-[#f2ca50] text-[11px]"
            >
              <CheckCircle2 className="w-3 h-3 text-[#d4af37]" />
              <span className="font-semibold">Condition {idx + 1}:</span>
              <span>{cond}</span>
            </div>
          ))}

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#16202e] border border-[#2ebd85]/40 text-[#2ebd85] text-[11px]">
            <Zap className="w-3 h-3 text-[#2ebd85]" />
            <span className="font-semibold">Trigger:</span>
            <span>{compiledAST.raw_nodes.trigger}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#16202e] border border-[#f6465d]/40 text-[#f6465d] text-[11px]">
            <ShieldCheck className="w-3 h-3 text-[#f6465d]" />
            <span className="font-semibold">Risk:</span>
            <span>{compiledAST.raw_nodes.risk}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#16202e] border border-[#57dea3]/40 text-[#57dea3] text-[11px]">
            <ArrowRight className="w-3 h-3 text-[#57dea3]" />
            <span className="font-semibold">Target:</span>
            <span>{compiledAST.raw_nodes.target}</span>
          </div>
        </div>
      </div>

      {/* Compiled AST JSON & Execution Dock */}
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* JSON Preview */}
        <div className="lg:col-span-8 bg-[#091421] border border-[#212a39] rounded p-2.5 relative">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#212a39] text-[10px] text-[#8a94a6]">
            <span>AST COMPILER OUTPUT (COINDCX EXECUTION SPEC)</span>
            <button
              onClick={handleCopyAST}
              className="flex items-center gap-1 text-[#8a94a6] hover:text-[#d9e3f7] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-[#2ebd85]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
            </button>
          </div>
          <pre className="text-[10.5px] leading-relaxed text-[#57dea3] overflow-x-auto max-h-36 pt-1.5 font-mono">
            {JSON.stringify(compiledAST, null, 2)}
          </pre>
        </div>

        {/* Action Buttons Column */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-2 bg-[#16202e] border border-[#212a39] rounded p-2.5">
          <div className="text-[10px] text-[#8a94a6] leading-snug">
            Compiled with zero external latency. Instantly backtestable against historical CoinDCX order ticks or deployable directly to memory cache.
          </div>

          <div className="flex flex-col gap-1.5 mt-auto">
            <button
              onClick={() => onOpenBacktest(compiledAST)}
              className="w-full py-1.5 px-2 bg-[#1c2331] hover:bg-[#212a39] text-[#d9e3f7] hover:text-[#f2ca50] border border-[#212a39] rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3" />
              <span>BACKTEST (90D COINDCX DATA)</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onDeployDemo(compiledAST)}
                className="py-1.5 px-2 bg-[#2ebd85] hover:bg-[#26a673] text-[#091421] font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>DEPLOY DEMO</span>
              </button>

              <button
                onClick={() => onDeployLive(compiledAST)}
                className="py-1.5 px-2 bg-transparent hover:bg-[#212a39] text-[#d9e3f7] border border-[#212a39] hover:border-[#f2ca50] font-bold rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
              >
                <span>DEPLOY LIVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
