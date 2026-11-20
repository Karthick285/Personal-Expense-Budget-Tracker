import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Code,
  Table,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck
} from 'lucide-react';
import { exportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState('');

  const handleExport = async (type, fn, filename) => {
    setDownloading(type);
    try {
      await fn();
      addToast(`${filename} download started!`, 'success');
    } catch (err) {
      console.error('Export failed:', err);
      addToast(`Unable to download ${type}. Please try again.`, 'error');
    } finally {
      setDownloading('');
    }
  };

  const samplePreviewData = [
    { id: 1, date: '2026-01-02', type: 'Expense', category: 'Food', desc: 'Lunch', amount: '₹180', method: 'UPI', notes: 'College lunch' },
    { id: 2, date: '2026-01-03', type: 'Income', category: 'Salary', desc: 'Part time salary', amount: '₹12,000', method: 'Bank Transfer', notes: 'Monthly income' },
    { id: 3, date: '2026-01-04', type: 'Expense', category: 'Transport', desc: 'Metro smart card recharge', amount: '₹1,000', method: 'UPI', notes: 'Monthly transit' },
    { id: 4, date: '2026-01-05', type: 'Expense', category: 'Bills', desc: 'Broadband internet bill', amount: '₹1,199', method: 'Credit Card', notes: 'Fiber internet renewal' },
    { id: 5, date: '2026-01-07', type: 'Expense', category: 'Shopping', desc: 'Winter jacket Zara', amount: '₹3,999', method: 'Credit Card', notes: 'Winter sale deal' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          Data Export & Reports
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your personal transaction history in multiple standard formats or download the sample testing dataset.
        </p>
      </div>

      {/* User Data Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group">
          <div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit mb-4 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              CSV Format
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Standard comma-separated values compatible with Google Sheets, Excel, Python pandas, and R.
            </p>
          </div>

          <button
            disabled={downloading === 'csv'}
            onClick={() => handleExport('csv', exportService.downloadCSV, 'CSV')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'csv' ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>

        {/* Excel Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-all group">
          <div>
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-4 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Formatted Microsoft Excel spreadsheet with structured column headers, currencies, and timestamps.
            </p>
          </div>

          <button
            disabled={downloading === 'excel'}
            onClick={() => handleExport('excel', exportService.downloadExcel, 'Excel workbook')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'excel' ? 'Exporting...' : 'Download Excel'}
          </button>
        </div>

        {/* JSON Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group">
          <div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit mb-4 group-hover:scale-105 transition-transform">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Raw JSON
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Structured JSON object array perfect for backups, developer APIs, custom scripts, and migrations.
            </p>
          </div>

          <button
            disabled={downloading === 'json'}
            onClick={() => handleExport('json', exportService.downloadJSON, 'JSON file')}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'json' ? 'Exporting...' : 'Download JSON'}
          </button>
        </div>
      </div>

      {/* Sample Dataset Download Section */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Fictional Benchmark Testing Data
              </span>
            </div>
            <h3 className="text-xl font-bold">
              Download Sample Dataset (120+ Transactions)
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Includes comprehensive dummy transaction data across 10 categories, multiple payment methods, and realistic personal budget distributions. Fictional and safe for demonstration.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-3 font-mono">
              <span>File: sample_expense_dataset.csv</span>
              <span>•</span>
              <span>Size: ~12 KB</span>
              <span>•</span>
              <span>Rows: 120</span>
            </div>
          </div>

          <button
            disabled={downloading === 'sample'}
            onClick={() => handleExport('sample', exportService.downloadSampleCSV, 'sample_expense_dataset.csv')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-2xl shadow-lg hover:shadow-indigo-500/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            {downloading === 'sample' ? 'Downloading...' : 'Download Sample Dataset'}
          </button>
        </div>
      </div>

      {/* Dataset Schema & Sample Preview Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-indigo-500" />
              Exported Dataset Schema Preview
            </h3>
            <p className="text-xs text-slate-400">
              Columns included in every export file format
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
            Standard Format
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-850/50">
                <th className="py-2.5 pl-4">ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 pr-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
              {samplePreviewData.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 pl-4 text-slate-400">{r.id}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.date}</td>
                  <td className="py-2.5 px-3">
                    <span className={r.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.category}</td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">{r.desc}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{r.amount}</td>
                  <td className="py-2.5 px-3 text-slate-500">{r.method}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
