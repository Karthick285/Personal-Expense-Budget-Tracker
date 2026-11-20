const pool = require('../config/db');

async function getSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Overall Income, Expenses, Count
    const [totals] = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as total_expenses,
         COUNT(*) as total_count
       FROM transactions 
       WHERE user_id = ?`,
      [userId]
    );

    const totalIncome = parseFloat(totals[0].total_income);
    const totalExpenses = parseFloat(totals[0].total_expenses);
    const balance = totalIncome - totalExpenses;
    const savings = balance;
    const savingsRate = totalIncome > 0 ? Math.max(0, parseFloat(((balance / totalIncome) * 100).toFixed(2))) : 0;

    // 2. Current Month Income, Expenses & Budget
    const [monthTotals] = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as month_income,
         COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as month_expenses
       FROM transactions 
       WHERE user_id = ? AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`,
      [userId, currentMonth]
    );

    const monthIncome = parseFloat(monthTotals[0].month_income);
    const monthExpenses = parseFloat(monthTotals[0].month_expenses);

    // Current month budget
    const [budgetRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_budget 
       FROM budgets 
       WHERE user_id = ? AND month = ?`,
      [userId, currentMonth]
    );

    const totalBudget = parseFloat(budgetRows[0].total_budget);
    const remainingBudget = totalBudget - monthExpenses;
    const budgetUtilization = totalBudget > 0 ? parseFloat(((monthExpenses / totalBudget) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      data: {
        totalBalance: balance,
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        currentMonth,
        monthIncome,
        monthExpenses,
        totalBudget,
        remainingBudget,
        budgetUtilization,
        isBudgetExceeded: monthExpenses > totalBudget && totalBudget > 0,
        totalTransactions: totals[0].total_count
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCategoryExpenses(req, res, next) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let query = `
      SELECT category, 
             SUM(amount) as amount, 
             COUNT(*) as count
      FROM transactions
      WHERE user_id = ? AND type = 'Expense'
    `;
    const params = [userId];

    if (month && month !== 'all') {
      query += ` AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`;
      params.push(month);
    }

    query += ` GROUP BY category ORDER BY amount DESC`;

    const [rows] = await pool.query(query, params);

    const totalExpense = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const categoryData = rows.map(r => {
      const amt = parseFloat(r.amount);
      return {
        category: r.category,
        amount: amt,
        count: r.count,
        percentage: totalExpense > 0 ? parseFloat(((amt / totalExpense) * 100).toFixed(2)) : 0
      };
    });

    return res.json({
      success: true,
      totalExpense,
      data: categoryData
    });
  } catch (error) {
    next(error);
  }
}

async function getMonthlyExpenses(req, res, next) {
  try {
    const userId = req.user.id;

    // Group transactions by month for the last 12 months
    const [rows] = await pool.query(
      `SELECT 
         DATE_FORMAT(transaction_date, '%Y-%m') as month,
         COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as income,
         COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC
       LIMIT 12`,
      [userId]
    );

    const data = rows.map(r => {
      const inc = parseFloat(r.income);
      const exp = parseFloat(r.expense);
      return {
        month: r.month,
        income: inc,
        expense: exp,
        savings: inc - exp
      };
    });

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getIncomeVsExpense(req, res, next) {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE user_id = ?
    `;
    const params = [userId];

    if (month && month !== 'all') {
      query += ` AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`;
      params.push(month);
    }

    query += ` GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') ORDER BY month ASC`;

    const [rows] = await pool.query(query, params);

    const data = rows.map(r => ({
      month: r.month,
      income: parseFloat(r.income),
      expense: parseFloat(r.expense),
      net: parseFloat(r.income) - parseFloat(r.expense)
    }));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}

async function getBudgetVsActual(req, res, next) {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const month = req.query.month || currentMonth;

    // Budgets for month
    const [budgets] = await pool.query(
      `SELECT category, amount FROM budgets WHERE user_id = ? AND month = ?`,
      [userId, month]
    );

    // Actual spending for month
    const [spending] = await pool.query(
      `SELECT category, SUM(amount) as spent 
       FROM transactions 
       WHERE user_id = ? 
         AND type = 'Expense' 
         AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
       GROUP BY category`,
      [userId, month]
    );

    const spendMap = {};
    spending.forEach(s => {
      spendMap[s.category] = parseFloat(s.spent);
    });

    const comparison = budgets.map(b => {
      const budgetAmt = parseFloat(b.amount);
      const actualAmt = spendMap[b.category] || 0;
      return {
        category: b.category,
        budget: budgetAmt,
        actual: actualAmt,
        difference: budgetAmt - actualAmt
      };
    });

    return res.json({
      success: true,
      month,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSummary,
  getCategoryExpenses,
  getMonthlyExpenses,
  getIncomeVsExpense,
  getBudgetVsActual
};
