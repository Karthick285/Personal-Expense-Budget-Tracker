import React from 'react';
import { Wallet, ShieldCheck, LineChart, Target, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AuthLayout({ children, title, subtitle }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-950 py-12 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Theme Toggle in Auth Screen */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl text-white shadow-lg shadow-indigo-500/25 mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl">
          {children}
        </div>

        {/* Feature Highlights Pill */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> JWT Security
          </span>
          <span className="inline-flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-indigo-500" /> Live Analytics
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="w-4 h-4 text-amber-500" /> Budget Alerts
          </span>
        </div>
      </div>
    </div>
  );
}
