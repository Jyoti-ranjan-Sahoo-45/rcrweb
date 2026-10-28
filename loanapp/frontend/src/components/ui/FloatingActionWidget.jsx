import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, X } from 'lucide-react';

export const FloatingActionWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  // Show floating widget after small scroll or 1.5s delay
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    const timer = setTimeout(() => setIsVisible(true), 1500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Optional micro-badge */}
      {showBadge && (
        <div className="relative bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-white px-3 py-1.5 rounded-xl shadow-2xl text-[11px] font-semibold flex items-center gap-2 max-w-[220px]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-200">Instant Approval in 5 Mins</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowBadge(false); }}
            className="text-slate-400 hover:text-white p-0.5 ml-0.5"
            aria-label="Close notification"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Apply Now Button */}
      <Link
        to="/register"
        className="group relative flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-full shadow-2xl shadow-blue-600/50 hover:shadow-blue-500/80 border border-white/30 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
      >
        {/* Shimmer light sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Glowing Zap Icon */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
          <Zap size={16} className="fill-current animate-pulse" />
        </div>

        {/* Text Block */}
        <div className="flex flex-col items-start leading-none pr-0.5">
          <span className="text-xs sm:text-sm font-black tracking-wide flex items-center gap-1">
            Apply Now
          </span>
          <span className="text-[10px] text-blue-200 font-medium tracking-tight mt-0.5 hidden xs:inline sm:inline">
            ₹5L Instant Credit
          </span>
        </div>

        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
          <ArrowRight size={13} />
        </div>
      </Link>
    </div>
  );
};
