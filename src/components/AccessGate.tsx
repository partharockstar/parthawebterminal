import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Cpu,
  Terminal,
  ArrowRight,
  Eye,
  EyeOff,
  Radio,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CyberClock } from './CyberClock';

interface AccessGateProps {
  onUnlock: (operatorName: string) => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [operator, setOperator] = useState('');
  const [hexNoise, setHexNoise] = useState('0x4F8A // SYS_IDLE');
  const [glitchActive, setGlitchActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Robot voice synthesis function
  const speakVoice = (text: string) => {
    if (!isAudioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.8;
      utterance.rate = 1.05;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const robotVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('robot') ||
          v.name.toLowerCase().includes('google us english') ||
          v.lang.includes('en')
      );
      if (robotVoice) utterance.voice = robotVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable:', e);
    }
  };

  // Background random glitch telemetry stream
  useEffect(() => {
    const hexCodes = [
      '0x4F8A // SYS_IDLE',
      '0x9C12 // CIPHER_STREAM',
      '0x7E34 // BINARY_MATRIX',
      '0xB2A1 // PORT_443_SECURE',
      '0x3D88 // PROTOCOL_V3',
      '0xFA09 // KERNEL_ACTIVE',
    ];

    const interval = setInterval(() => {
      const randomHex = hexCodes[Math.floor(Math.random() * hexCodes.length)];
      setHexNoise(randomHex);
      if (Math.random() > 0.7) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 200);
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = passcode.trim().toLowerCase();

    if (!trimmed) {
      setErrorMsg('ENTER PASSCODE TO INITIATE CLEARANCE');
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 500);
      return;
    }

    setIsVerifying(true);
    setStatusMsg('PASSWORD CHECKING...');
    // Voice: "Password checking"
    speakVoice('Password checking');

    setTimeout(() => {
      // Authorized passcodes: "Partha" or "Farhan"
      if (trimmed === 'partha' || trimmed === 'farhan') {
        const name = trimmed === 'partha' ? 'Partha' : 'Farhan';
        setOperator(name);
        setIsSuccess(true);
        setStatusMsg(`WELCOME ${name.toUpperCase()}!`);
        // Voice: "Welcome Partha" or "Welcome Farhan"
        speakVoice(`Welcome ${name}`);

        setTimeout(() => {
          onUnlock(name);
        }, 1300);
      } else {
        setIsVerifying(false);
        setStatusMsg('');
        setErrorMsg('ACCESS DENIED // UNAUTHORIZED INTRUDER');
        speakVoice('Access denied');
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 800);
      }
    }, 900);
  };

  return (
    <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-120px)] select-none">
      {/* Robot-type Cyber Clock on Top */}
      <CyberClock />

      {/* Centered Access Terminal Card (Robot Avatar Removed) */}
      <div
        className={`relative max-w-md w-full bg-[#030713]/85 border rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden transition-all duration-150 ${
          glitchActive
            ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)] animate-glitch-skew'
            : isSuccess
            ? 'border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
            : 'border-cyan-500/35 shadow-[0_0_30px_rgba(0,240,255,0.15)]'
        }`}
      >
        {/* Animated Cyber Scanline bar */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40 cyber-scanline-bar pointer-events-none" />

        {/* Cyber Decal Corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Glitch Telemetry Strip */}
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/70 pb-2.5 mb-3.5 border-b border-cyan-500/15">
          <span className="flex items-center gap-1.5 animate-cyber-flicker">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>SIGNAL: ENCRYPTED</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-cyan-300">{hexNoise}</span>
            <button
              type="button"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className="text-slate-500 hover:text-cyan-400 p-0.5 rounded transition-colors"
              title={isAudioEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {isAudioEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative w-14 h-14 rounded-2xl bg-[#02050c] border border-cyan-500/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            {isSuccess ? (
              <Unlock className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : (
              <Lock
                className={`w-7 h-7 text-cyan-400 transition-all ${
                  glitchActive ? 'text-rose-500 scale-110' : 'animate-pulse'
                }`}
              />
            )}
            <div className="absolute -inset-1 rounded-2xl border border-cyan-400/20 pointer-events-none animate-ping opacity-25" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] font-bold tracking-widest uppercase mb-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>SECURITY LEVEL 4 // CYBER GATEWAY</span>
          </div>

          {/* Glitch Title */}
          <h2
            data-text="SCREENMONKEY // OS"
            className="glitch-title text-xl font-black font-mono tracking-widest text-white uppercase"
          >
            SCREENMONKEY <span className="text-cyan-400">//</span> OS
          </h2>

          <p className="text-[11px] font-mono text-slate-400 mt-1 animate-cyber-flicker">
            [ ENTER CLEARANCE PASSCODE TO UNLOCK ]
          </p>
        </div>

        {/* Success Terminal State */}
        {isSuccess ? (
          <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-xl p-4 text-center text-emerald-300 font-mono text-xs flex flex-col items-center gap-2 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
            <span className="font-extrabold tracking-widest text-emerald-400 text-sm">
              [ ACCESS GRANTED ]
            </span>
            <span className="text-white font-bold text-base">
              WELCOME {operator.toUpperCase()}!
            </span>
            <div className="w-full bg-emerald-900/40 rounded-full h-1 overflow-hidden mt-1">
              <div className="bg-emerald-400 h-full w-full animate-pulse" />
            </div>
            <span className="text-[10px] text-emerald-400/80 tracking-widest">
              INITIALIZING CYBER WORKSPACE...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  CLEARANCE PASSCODE:
                </label>
                <span className="text-[10px] font-mono text-cyan-400/60">ENCRYPTED // 256-BIT</span>
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  autoFocus
                  placeholder="Enter passcode..."
                  className={`w-full bg-[#010309] border rounded-xl py-2.5 pl-3.5 pr-10 text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none transition-all shadow-inner tracking-wider ${
                    errorMsg
                      ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.35)] text-rose-300'
                      : 'border-cyan-500/35 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                  title={showPass ? 'Hide code' : 'Show code'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Status Message (e.g. "PASSWORD CHECKING...") */}
            {isVerifying && !isSuccess && (
              <div className="bg-cyan-950/60 border border-cyan-500/40 rounded-xl p-2.5 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 animate-pulse">
                <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="font-bold tracking-widest">{statusMsg || 'PASSWORD CHECKING...'}</span>
              </div>
            )}

            {/* Glitch Error Box */}
            {errorMsg && (
              <div className="bg-rose-950/80 border border-rose-500/60 rounded-xl p-2.5 text-xs font-mono text-rose-300 flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-bounce">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="tracking-wide font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Cyber Glitch Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className={`relative overflow-hidden w-full font-extrabold font-mono py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs tracking-widest uppercase cursor-pointer ${
                isVerifying
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.5)]'
              }`}
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none" />

              {isVerifying ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-black" />
                  <span>PASSWORD CHECKING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-black" />
                  <span>INITIALIZE ACCESS</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Security Note */}
        <div className="mt-4 pt-2.5 border-t border-cyan-500/15 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400/60" />
            <span>SEC_GATE // v2.6</span>
          </span>
          <span className="text-cyan-400/60 font-mono text-[10px]">AUTH_MODE // RESTRICTED</span>
        </div>
      </div>
    </div>
  );
};
