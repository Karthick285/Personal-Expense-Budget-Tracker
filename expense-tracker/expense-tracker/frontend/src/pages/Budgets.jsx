import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { formatCurrency, formatMonthYear, formatPercent } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categories';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import BudgetModal from '../components/BudgetModal';
import { useToast } from '../context/ToastContext';

export default function Budgets() {
  const { addToast } = useToast();

  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7); // e.g. 2026-04
  });

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgets(currentMonth);
      if (res.success) {
        setBudgets(res.budgets);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      addToast('Unable to load budget data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, addToast]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setCurrentMonth(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setCurrentMonth(nextDate.toISOString().slice(0, 7));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await budgetService.deleteBudget(deleteId);
      addToast('Budget deleted successfully.', 'success');
      setDeleteId(null);
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete budget:', err);
      addToast('Unable to delete budget.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const exceededCount = budgets.filter(b => b.isExceeded).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Budget Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set category limits and monitor spending thresholds for {formatMonthYear(currentMonth)}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector pager */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {formatMonthYear(currentMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Exceeded Warning Banner if any category is over budget */}
      {exceededCount > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-200 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block">
              Warning: Budget exceeded in {exceededCount} {exceededCount === 1 ? 'category' : 'categories'}!
            </span>
            Spending in these categories has surpassed your allocated monthly limits. Check the cards below to take corrective action.
          </div>
        </div>
      )}

      {/* Month Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Budget
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(summary.totalBudget)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Allocated across {budgets.length} categories
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Total Spent
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(summary.totalSpent)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {summary.overallProgress}% of monthly budget
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Remaining Budget
            </span>
            <h3 className={`text-2xl font-bold ${summary.totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(summary.totalRemaining)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {summary.totalRemaining >= 0 ? 'Within budget limits' : 'Budget deficit'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Budget Utilization
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {summary.overallProgress}%
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                summary.isExceeded
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : summary.overallProgress >= 80
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              }`}>
                {summary.isExceeded ? 'Exceeded' : summary.overallProgress >= 80 ? 'Near Limit' : 'Safe'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.isExceeded ? 'bg-rose-500' : summary.overallProgress >= 80 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, summary.overallProgress)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Budgets Grid / Cards List */}
      {loading ? (
        <LoadingSpinner text="Loading monthly budgets..." />
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
          <EmptyState
            title={`No budgets set for ${formatMonthYear(currentMonth)}`}
            description="Create category budgets to gain control of your expenses and receive over-limit alerts."
            actionLabel="Set First Budget"
            onAction={() => {
              setSelectedBudget(null);
              setModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const meta = getCategoryMeta(b.category, 'Expense');
            const isExceeded = b.isExceeded;
            const isWarning = b.isWarning;

            return (
              <div
                key={b.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all relative flex flex-col justify-between ${
                  isExceeded
                    ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-400/20'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-900/80'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top: Category Tag & Actions */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${meta.bg}`}>
                      {b.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedBudget(b);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit budget"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Figures */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Budget Limit:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(b.budget)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Spent:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {formatCurrency(b.spent)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="text-slate-500 dark:text-slate-400">Remaining:</span>
                      <span className={`font-bold text-sm ${b.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatCurrency(b.remaining)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Warning Indicator */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      Progress: {formatPercent(b.progress)}
                    </span>
                    {isExceeded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Exceeded!
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                        Approaching
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> On Track
                      </span>
                    )}
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, b.progress)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={modalOpen}
        initialData={selectedBudget}
        defaultMonth={currentMonth}
        onClose={() => {
          setModalOpen(false);
          setSelectedBudget(null);
        }}
        onSuccess={fetchBudgets}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        loading={deleteLoading}
        title="Delete Budget"
        message="Are you sure you want to delete this category budget? Existing transaction records will not be deleted."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
