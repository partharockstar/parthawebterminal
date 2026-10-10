/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Play,
  FileCode,
  AlertCircle,
  Zap,
  Globe,
  Loader2,
  ClipboardPaste,
  Square,
  Crosshair,
  Cpu,
  Radio,
  Terminal,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { DrawnRegion, GeneratedScriptResponse } from './types';
import { SAMPLE_PRESETS } from './utils/samples';
import { DrawingCanvas } from './components/DrawingCanvas';
import { BeforeAfterList } from './components/BeforeAfterList';
import { ScriptViewer } from './components/ScriptViewer';
import { EarthBackground } from './components/EarthBackground';
import { AccessGate } from './components/AccessGate';

export default function App() {
  // Authentication Gateway State (Authorized: "Partha" or "Farhan")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('screenmonkey_auth') === 'true';
  });
  const [operatorName, setOperatorName] = useState<string>(() => {
    return localStorage.getItem('screenmonkey_operator') || '';
  });

  const handleUnlock = (name: string) => {
    setIsAuthenticated(true);
    setOperatorName(name);
    localStorage.setItem('screenmonkey_auth', 'true');
    localStorage.setItem('screenmonkey_operator', name);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setOperatorName('');
    localStorage.removeItem('screenmonkey_auth');
    localStorage.removeItem('screenmonkey_operator');
  };

  // Empty state by default as requested: "cross deya jayga ta faka thakbe"
  const [imageUrl, setImageUrl] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [regions, setRegions] = useState<DrawnRegion[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const [matchUrl, setMatchUrl] = useState<string>('*://*/*');
  const [scriptName, setScriptName] = useState<string>('Custom UI Tweaker');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedScriptResponse | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global clipboard paste listener (Ctrl+V)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            readAndSetImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAuthenticated]);

  const readAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setMimeType(file.type || 'image/png');
        setRegions([]); // Empty list for newly uploaded image
        setSelectedRegionId(null);
        setScriptName('Custom Web Tweaker');
        setMatchUrl('*://*/*');
        setGenerationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readAndSetImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readAndSetImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setImageUrl(preset.imageUrl);
    setMimeType('image/png');
    setRegions(preset.regions);
    setSelectedRegionId(null);
    setMatchUrl(preset.matchUrl);
    setScriptName(preset.scriptName);
    setGenerationError(null);
  };

  const handleAddRegion = (region: DrawnRegion) => {
    setRegions((prev) => [...prev, region]);
  };

  const handleUpdateRegion = (id: string, updates: Partial<DrawnRegion>) => {
    setRegions((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, ...updates } : reg))
    );
  };

  const handleDeleteRegion = (id: string) => {
    setRegions((prev) => prev.filter((reg) => reg.id !== id));
    if (selectedRegionId === id) setSelectedRegionId(null);
  };

  const handleClearRegions = () => {
    setRegions([]);
    setSelectedRegionId(null);
  };

  // Generate Userscript via Gemini API
  const handleGenerateScript = async () => {
    if (!imageUrl && regions.length === 0) {
      setGenerationError('Please upload a screenshot and mark regions to modify.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/generate-tampermonkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageUrl,
          mimeType,
          prompt: '',
          matchUrl: matchUrl || '*://*/*',
          scriptName: scriptName || 'Custom UI Tweaker',
          regions,
          strategy: 'smart',
          runAt: 'document-idle',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate userscript.');
      }

      const data: GeneratedScriptResponse = await response.json();
      setGeneratedResult(data);
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'An error occurred while compiling script.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine Userscript
  const handleRefineScript = async (feedback: string) => {
    if (!generatedResult) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-tampermonkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScript: generatedResult.tampermonkeyCode,
          feedback,
          imageBase64: imageUrl,
          mimeType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine userscript.');
      }

      const data = await response.json();
      setGeneratedResult((prev) =>
        prev
          ? {
              ...prev,
              scriptName: data.scriptName || prev.scriptName,
              summary: data.summary || prev.summary,
              tampermonkeyCode: data.tampermonkeyCode,
              changes: data.changes || prev.changes,
              tips: data.tips || prev.tips,
            }
          : data
      );
    } catch (err: any) {
      alert(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* 3D Rotating Earth & Deep Space Background with Blur */}
      <EarthBackground />

      {/* Cybernetic Robotic HUD Header */}
      <header className="relative z-20 border-b border-cyan-500/20 bg-[#030712]/80 backdrop-blur-xl px-4 lg:px-8 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-lg bg-[#050f24] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black font-mono tracking-widest text-white uppercase flex items-center gap-1.5">
                  SCREENMONKEY <span className="text-cyan-400">//</span> OS
                </h1>
                <span className="text-[9px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded tracking-wider font-semibold">
                  SYS: ONLINE
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wider">
                ORBITAL USERSCRIPT SYNTHESIZER
              </p>
            </div>
          </div>

          {/* Right Header: Operator Clearance Badge & Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Operator Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#040d20] border border-cyan-500/30 text-cyan-300 font-mono text-xs shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-slate-400">OPERATOR:</span>
                <span className="font-bold text-white uppercase tracking-wider">{operatorName}</span>
              </div>

              {/* Sample preset selector */}
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cyan-400/70">PRESETS:</span>
                <div className="flex items-center gap-1 bg-[#02050c]/80 p-0.5 rounded-lg border border-cyan-500/25">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all cursor-pointer ${
                        imageUrl === preset.imageUrl
                          ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                          : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
                      }`}
                      title={preset.description}
                    >
                      {preset.title.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lock / Exit button */}
              <button
                onClick={handleLock}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-500/30 hover:border-rose-400 text-rose-300 font-mono text-xs transition-all shadow-sm cursor-pointer"
                title="Lock terminal and exit workspace"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">LOCK</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>TERMINAL LOCKED</span>
            </div>
          )}
        </div>
      </header>

      {/* Main View: Access Gate (Login Home) OR Workstation */}
      {!isAuthenticated ? (
        <AccessGate onUnlock={handleUnlock} />
      ) : (
        <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visual Draw Canvas + Before-After Transformation list (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Screenshot & Drawing Canvas Box */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`bg-[#040816]/75 border rounded-2xl p-4 transition-all shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(0,240,255,0.3)]'
                  : 'border-cyan-500/25 hover:border-cyan-500/40'
              }`}
            >
              {/* Cyber Corner Decals */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

              {/* Header: Upload / Replace */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Square className="w-3.5 h-3.5 text-cyan-400" />
                  CANVAS // DRAW BOX OVER ELEMENTS
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-[#030814] hover:bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 px-3 py-1 rounded-lg border border-cyan-500/30 transition-all shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-cyan-400" />
                    <span>UPLOAD</span>
                  </button>
                </div>
              </div>

              {/* Empty Viewport as requested ("cross deya jayga ta faka thakbe") */}
              {imageUrl ? (
                <DrawingCanvas
                  imageUrl={imageUrl}
                  regions={regions}
                  onAddRegion={handleAddRegion}
                  onDeleteRegion={handleDeleteRegion}
                  onClearRegions={handleClearRegions}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={setSelectedRegionId}
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-cyan-500/30 rounded-xl min-h-[360px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-cyan-400 hover:bg-cyan-950/10 transition-all bg-[#02050c]/60 text-center relative group"
                >
                  {/* Crosshairs & Reticle HUD */}
                  <div className="relative w-16 h-16 rounded-full border border-cyan-500/40 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                    <Crosshair className="w-8 h-8 text-cyan-400" />
                    <div className="absolute inset-0 rounded-full border-t border-cyan-300 animate-spin" />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase">
                      INITIALIZE VISUAL FEED
                    </p>
                    <p className="text-[11px] font-mono text-cyan-400/80">
                      CLICK TO UPLOAD SCREENSHOT OR PASTE [CTRL + V]
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <ClipboardPaste className="w-3 h-3 text-cyan-400" />
                  PASTE: [CTRL+V]
                </span>
                <span>SCROLL: ZOOM &bull; DRAG: DRAW BOX</span>
              </div>
            </div>

            {/* Clean Before ➔ After Transformations Card */}
            <div className="bg-[#040816]/75 border border-cyan-500/25 rounded-2xl p-4 shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
              <BeforeAfterList
                regions={regions}
                onUpdateRegion={handleUpdateRegion}
                onDeleteRegion={handleDeleteRegion}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
              />
            </div>

            {/* Clean Bottom Bar: Target URL & Generate Button */}
            <div className="bg-[#040816]/75 border border-cyan-500/25 rounded-2xl p-3.5 shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 font-mono">
                <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <label className="text-[11px] text-cyan-300/80 shrink-0 font-bold uppercase tracking-wider">
                  TARGET URL:
                </label>
                <input
                  type="text"
                  value={matchUrl}
                  onChange={(e) => setMatchUrl(e.target.value)}
                  placeholder="*://*/*"
                  className="flex-1 bg-[#02050c] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono shadow-inner focus:outline-none"
                />
              </div>

              {/* Error Message */}
              {generationError && (
                <div className="bg-rose-950/60 border border-rose-500/40 text-rose-300 p-2.5 rounded-xl text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}

              {/* Cyberpunk Action Button */}
              <button
                onClick={handleGenerateScript}
                disabled={isGenerating || (!imageUrl && regions.length === 0)}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-black font-extrabold font-mono py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>SYNTHESIZING SCRIPT WITH GEMINI AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black fill-black" />
                    <span>COMPILE TAMPERMONKEY SCRIPT ({regions.length} CHANGES)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: DIRECT CODE SCRIPT ONLY (6 cols) */}
          <div className="lg:col-span-6 h-full sticky top-20">
            {generatedResult ? (
              <ScriptViewer
                result={generatedResult}
                originalImage={imageUrl}
                onRefineScript={handleRefineScript}
                isRefining={isRefining}
              />
            ) : (
              <div className="h-full min-h-[480px] bg-[#040816]/75 border border-cyan-500/25 rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#030a18] border border-cyan-400/40 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <Terminal className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold font-mono text-white mb-2 uppercase tracking-widest">
                  USERSCRIPT TERMINAL // READY
                </h3>
                <p className="text-xs font-mono text-slate-400 max-w-sm leading-relaxed mb-6">
                  Awaiting input coordinates. Draw boxes over the elements on the screenshot, write your After instructions, and click <strong>COMPILE SCRIPT</strong>.
                </p>

                <button
                  onClick={() => handleSelectPreset('video-cleaner')}
                  className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>LOAD DEMO TARGET PRESET</span>
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Cybernetic Footer */}
      <footer className="relative z-10 border-t border-cyan-500/15 py-3 px-6 text-center text-[10px] font-mono text-slate-500 bg-[#02050c]/90">
        SCREENMONKEY // ROBOTIC TAMPERMONKEY USERSCRIPT SYNTHESIZER
      </footer>
    </div>
  );
}
