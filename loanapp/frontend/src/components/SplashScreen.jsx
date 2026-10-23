import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 150);

    // Timeout to fade out splash
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 500); // fade duration
    }, 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-slate-950 text-white transition-opacity duration-500 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Space */}
      <div></div>

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Animated Logo Container with Glowing Ring */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-40 animate-pulse"></div>
          <div className="relative transform transition hover:scale-105">
            <BrandLogo size="xl" showText={false} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>RCR FINANCE</span>
          </h1>
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
            Institutional Digital Lending
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      </div>

      {/* Bottom Trust & Compliance Footer */}
      <div className="flex flex-col items-center space-y-1.5 text-center text-slate-500 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>RBI Regulated NBFC Lending Partner</span>
        </div>
        <p className="text-[10px] text-slate-600 font-mono">100% Paperless • 256-Bit Bank-Grade Encryption</p>
      </div>
    </div>
  );
};
