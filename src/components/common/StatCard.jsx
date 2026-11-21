import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'brand', trend }) {
  const colorMap = {
    brand: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-[#111726] border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg shadow-black/20 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
          {trend && (
            <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {trend}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${selectedColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

