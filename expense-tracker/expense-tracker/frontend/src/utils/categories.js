export const EXPENSE_CATEGORIES = [
  { name: 'Food', color: '#f97316', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { name: 'Transport', color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { name: 'Shopping', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { name: 'Bills', color: '#eab308', bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { name: 'Education', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { name: 'Entertainment', color: '#a855f7', bg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { name: 'Healthcare', color: '#ef4444', bg: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { name: 'Rent', color: '#6366f1', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { name: 'Travel', color: '#14b8a6', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { name: 'Other', color: '#64748b', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

export const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { name: 'Freelance', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { name: 'Business', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { name: 'Investment', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { name: 'Gift', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { name: 'Other', color: '#64748b', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

export const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash'
];

export function getCategoryMeta(categoryName, type = 'Expense') {
  const list = type === 'Income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  if (found) return found;
  return {
    name: categoryName || 'Other',
    color: '#64748b',
    bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
  };
}
