import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading Placify...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4 text-slate-400">
      <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

