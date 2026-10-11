import React, { useState } from 'react';
import { HyperliquidAsset, HyperliquidMarketType } from '../types';
import { Search, TrendingUp, TrendingDown, Layers, ArrowUpDown, Zap, RefreshCw } from 'lucide-react';

interface AssetDiscoveryTableProps {
  perpAssets: HyperliquidAsset[];
  spotAssets: HyperliquidAsset[];
  activeMarketType: HyperliquidMarketType;
  onChangeMarketType: (type: HyperliquidMarketType) => void;
  selectedAsset: HyperliquidAsset;
  onSelectAsset: (asset: HyperliquidAsset) => void;
  onRefreshAssets?: () => void;
  isLoading?: boolean;
}

export const AssetDiscoveryTable: React.FC<AssetDiscoveryTableProps> = ({
  perpAssets,
  spotAssets,
  activeMarketType,
  onChangeMarketType,
  selectedAsset,
  onSelectAsset,
  onRefreshAssets,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'vlm' | 'change' | 'name' | 'funding'>('vlm');
  const [sortAsc, setSortAsc] = useState(false);

  const currentList = activeMarketType === 'PERP' ? perpAssets : spotAssets;

  const filteredAssets = currentList.filter(a => {
    return a.name.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => {
    let diff = 0;
    if (sortField === 'vlm') diff = b.dayNtlVlm - a.dayNtlVlm;
    else if (sortField === 'name') diff = a.name.localeCompare(b.name);
    else if (sortField === 'change') {
      const chgA = ((a.markPx - a.prevDayPx) / a.prevDayPx) * 100;
      const chgB = ((b.markPx - b.prevDayPx) / b.prevDayPx) * 100;
      diff = chgB - chgA;
    } else if (sortField === 'funding') {
      diff = (b.funding || 0) - (a.funding || 0);
    }
    return sortAsc ? -diff : diff;
  });

  const handleSort = (field: 'vlm' | 'change' | 'name' | 'funding') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-[#121c2a] border border-[#212a39] rounded p-3 font-mono text-xs select-none">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#212a39] gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#f2ca50]" />
          <span className="font-display font-bold text-sm text-[#f0f4f8]">
            Hyperliquid Dynamic Markets ({filteredAssets.length})
          </span>
        </div>

        {/* Strict UI Separation: Spot vs Perpetuals / Futures Market */}
        <div className="flex bg-[#091421] border border-[#212a39] rounded p-0.5">
          <button
            onClick={() => onChangeMarketType('PERP')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeMarketType === 'PERP'
                ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                : 'text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
          >
            PERPETUALS / FUTURES
          </button>

          <button
            onClick={() => onChangeMarketType('SPOT')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              activeMarketType === 'SPOT'
                ? 'bg-[#1c2331] text-[#f2ca50] border border-[#f2ca50]/40 shadow-sm'
                : 'text-[#8a94a6] hover:text-[#d9e3f7]'
            }`}
          >
            SPOT MARKET
          </button>
        </div>
      </div>

      {/* Search and Refresh Row */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-[#091421] border border-[#212a39] px-2.5 py-1.5 rounded flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-[#8a94a6]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeMarketType === 'PERP' ? 'Futures' : 'Spot'} assets (e.g. BTC, ETH, SOL)...`}
            className="w-full bg-transparent text-[#d9e3f7] placeholder-[#8a94a6] outline-none text-xs"
          />
        </div>

        {onRefreshAssets && (
          <button
            onClick={onRefreshAssets}
            disabled={isLoading}
            className="px-2.5 py-1.5 bg-[#16202e] hover:bg-[#1c2331] text-[#d9e3f7] hover:text-[#f2ca50] border border-[#212a39] rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            title="Refetch dynamic assets from Hyperliquid API"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>SYNC API</span>
          </button>
        )}
      </div>

      {/* Asset Table */}
      <div className="mt-3 overflow-x-auto max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-[#8a94a6] border-b border-[#212a39] pb-1 uppercase tracking-wider sticky top-0 bg-[#121c2a] z-10">
              <th className="py-1.5 cursor-pointer hover:text-[#f0f4f8]" onClick={() => handleSort('name')}>
                Asset
              </th>
              <th className="py-1.5 text-right">Mark Price</th>
              <th className="py-1.5 text-right cursor-pointer hover:text-[#f0f4f8]" onClick={() => handleSort('change')}>
                24h Change
              </th>
              <th className="py-1.5 text-right cursor-pointer hover:text-[#f0f4f8]" onClick={() => handleSort('vlm')}>
                24h Volume
              </th>
              {activeMarketType === 'PERP' && (
                <>
                  <th className="py-1.5 text-right cursor-pointer hover:text-[#f0f4f8]" onClick={() => handleSort('funding')}>
                    Funding (8h)
                  </th>
                  <th className="py-1.5 text-right">Max Leverage</th>
                </>
              )}
              <th className="py-1.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#212a39]/50 tabular-nums">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.name === asset.name;
              const chg = asset.prevDayPx > 0 ? ((asset.markPx - asset.prevDayPx) / asset.prevDayPx) * 100 : 0;
              const isPositive = chg >= 0;
              const fundingApr = (asset.funding * 3 * 365 * 100).toFixed(2);

              return (
                <tr
                  key={asset.name}
                  onClick={() => onSelectAsset(asset)}
                  className={`hover:bg-[#16202e] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1c2331] font-semibold' : ''
                  }`}
                >
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#f0f4f8]">{asset.name}</span>
                      {activeMarketType === 'PERP' && (
                        <span className="text-[9px] bg-[#212a39] text-[#f2ca50] px-1 py-0.2 rounded font-semibold">
                          {asset.maxLeverage}x
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2 text-right font-medium text-[#f0f4f8]">
                    ${asset.markPx.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: asset.markPx < 1 ? 4 : 2 })}
                  </td>

                  <td className={`py-2 text-right font-bold ${isPositive ? 'text-[#2ebd85]' : 'text-[#f6465d]'}`}>
                    {isPositive ? `+${chg.toFixed(2)}%` : `${chg.toFixed(2)}%`}
                  </td>

                  <td className="py-2 text-right text-[#d9e3f7]">
                    ${(asset.dayNtlVlm / 1000000).toFixed(1)}M
                  </td>

                  {activeMarketType === 'PERP' && (
                    <>
                      <td className="py-2 text-right text-[#f2ca50]">
                        {(asset.funding * 100).toFixed(4)}% <span className="text-[9px] text-[#8a94a6]">({fundingApr}%/yr)</span>
                      </td>

                      <td className="py-2 text-right">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2ebd85]/15 text-[#2ebd85] font-bold">
                          {asset.maxLeverage}x
                        </span>
                      </td>
                    </>
                  )}

                  <td className="py-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset);
                      }}
                      className="px-2 py-0.5 rounded bg-[#1c2331] hover:bg-[#d4af37] text-[#d9e3f7] hover:text-[#091421] text-[10px] font-bold transition-colors border border-[#212a39]"
                    >
                      TRADE
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
