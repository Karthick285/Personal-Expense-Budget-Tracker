import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] p-6 text-slate-500 dark:text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
