import React, { useState, useEffect } from 'react';
import { Clock, Cpu, Radio, Shield } from 'lucide-react';

export const CyberClock: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());
  const [ms, setMs] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      setMs(Math.floor(now.getMilliseconds() / 10)); // 2-digit ms
    }, 45);

    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const msStr = String(ms).padStart(2, '0');

  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = days[time.getDay()];

  // Seconds progress percentage (0 - 100)
  const secProgress = (time.getSeconds() / 60) * 100;

  return (
    <div className="relative inline-flex flex-col items-center select-none mb-4">
      {/* Outer Cyber Frame */}
      <div className="relative bg-[#02050e]/90 border border-cyan-500/35 rounded-xl px-5 py-2.5 shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-xl flex flex-col items-center">
        {/* Corner Decals */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Header Strip */}
        <div className="w-full flex items-center justify-between gap-4 text-[9px] font-mono text-cyan-400/80 mb-1 border-b border-cyan-500/20 pb-1">
          <span className="flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            <span>CYBER_CHRONO // UTC+0</span>
          </span>
          <span className="text-emerald-400 font-bold">
            {year}.{month}.{day} [{dayName}]
          </span>
        </div>

        {/* Main Digital Clock Display */}
        <div className="flex items-baseline gap-1 font-mono text-cyan-300 font-black tracking-widest">
          <span className="text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] text-white">
            {hours}
          </span>
          <span className="text-xl sm:text-2xl text-cyan-400 animate-pulse">:</span>
          <span className="text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] text-white">
            {minutes}
          </span>
          <span className="text-xl sm:text-2xl text-cyan-400 animate-pulse">:</span>
          <span className="text-2xl sm:text-3xl text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
            {seconds}
          </span>
          <span className="text-xs text-cyan-500/80 font-semibold ml-1">
            .{msStr}
          </span>
        </div>

        {/* Seconds Segmented Progress Bar */}
        <div className="w-full bg-[#010308] border border-cyan-500/30 rounded-full h-1 mt-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75 shadow-[0_0_8px_#00f0ff]"
            style={{ width: `${secProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
