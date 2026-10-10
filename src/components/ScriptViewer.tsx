import React, { useState } from 'react';
import { GeneratedScriptResponse } from '../types';
import { CodeHighlighter } from '../utils/codeHighlighter';
import { InstallModal } from './InstallModal';
import {
  Copy,
  Check,
  Download,
  BookOpen,
  Send,
  Loader2,
  Terminal,
} from 'lucide-react';

interface ScriptViewerProps {
  result: GeneratedScriptResponse;
  originalImage: string;
  onRefineScript: (feedback: string) => Promise<void>;
  isRefining: boolean;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  result,
  onRefineScript,
  isRefining,
}) => {
  const [copied, setCopied] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(result.tampermonkeyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${result.scriptName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'userscript'}.user.js`;
    const blob = new Blob([result.tampermonkeyCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineFeedback.trim() || isRefining) return;
    await onRefineScript(refineFeedback);
    setRefineFeedback('');
  };

  return (
    <div className="flex flex-col h-full bg-[#040816]/80 border border-cyan-500/25 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
      {/* Cyber Corner Decals */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-10" />

      {/* Top Header */}
      <div className="p-3.5 px-4 border-b border-cyan-500/20 bg-[#02050c]/80 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                {result.scriptName || 'Tampermonkey Userscript'}
              </h3>
              <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                v1.0.0
              </span>
              <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-semibold hidden sm:inline-block">
                {result.matchUrl}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Copy Code, Download .user.js, Help */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-[#030a18] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/30'
            }`}
            title="Copy entire userscript"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
            title="Download .user.js file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD .USER.JS</span>
          </button>

          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 transition-colors cursor-pointer"
            title="Install Guide"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Script View ONLY - Clean, Full Height */}
      <div className="flex-1 overflow-y-auto p-3 relative min-h-[460px] bg-[#010308]/95">
        <div className="rounded-xl p-2 font-mono text-xs overflow-x-auto">
          <CodeHighlighter code={result.tampermonkeyCode} />
        </div>
      </div>

      {/* Minimal Refine Input at Bottom */}
      <form
        onSubmit={handleRefineSubmit}
        className="p-2.5 px-3 bg-[#02050c]/90 border-t border-cyan-500/20 flex items-center gap-2"
      >
        <input
          type="text"
          value={refineFeedback}
          onChange={(e) => setRefineFeedback(e.target.value)}
          placeholder="REVISE SCRIPT // e.g., 'Change button color to purple', 'Also hide footer'..."
          className="flex-1 bg-[#01040a] border border-cyan-500/30 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-cyan-200 placeholder-slate-500 font-mono focus:outline-none transition-colors"
          disabled={isRefining}
        />

        <button
          type="submit"
          disabled={!refineFeedback.trim() || isRefining}
          className="flex items-center gap-1.5 bg-[#030a18] hover:bg-cyan-950/40 disabled:opacity-40 text-cyan-300 font-mono font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 border border-cyan-500/30 cursor-pointer"
        >
          {isRefining ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              <span>UPDATING...</span>
            </>
          ) : (
            <>
              <Send className="w-3 h-3 text-cyan-400" />
              <span>UPDATE</span>
            </>
          )}
        </button>
      </form>

      {/* Installation Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        scriptCode={result.tampermonkeyCode}
        scriptName={result.scriptName}
      />
    </div>
  );
};
