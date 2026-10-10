import React from 'react';
import { DrawnRegion } from '../types';
import { ArrowRight, Trash2 } from 'lucide-react';

interface BeforeAfterListProps {
  regions: DrawnRegion[];
  onUpdateRegion: (id: string, updates: Partial<DrawnRegion>) => void;
  onDeleteRegion: (id: string) => void;
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
}

export const BeforeAfterList: React.FC<BeforeAfterListProps> = ({
  regions,
  onUpdateRegion,
  onDeleteRegion,
  selectedRegionId,
  onSelectRegion,
}) => {
  if (regions.length === 0) {
    return (
      <div className="bg-[#02050c]/60 border border-cyan-500/20 rounded-xl p-5 text-center font-mono text-xs text-slate-400">
        [ AWAITING TARGET REGIONS // DRAW BOX OVER ANY WEB ELEMENT ]
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {regions.map((region, idx) => {
        const isSelected = region.id === selectedRegionId;
        const color = region.color || '#00f0ff';

        return (
          <div
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className={`p-3 rounded-xl border transition-all ${
              isSelected
                ? 'bg-[#030918] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-[#02050c]/80 border-cyan-500/20 hover:border-cyan-500/40'
            }`}
          >
            {/* Header: Number, Title, Delete */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <span
                  style={{ backgroundColor: color }}
                  className="w-5 h-5 rounded-full text-black font-extrabold font-mono text-[10px] flex items-center justify-center shrink-0 shadow"
                >
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={region.beforeLabel}
                  onChange={(e) =>
                    onUpdateRegion(region.id, { beforeLabel: e.target.value })
                  }
                  className="bg-transparent text-slate-200 font-mono font-semibold text-xs focus:outline-none focus:border-b focus:border-cyan-400 px-1 py-0.5 flex-1"
                  placeholder={`Element #${idx + 1}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRegion(region.id);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clean Before ➔ After Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* BEFORE */}
              <div className="md:col-span-4 bg-[#010308] border border-cyan-500/20 rounded-lg p-2 flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  BEFORE
                </span>

                {region.cropDataUrl ? (
                  <div className="relative rounded overflow-hidden border border-cyan-500/25 bg-black max-h-20 flex items-center justify-center">
                    <img
                      src={region.cropDataUrl}
                      alt="Before"
                      className="max-h-20 w-auto object-contain block"
                    />
                  </div>
                ) : (
                  <div className="h-14 rounded bg-[#030612] border border-cyan-500/10 flex items-center justify-center font-mono text-[10px] text-slate-500">
                    PREVIEW
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="hidden md:flex md:col-span-1 items-center justify-center text-cyan-400">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </div>

              {/* AFTER */}
              <div className="md:col-span-7 flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  AFTER
                </span>

                <textarea
                  rows={2}
                  value={region.afterInstruction}
                  onChange={(e) =>
                    onUpdateRegion(region.id, { afterInstruction: e.target.value })
                  }
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Define mutation (e.g. Hide completely, Change text, Dark theme)..."
                  className="w-full bg-[#010308] border border-cyan-500/25 focus:border-cyan-400 rounded-lg p-2 font-mono text-xs text-cyan-200 placeholder-slate-600 focus:outline-none transition-colors leading-relaxed resize-none shadow-inner"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
