import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  Area
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Scale,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatMonthYear, formatPercent } from '../utils/formatters';
import { getCategoryMeta, EXPENSE_CATEGORIES } from '../utils/categories';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Analytics() {
  const { addToast } = useToast();
  const { isDark } = useTheme();

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7)); // e.g. 2026-04
  const [loading, setLoading] = useState(true);

  // Data states
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [budgetVsActual, setBudgetVsActual] = useState([]);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, incExpRes, trendRes, bvaRes] = await Promise.all([
        analyticsService.getCategoryExpenses(month),
        analyticsService.getIncomeVsExpense('all'),
        analyticsService.getMonthlyExpenses(),
        analyticsService.getBudgetVsActual(month)
      ]);

      if (catRes.success) setCategoryExpenses(catRes.data);
      if (incExpRes.success) setIncomeVsExpense(incExpRes.data);
      if (trendRes.success) setMonthlyTrend(trendRes.data);
      if (bvaRes.success) setBudgetVsActual(bvaRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      addToast('Unable to load analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [month, addToast]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handlePrevMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setMonth(prevDate.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = month.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    setMonth(nextDate.toISOString().slice(0, 7));
  };

  const chartTheme = {
    gridColor: isDark ? '#1e293b' : '#f1f5f9',
    textColor: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: isDark ? '#334155' : '#e2e8f0',
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.tooltipBorder,
          }}
          className="p-3 rounded-xl shadow-xl border text-xs space-y-1.5 z-50 backdrop-blur-md"
        >
          {label && <p className="font-bold text-slate-800 dark:text-slate-200">{label}</p>}
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }} className="font-medium">
              {entry.name}: <span className="font-bold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Category Pie Tooltip
  const CategoryPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.tooltipBorder,
          }}
          className="p-3 rounded-xl shadow-xl border text-xs space-y-1 z-50"
        >
          <p className="font-bold text-slate-800 dark:text-slate-100">{data.category}</p>
          <p className="text-slate-600 dark:text-slate-300">
            Amount: <span className="font-bold">{formatCurrency(data.amount)}</span>
          </p>
          <p className="text-slate-500">
            Share: <span className="font-semibold">{formatPercent(data.percentage)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Visual Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive breakdown of expenses, income comparisons, and budget variances.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
              {formatMonthYear(month)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Rendering interactive charts..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Expense by Category (Donut / Pie Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-indigo-500" />
                  Expense by Category
                </h3>
                <p className="text-xs text-slate-400">
                  Spending share for {formatMonthYear(month)}
                </p>
              </div>
            </div>

            {categoryExpenses.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No expenses logged"
                  description="Add expense transactions to visualize your category breakdown."
                />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {categoryExpenses.map((entry, index) => {
                        const meta = getCategoryMeta(entry.category, 'Expense');
                        return <Cell key={`cell-${index}`} fill={meta.color} stroke="none" />;
                      })}
                    </Pie>
                    <Tooltip content={<CategoryPieTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>

                {/* Legend list */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
                  {categoryExpenses.slice(0, 6).map((cat) => {
                    const meta = getCategoryMeta(cat.category, 'Expense');
                    return (
                      <span key={cat.category} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        {cat.category} ({formatPercent(cat.percentage)})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Income vs Expense (Grouped Bar Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  Income vs Expense
                </h3>
                <p className="text-xs text-slate-400">
                  Monthly comparison of inflows and outflows
                </p>
              </div>
            </div>

            {incomeVsExpense.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No monthly data"
                  description="Log transactions to track monthly income and expense flows."
                />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpense} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                    <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 3: Monthly Spending Trend (Line Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  Monthly Spending Trajectory
                </h3>
                <p className="text-xs text-slate-400">
                  Total expense velocity across recent months
                </p>
              </div>
            </div>

            {monthlyTrend.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No historical trend"
                  description="Keep logging transactions to view spending patterns over time."
                />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                    <XAxis dataKey="month" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                    <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      name="Expenses"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="savings"
                      name="Savings"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#06b6d4' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 4: Budget vs Actual Spending (Bar Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  Budget vs Actual Spending
                </h3>
                <p className="text-xs text-slate-400">
                  Target limit vs real consumption in {formatMonthYear(month)}
                </p>
              </div>
            </div>

            {budgetVsActual.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No category budgets"
                  description="Set monthly category budgets to compare planned targets against actual spending."
                />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetVsActual} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                    <XAxis dataKey="category" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                    <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="budget" name="Budget Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual Spent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
