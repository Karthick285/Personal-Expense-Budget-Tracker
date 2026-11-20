import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  PieChart as PieChartIcon,
  Plus,
  ArrowRight,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import TransactionModal from '../components/TransactionModal';
import { analyticsService } from '../services/analyticsService';
import { transactionService } from '../services/transactionService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categories';
import { useToast } from '../context/ToastContext';

export default function Dashboard({
  onNavigateTransactions,
  onNavigateBudgets,
  onNavigateAnalytics,
  onOpenAddTransaction
}) {
  const { addToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Delete modal states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        analyticsService.getSummary(),
        transactionService.getTransactions({ limit: 6, sortBy: 'transaction_date', sortOrder: 'DESC' })
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (txRes.success) setRecentTransactions(txRes.transactions);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      addToast('Unable to load dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await transactionService.deleteTransaction(deletingId);
      addToast('Transaction deleted successfully.', 'success');
      setDeletingId(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Unable to delete transaction.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Crunching financial figures..." />;
  }

  const s = summary || {};
  const isPositiveBalance = (s.totalBalance || 0) >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-900/10 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 bg-indigo-800/60 px-3 py-1 rounded-full inline-block mb-3">
            Financial Health Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Total Net Worth: {formatCurrency(s.totalBalance || 0)}
          </h2>
          <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
            Track expenses, manage budgets, and achieve your financial targets with automated analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
          <button
            onClick={onNavigateBudgets}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-800/80 hover:bg-indigo-800 text-white font-semibold text-xs rounded-xl border border-indigo-500/30 transition-all"
          >
            <PieChartIcon className="w-4 h-4" />
            Set Budget
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
      </div>

      {/* Exceeded Budget Warning Banner if needed */}
      {s.isBudgetExceeded && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">Your monthly budget has been exceeded!</h4>
            <p className="text-xs text-rose-600 dark:text-rose-300 mt-0.5">
              Current month expenses ({formatCurrency(s.monthExpenses || 0)}) have surpassed your budgeted limit ({formatCurrency(s.totalBudget || 0)}).
            </p>
          </div>
          <button
            onClick={onNavigateBudgets}
            className="text-xs font-bold text-rose-700 dark:text-rose-300 underline hover:no-underline shrink-0"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Total Balance"
          amount={formatCurrency(s.totalBalance || 0)}
          description="Net accumulated capital"
          icon={Wallet}
          colorScheme={isPositiveBalance ? 'indigo' : 'rose'}
          trend={isPositiveBalance ? 'Positive' : 'Deficit'}
          trendType={isPositiveBalance ? 'positive' : 'negative'}
        />

        <StatCard
          title="Total Income"
          amount={formatCurrency(s.totalIncome || 0)}
          description="All recorded earnings"
          icon={ArrowUpRight}
          colorScheme="emerald"
          trend="+ Inflow"
          trendType="positive"
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(s.totalExpenses || 0)}
          description="Total cash outflows"
          icon={ArrowDownRight}
          colorScheme="rose"
          trend="- Outflow"
          trendType="negative"
        />

        <StatCard
          title="Remaining Budget"
          amount={formatCurrency(s.remainingBudget || 0)}
          description={s.totalBudget > 0 ? `Budget: ${formatCurrency(s.totalBudget)}` : 'No budget set for month'}
          icon={PieChartIcon}
          colorScheme={(s.remainingBudget || 0) >= 0 ? 'blue' : 'rose'}
          trend={s.totalBudget > 0 ? `${s.budgetUtilization}% used` : 'Unset'}
          trendType={(s.remainingBudget || 0) >= 0 ? 'positive' : 'negative'}
        />

        <StatCard
          title="Savings"
          amount={formatCurrency(s.savings || 0)}
          description={`Savings rate: ${s.savingsRate || 0}%`}
          icon={PiggyBank}
          colorScheme="amber"
          trend={`${s.savingsRate || 0}%`}
          trendType={(s.savings || 0) >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing the latest transactions from your account
            </p>
          </div>

          <button
            onClick={onNavigateTransactions}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group"
          >
            View All ({s.totalTransactions || 0})
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Start logging your income and expenses to unlock visual insights."
            actionLabel="Add First Transaction"
            onAction={onOpenAddTransaction}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {recentTransactions.map((tx) => {
                  const meta = getCategoryMeta(tx.category, tx.type);
                  const isIncome = tx.type === 'Income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 pl-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(tx.transaction_date)}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {tx.description}
                        {tx.notes && (
                          <span className="block text-[11px] text-slate-400 truncate">
                            {tx.notes}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${meta.bg}`}>
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.payment_method}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Edit transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <TransactionModal
        isOpen={!!editingTransaction}
        initialData={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        loading={deleteLoading}
        title="Delete Transaction"
        message="Are you sure you want to permanently delete this transaction? Your balance and budget calculations will adjust automatically."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
