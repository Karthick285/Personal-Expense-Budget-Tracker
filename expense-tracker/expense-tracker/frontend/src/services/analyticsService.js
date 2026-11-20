import api from './api';

export const analyticsService = {
  async getSummary() {
    const res = await api.get('/analytics/summary');
    return res.data;
  },

  async getCategoryExpenses(month) {
    const res = await api.get('/analytics/category-expenses', { params: { month } });
    return res.data;
  },

  async getMonthlyExpenses() {
    const res = await api.get('/analytics/monthly-expenses');
    return res.data;
  },

  async getIncomeVsExpense(month) {
    const res = await api.get('/analytics/income-vs-expense', { params: { month } });
    return res.data;
  },

  async getBudgetVsActual(month) {
    const res = await api.get('/analytics/budget-vs-actual', { params: { month } });
    return res.data;
  }
};
