import React from 'react';
import { OrderExecutionDebugLog } from '../types';
import { Terminal, Shield, CheckCircle2, XCircle, Code2, AlertTriangle, X } from 'lucide-react';

interface ExecutionDebugDrawerProps {
  logs: OrderExecutionDebugLog[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
}

export const ExecutionDebugDrawer: React.FC<ExecutionDebugDrawerProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050f1c]/80 backdrop-blur-sm flex items-center justify-end">
      <div className="bg-[#121c2a] border-l border-[#212a39] w-full max-w-2xl h-full p-5 shadow-2xl font-mono text-xs select-none flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#212a39]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#f2ca50]" />
            <h3 className="font-display font-bold text-sm text-[#f0f4f8]">
              Hyperliquid Order Execution & Diagnostic Console ({logs.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="text-[10px] text-[#8a94a6] hover:text-[#ffdad6] px-2 py-1 rounded bg-[#091421] border border-[#212a39]"
            >
              Clear Logs
            </button>
            <button onClick={onClose} className="text-[#8a94a6] hover:text-[#f0f4f8]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#8a94a6] bg-[#091421] rounded border border-[#212a39]">
              No order executions logged yet. Place a Long or Short order to inspect payloads.
            </div>
          ) : (
            logs.map((log) => {
              const isShort = !log.is_buy;
              return (
                <div
                  key={log.id}
                  className="p-3 bg-[#091421] rounded border border-[#212a39] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isShort
                            ? 'bg-[#f6465d]/20 text-[#f6465d] border border-[#f6465d]/40'
                            : 'bg-[#2ebd85]/20 text-[#2ebd85] border border-[#2ebd85]/40'
                        }`}
                      >
                        {log.side}
                      </span>
                      <span className="font-bold text-[#f0f4f8]">{log.coin}</span>
                      <span className="text-[10px] text-[#8a94a6]">Asset Index #{log.assetIndex}</span>
                    </div>

                    <span className="text-[10px] text-[#8a94a6]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-[10.5px] p-2 bg-[#121c2a] rounded">
                    <div>
                      <span className="text-[#8a94a6] block text-[9px]">IS_BUY FLAG</span>
                      <strong className={log.is_buy ? 'text-[#2ebd85]' : 'text-[#f6465d]'}>
                        {String(log.is_buy)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#8a94a6] block text-[9px]">REDUCE ONLY</span>
                      <strong className="text-[#f0f4f8]">{String(log.reduce_only)}</strong>
                    </div>

                    <div>
                      <span className="text-[#8a94a6] block text-[9px]">SIZE / PRICE</span>
                      <strong className="text-[#f2ca50]">{log.sz} @ ${log.limit_px}</strong>
                    </div>

                    <div>
                      <span className="text-[#8a94a6] block text-[9px]">LEVERAGE</span>
                      <strong className="text-[#d9e3f7]">{log.leverage}x ({log.isCross ? 'Cross' : 'Isolated'})</strong>
                    </div>
                  </div>

                  {/* Raw Payload Preview */}
                  <div>
                    <span className="text-[9.5px] text-[#8a94a6] uppercase font-bold block mb-1">
                      Exact Dispatched Action Payload JSON:
                    </span>
                    <pre className="p-2 bg-[#050f1c] rounded text-[#57dea3] text-[10px] overflow-x-auto font-mono">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>

                  {/* Exchange Gateway Response */}
                  <div className="text-[10px] text-[#2ebd85] flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ebd85]" />
                    <span>{log.rawExchangeMsg}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#212a39] flex items-center justify-between text-[11px] text-[#8a94a6]">
          <span>Hyperliquid Gateway: <strong className="text-[#2ebd85]">200 OK</strong></span>
          <button
            onClick={onClose}
            className="py-1 px-4 bg-[#16202e] hover:bg-[#212a39] text-[#f0f4f8] rounded font-bold"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
