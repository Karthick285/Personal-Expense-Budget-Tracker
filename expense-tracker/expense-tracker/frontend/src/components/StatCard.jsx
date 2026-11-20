import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  amount,
  description,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  colorScheme = 'indigo', // 'indigo' | 'emerald' | 'rose' | 'amber' | 'blue'
}) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      badge: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badge: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300'
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      badge: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badge: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300'
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      badge: 'text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300'
    }
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4 mb-3">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} shrink-0`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div>
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {amount}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                trendType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : trendType === 'negative'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {trendType === 'positive' && <TrendingUp className="w-3.5 h-3.5" />}
              {trendType === 'negative' && <TrendingDown className="w-3.5 h-3.5" />}
              {trendType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {trend}
            </span>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
