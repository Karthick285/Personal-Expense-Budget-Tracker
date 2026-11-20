import React from 'react';
import {
  Sun,
  Moon,
  Database,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Server,
  Key
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { addToast } = useToast();

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize display preferences, review database health, and inspect system configuration.
        </p>
      </div>

      <div className="space-y-5">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Appearance & Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Switch between light and dark modes to reduce eye fatigue.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                !isDark
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Light Mode</p>
                <p className="text-[11px] text-slate-400">Bright clean SaaS look</p>
              </div>
            </button>

            <button
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                isDark
                  ? 'border-indigo-600 bg-indigo-950/40 text-white font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="p-2 bg-slate-800 text-slate-300 rounded-xl">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[11px] text-slate-400">High contrast dark theme</p>
              </div>
            </button>
          </div>
        </div>

        {/* Currency & Financial Standards */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Financial & Currency Format
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Default monetary format used across charts, cards, and data exports.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ₹ INR
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Indian Rupee (₹)
                </p>
                <p className="text-[11px] text-slate-500">
                  Formatted using standard Indian numbering system (Lakhs & Crores: ₹1,50,000.00)
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
              Standard Active
            </span>
          </div>
        </div>

        {/* System & Database Status */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            System & Infrastructure Health
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Real-time diagnostics of database connections and cryptographic layers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Database className="w-4 h-4 text-indigo-500" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Database</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">MySQL 8.0 Engine</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Connected (Port 3306)</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2 mb-1 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Authentication</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">JWT + Bcrypt (10 Salt)</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Protected API Routes</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2 mb-1 text-slate-500">
                <Server className="w-4 h-4 text-blue-500" />
                <span className="font-bold uppercase tracking-wider text-[10px]">Backend Server</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white">Express.js REST API</p>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Operational (Port 5000)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
