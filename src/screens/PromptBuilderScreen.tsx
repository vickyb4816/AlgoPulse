import React, { useState } from 'react';
import { parseNaturalTradingLogic, SAMPLE_PROMPTS } from '../utils/astCompiler';
import { ASTResult } from '../types';
import { Terminal, Sparkles, CheckCircle2, Zap, ShieldCheck, ArrowRight, Play, Copy, Check, Code2, Cpu } from 'lucide-react';

interface PromptBuilderScreenProps {
  onDeployDemo: (ast: ASTResult) => void;
  onDeployLive: (ast: ASTResult) => void;
  onOpenBacktest: (ast: ASTResult) => void;
}

export const PromptBuilderScreen: React.FC<PromptBuilderScreenProps> = ({
  onDeployDemo,
  onDeployLive,
  onOpenBacktest,
}) => {
  const [prompt, setPrompt] = useState(
    'If price is above 50 EMA and above VWAP then buy after the top of the candle breaks, previous candle low is stop loss and target 1:3'
  );
  const [symbol, setSymbol] = useState('BTC/INR');
  const [compiledAST, setCompiledAST] = useState<ASTResult>(() =>
    parseNaturalTradingLogic('If price is above 50 EMA and above VWAP then buy after the top of the candle breaks, previous candle low is stop loss and target 1:3', 'BTC/INR')
  );
  const [copied, setCopied] = useState(false);
  const [compileTimeMs, setCompileTimeMs] = useState(0.42);

  const handleCompile = (textToCompile?: string, sym?: string) => {
    const start = performance.now();
    const activeText = textToCompile !== undefined ? textToCompile : prompt;
    const activeSym = sym !== undefined ? sym : symbol;
    const result = parseNaturalTradingLogic(activeText, activeSym);
    const end = performance.now();
    setCompileTimeMs(Math.max(0.18, +(end - start).toFixed(2)));
    setCompiledAST(result);
  };

  const handleLoadSample = (sampleText: string) => {
    setPrompt(sampleText);
    handleCompile(sampleText, symbol);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(compiledAST, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-3 pb-8 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Studio Header */}
      <div className="bg-[#121c2a] border border-[#212a39] rounded p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#d4af37]/15 text-[#f2ca50] flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-[#f0f4f8]">
                Offline Prompt-to-Strategy Engine Studio
              </h2>
              <span className="text-[10px] bg-[#2ebd85]/15 text-[#2ebd85] px-2 py-0.5 rounded font-bold border border-[#2ebd85]/30">
                Deterministic AST
              </span>
            </div>
            <p className="text-[11px] text-[#8a94a6] mt-0.5">
              Natural English grammar compiled into executable CoinDCX algorithmic orders in sub-millisecond offline execution. Zero external LLM dependency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[#8a94a6]">Compile Latency:</span>
          <span className="text-[#2ebd85] font-bold tabular-nums">{compileTimeMs} ms</span>
        </div>
      </div>

      {/* Editor & Templates Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Input Textarea & Grammar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
              <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider">
                Natural Trading Logic Input
              </span>

              {/* Symbol selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8a94a6]">Target Pair:</span>
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    handleCompile(prompt, e.target.value);
                  }}
                  className="bg-[#091421] border border-[#212a39] text-[#f2ca50] px-2 py-0.5 rounded text-xs outline-none"
                >
                  <option value="BTC/INR">BTC/INR</option>
                  <option value="ETH/USDT">ETH/USDT</option>
                  <option value="SOL/INR">SOL/INR</option>
                  <option value="POL/INR">POL/INR</option>
                  <option value="DOGE/INR">DOGE/INR</option>
                </select>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe your strategy in natural English (e.g. When 50 EMA crosses above 200 EMA...)"
              className="w-full mt-2.5 bg-[#091421] border border-[#212a39] focus:border-[#d4af37] text-[#d9e3f7] p-3 rounded text-xs leading-relaxed outline-none font-mono"
            />

            {/* Quick Grammar Sample Buttons */}
            <div className="mt-2.5">
              <span className="text-[10px] text-[#8a94a6] uppercase tracking-wider block mb-1">
                Load Certified Grammar Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadSample(sample.text)}
                    className="px-2 py-1 rounded bg-[#16202e] hover:bg-[#1c2331] text-[#8a94a6] hover:text-[#f2ca50] border border-[#212a39] text-[10.5px] transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Compile Action */}
            <div className="mt-4 pt-3 border-t border-[#212a39] flex items-center justify-between">
              <span className="text-[10px] text-[#8a94a6]">
                Grammar Lexer: <strong className="text-[#2ebd85]">100% Deterministic Token Match</strong>
              </span>

              <button
                onClick={() => handleCompile()}
                className="py-2 px-4 bg-[#d4af37] hover:bg-[#b8972e] text-[#091421] font-bold rounded text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#091421]" />
                <span>PARSE & RECOMPILE AST</span>
              </button>
            </div>
          </div>

          {/* Grammar Nodes Visualizer */}
          <div className="bg-[#121c2a] border border-[#212a39] rounded p-3">
            <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider block pb-2 border-b border-[#212a39]">
              Parsed Abstract Syntax Tree Nodes
            </span>

            <div className="mt-3 space-y-2">
              {compiledAST.raw_nodes.conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-[#091421] rounded border border-[#d4af37]/40 text-[#f2ca50]">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span className="font-bold">Condition {i + 1}:</span>
                  <span className="text-[#d9e3f7]">{c}</span>
                </div>
              ))}

              <div className="flex items-center gap-2 p-2 bg-[#091421] rounded border border-[#2ebd85]/40 text-[#2ebd85]">
                <Zap className="w-4 h-4 text-[#2ebd85]" />
                <span className="font-bold">Trigger Logic:</span>
                <span className="text-[#d9e3f7]">{compiledAST.raw_nodes.trigger}</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-[#091421] rounded border border-[#f6465d]/40 text-[#f6465d]">
                <ShieldCheck className="w-4 h-4 text-[#f6465d]" />
                <span className="font-bold">Risk Management:</span>
                <span className="text-[#d9e3f7]">{compiledAST.raw_nodes.risk}</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-[#091421] rounded border border-[#57dea3]/40 text-[#57dea3]">
                <ArrowRight className="w-4 h-4 text-[#57dea3]" />
                <span className="font-bold">Target Objective:</span>
                <span className="text-[#d9e3f7]">{compiledAST.raw_nodes.target}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compiled JSON Output & Deploy Pod (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 flex flex-col flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#212a39]">
              <span className="font-display font-bold text-xs text-[#f0f4f8] uppercase tracking-wider">
                CoinDCX Gateway AST JSON
              </span>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-[#8a94a6] hover:text-[#d9e3f7] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#2ebd85]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <pre className="mt-2.5 p-3 bg-[#091421] rounded border border-[#212a39] text-[#57dea3] text-[11px] leading-relaxed overflow-x-auto flex-1 font-mono">
              {JSON.stringify(compiledAST, null, 2)}
            </pre>

            {/* Direct Deployment Actions */}
            <div className="mt-4 pt-3 border-t border-[#212a39] flex flex-col gap-2">
              <button
                onClick={() => onOpenBacktest(compiledAST)}
                className="w-full py-2 bg-[#1c2331] hover:bg-[#212a39] text-[#d9e3f7] hover:text-[#f2ca50] border border-[#212a39] rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>BACKTEST ON 90D COINDCX TICK ARCHIVE</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDeployDemo(compiledAST)}
                  className="py-2 bg-[#2ebd85] hover:bg-[#26a673] text-[#091421] font-bold rounded text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>DEPLOY DEMO</span>
                </button>

                <button
                  onClick={() => onDeployLive(compiledAST)}
                  className="py-2 bg-transparent hover:bg-[#212a39] text-[#d9e3f7] border border-[#212a39] hover:border-[#f2ca50] font-bold rounded text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <span>DEPLOY LIVE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
