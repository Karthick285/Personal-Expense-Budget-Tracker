const pool = require('../config/db');

async function getBudgets(req, res, next) {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const month = req.query.month || currentMonth;

    // 1. Get all budgets for user in specified month
    const [budgets] = await pool.query(
      `SELECT id, user_id, category, amount, month, created_at, updated_at 
       FROM budgets 
       WHERE user_id = ? AND month = ?
       ORDER BY category ASC`,
      [userId, month]
    );

    // 2. Query total spent for each category in this month from transactions
    const [spendingRows] = await pool.query(
      `SELECT category, SUM(amount) as total_spent 
       FROM transactions 
       WHERE user_id = ? 
         AND type = 'Expense' 
         AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
       GROUP BY category`,
      [userId, month]
    );

    const spendingMap = {};
    spendingRows.forEach(row => {
      spendingMap[row.category] = parseFloat(row.total_spent) || 0;
    });

    let totalBudget = 0;
    let totalSpent = 0;

    const budgetList = budgets.map(b => {
      const budgetAmount = parseFloat(b.amount);
      const spentAmount = spendingMap[b.category] || 0;
      const remaining = budgetAmount - spentAmount;
      const rawProgress = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
      const progressPercent = parseFloat(rawProgress.toFixed(2));

      totalBudget += budgetAmount;
      totalSpent += spentAmount;

      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        spent: spentAmount,
        remaining: remaining,
        progress: progressPercent,
        isExceeded: spentAmount > budgetAmount,
        isWarning: spentAmount >= budgetAmount * 0.8 && spentAmount <= budgetAmount,
        month: b.month,
        updated_at: b.updated_at
      };
    });

    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? parseFloat(((totalSpent / totalBudget) * 100).toFixed(2)) : 0;

    return res.json({
      success: true,
      month,
      budgets: budgetList,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallProgress,
        isExceeded: totalSpent > totalBudget
      }
    });
  } catch (error) {
    next(error);
  }
}

async function createBudget(req, res, next) {
  try {
    const userId = req.user.id;
    const { category, amount, month } = req.body;

    if (!category || amount === undefined || !month) {
      return res.status(400).json({
        success: false,
        message: 'Category, budget amount, and month (YYYY-MM) are required.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid budget amount greater than zero.'
      });
    }

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Month must be in YYYY-MM format (e.g. 2026-04).'
      });
    }

    // Insert or update on duplicate key
    const [result] = await pool.query(
      `INSERT INTO budgets (user_id, category, amount, month)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [userId, category.trim(), numAmount, month]
    );

    const [saved] = await pool.query(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month = ?',
      [userId, category.trim(), month]
    );

    return res.status(201).json({
      success: true,
      message: 'Budget saved successfully.',
      budget: saved[0]
    });
  } catch (error) {
    next(error);
  }
}

async function updateBudget(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { category, amount, month } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized.'
      });
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid budget amount greater than zero.'
        });
      }
    }

    await pool.query(
      `UPDATE budgets 
       SET category = COALESCE(?, category), 
           amount = COALESCE(?, amount), 
           month = COALESCE(?, month) 
       WHERE id = ? AND user_id = ?`,
      [
        category ? category.trim() : null,
        amount !== undefined ? parseFloat(amount) : null,
        month || null,
        id,
        userId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM budgets WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Budget updated successfully.',
      budget: updated[0]
    });
  } catch (error) {
    next(error);
  }
}

async function deleteBudget(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized.'
      });
    }

    await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [id, userId]);

    return res.json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
