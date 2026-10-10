import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Terminal, ShieldCheck } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode: string;
  scriptName: string;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  scriptCode,
  scriptName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${scriptName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'userscript'}.user.js`;
    const blob = new Blob([scriptCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-5 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">How to Install in Tampermonkey</h3>
              <p className="text-xs text-slate-400">Get your generated script running in under 30 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Step 1 */}
          <div className="flex gap-3 items-start bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-100 text-xs mb-1">
                Install Tampermonkey or Violentmonkey Extension
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If you don't have a userscript manager installed yet, install{' '}
                <a
                  href="https://www.tampermonkey.net/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Tampermonkey <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                or Violentmonkey from the Chrome Web Store / Firefox Add-ons.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 items-start bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-100 text-xs mb-1">
                Method A: Download .user.js (Automatic Detection)
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                Click download below. In most browsers with Tampermonkey active, dragging or opening the <code className="text-cyan-300">.user.js</code> file triggers the Tampermonkey Install prompt automatically!
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {scriptName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.user.js</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3 items-start bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-100 text-xs mb-1">
                Method B: Copy & Paste into Dashboard
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                1. Click the Tampermonkey icon in your browser toolbar &gt; click <strong>"Create a new script..."</strong>.<br />
                2. Select all existing boilerplate code and replace it with your copied script.<br />
                3. Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">Ctrl + S</kbd> (Save).
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors text-xs border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
