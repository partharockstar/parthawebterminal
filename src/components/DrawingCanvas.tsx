import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DrawnRegion } from '../types';
import {
  Square,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
} from 'lucide-react';

interface DrawingCanvasProps {
  imageUrl: string;
  regions: DrawnRegion[];
  onAddRegion: (region: DrawnRegion) => void;
  onDeleteRegion: (id: string) => void;
  onClearRegions: () => void;
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  imageUrl,
  regions,
  onAddRegion,
  onDeleteRegion,
  onClearRegions,
  selectedRegionId,
  onSelectRegion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [toolMode, setToolMode] = useState<'draw' | 'pan'>('draw');
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Pan dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  const colors = ['#00f0ff', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];

  // Helper to extract a crop of the image as data URL
  const extractCrop = useCallback(
    (boxXPercent: number, boxYPercent: number, boxWPercent: number, boxHPercent: number): string | undefined => {
      if (!imageRef.current) return undefined;
      const img = imageRef.current;
      const natW = img.naturalWidth || img.clientWidth;
      const natH = img.naturalHeight || img.clientHeight;

      const cropX = (boxXPercent / 100) * natW;
      const cropY = (boxYPercent / 100) * natH;
      const cropW = Math.max(10, (boxWPercent / 100) * natW);
      const cropH = Math.max(10, (boxHPercent / 100) * natH);

      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(400, Math.round(cropW));
        canvas.height = Math.min(250, Math.round(cropH));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/png');
        }
      } catch (err) {
        console.warn('Could not extract crop:', err);
      }
      return undefined;
    },
    []
  );

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom((prev) => Math.min(3.5, Math.max(0.6, Number((prev + zoomFactor).toFixed(2)))));
    }
  };

  // Convert client mouse coordinates to percentage relative to the image element
  const getImageRelativePercent = (e: React.MouseEvent) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'pan') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (toolMode === 'draw') {
      const pt = getImageRelativePercent(e);
      if (!pt) return;
      setIsDrawing(true);
      setStartPoint(pt);
      setCurrentBox({ x: pt.x, y: pt.y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (isDrawing && startPoint) {
      const pt = getImageRelativePercent(e);
      if (!pt) return;

      const x = Math.min(startPoint.x, pt.x);
      const y = Math.min(startPoint.y, pt.y);
      const w = Math.abs(pt.x - startPoint.x);
      const h = Math.abs(pt.y - startPoint.y);

      setCurrentBox({ x, y, w, h });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }

    if (isDrawing && currentBox) {
      setIsDrawing(false);
      if (currentBox.w > 2 && currentBox.h > 2) {
        const color = colors[regions.length % colors.length];
        const cropDataUrl = extractCrop(currentBox.x, currentBox.y, currentBox.w, currentBox.h);

        const newRegion: DrawnRegion = {
          id: 'region-' + Date.now(),
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.w,
          height: currentBox.h,
          cropDataUrl,
          beforeLabel: `Target Element #${regions.length + 1}`,
          afterInstruction: '',
          color,
        };

        onAddRegion(newRegion);
        onSelectRegion(newRegion.id);
      }
      setStartPoint(null);
      setCurrentBox(null);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col gap-2.5 h-full">
      {/* Robotic HUD Toolbar */}
      <div className="flex items-center justify-between bg-[#040814]/90 border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-slate-300 shadow-[0_0_15px_rgba(0,240,255,0.04)] flex-wrap gap-2">
        {/* Tool selectors */}
        <div className="flex items-center gap-1.5 bg-[#02050c] p-1 rounded-lg border border-cyan-500/25">
          <button
            onClick={() => setToolMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
              toolMode === 'draw'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-400/40'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>DRAW BOX</span>
          </button>

          <button
            onClick={() => setToolMode('pan')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer ${
              toolMode === 'pan'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-400/40'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>PAN / MOVE</span>
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.6"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
          />

          <span className="text-[11px] text-cyan-300 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.2).toFixed(2))))}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetView}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 rounded transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {regions.length > 0 && (
            <>
              <span className="text-slate-700">|</span>
              <button
                onClick={onClearRegions}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-0.5 rounded transition-colors text-[11px] cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>CLEAR</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative flex-1 min-h-[350px] max-h-[500px] bg-[#02050c]/90 border border-cyan-500/20 rounded-2xl overflow-hidden flex items-center justify-center select-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] ${
          toolMode === 'draw'
            ? 'cursor-crosshair'
            : isPanning
            ? 'cursor-grabbing'
            : 'cursor-grab'
        }`}
      >
        {/* Transformable Canvas Wrapper */}
        <div
          className="relative inline-block transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Main Screenshot Image */}
          <div className="relative rounded-lg overflow-hidden shadow-2xl border border-cyan-500/30 inline-block">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Screenshot"
              crossOrigin="anonymous"
              className="max-h-[440px] w-auto object-contain block select-none pointer-events-none"
              draggable={false}
            />

            {/* Existing Drawn Regions */}
            {regions.map((region, idx) => {
              const isSelected = region.id === selectedRegionId;
              const color = region.color || colors[idx % colors.length];

              return (
                <div
                  key={region.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(region.id);
                  }}
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    width: `${region.width}%`,
                    height: `${region.height}%`,
                    borderColor: color,
                    backgroundColor: `${color}25`,
                  }}
                  className={`absolute border-2 rounded transition-all z-20 group cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-black border-dashed animate-pulse'
                      : 'hover:border-white'
                  }`}
                >
                  {/* Badge with Box Number */}
                  <div
                    style={{ backgroundColor: color }}
                    className="absolute -top-3 -left-3 w-5 h-5 rounded-full text-black font-extrabold text-[10px] font-mono flex items-center justify-center shadow-lg border border-white z-30"
                  >
                    {idx + 1}
                  </div>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRegion(region.id);
                    }}
                    className="absolute -top-3 -right-3 w-4 h-4 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 cursor-pointer"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              );
            })}

            {/* Currently Drawing Box Preview */}
            {isDrawing && currentBox && (
              <div
                style={{
                  left: `${currentBox.x}%`,
                  top: `${currentBox.y}%`,
                  width: `${currentBox.w}%`,
                  height: `${currentBox.h}%`,
                }}
                className="absolute border-2 border-dashed border-cyan-400 bg-cyan-500/20 rounded pointer-events-none z-30"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
