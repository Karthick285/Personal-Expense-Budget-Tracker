import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Tag, Calendar } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { useToast } from '../context/ToastContext';
import { EXPENSE_CATEGORIES } from '../utils/categories';

export default function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  defaultMonth
}) {
  const { addToast } = useToast();
  const isEditing = !!initialData;

  const currentMonthStr = defaultMonth || new Date().toISOString().slice(0, 7);

  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(currentMonthStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || EXPENSE_CATEGORIES[0].name);
      setAmount(initialData.amount ? String(initialData.amount) : (initialData.budget ? String(initialData.budget) : ''));
      setMonth(initialData.month || currentMonthStr);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].name);
      setAmount('');
      setMonth(defaultMonth || currentMonthStr);
    }
    setError('');
  }, [initialData, defaultMonth, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid budget amount greater than zero.');
      return;
    }

    if (!month) {
      setError('Please select a valid budget month.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category,
        amount: parsedAmount,
        month
      };

      if (isEditing && initialData.id) {
        await budgetService.updateBudget(initialData.id, payload);
        addToast('Budget updated successfully.', 'success');
      } else {
        await budgetService.createBudget(payload);
        addToast('Budget saved successfully.', 'success');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Save budget error:', err);
      const msg = err.response?.data?.message || 'Unable to save budget.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Category Budget' : 'Set Category Budget'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Tag className="w-4 h-4" />
              </span>
              <select
                value={category}
                disabled={isEditing}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer disabled:opacity-60"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Budget Month (YYYY-MM) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="month"
                required
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Budget Limit Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Monthly Budget Limit (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <IndianRupee className="w-4 h-4" />
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 8000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You will receive automated warnings if expenses exceed this limit.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
