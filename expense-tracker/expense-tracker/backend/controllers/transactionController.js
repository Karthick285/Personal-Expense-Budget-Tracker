const pool = require('../config/db');

async function getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      type,
      category,
      payment_method,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'transaction_date',
      sortOrder = 'DESC'
    } = req.query;

    let whereClauses = ['user_id = ?'];
    let params = [userId];

    if (type && type !== 'all') {
      whereClauses.push('type = ?');
      params.push(type);
    }

    if (category && category !== 'all') {
      whereClauses.push('category = ?');
      params.push(category);
    }

    if (payment_method && payment_method !== 'all') {
      whereClauses.push('payment_method = ?');
      params.push(payment_method);
    }

    if (startDate) {
      whereClauses.push('transaction_date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('transaction_date <= ?');
      params.push(endDate);
    }

    if (minAmount !== undefined && minAmount !== '') {
      whereClauses.push('amount >= ?');
      params.push(parseFloat(minAmount));
    }

    if (maxAmount !== undefined && maxAmount !== '') {
      whereClauses.push('amount <= ?');
      params.push(parseFloat(maxAmount));
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(description LIKE ? OR notes LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    const whereSQL = whereClauses.join(' AND ');

    // Count total matching
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM transactions WHERE ${whereSQL}`,
      params
    );
    const total = countRows[0].total;

    // Sorting validation
    const validSortCols = {
      transaction_date: 'transaction_date',
      amount: 'amount',
      created_at: 'created_at',
      category: 'category',
      description: 'description'
    };
    const orderCol = validSortCols[sortBy] || 'transaction_date';
    const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const isAll = limit === 'all' || parseInt(limit, 10) <= 0;
    const limitNum = isAll ? 10000 : Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const querySQL = `
      SELECT id, user_id, type, category, description, amount, payment_method, 
             DATE_FORMAT(transaction_date, '%Y-%m-%d') as transaction_date, 
             notes, created_at, updated_at
      FROM transactions
      WHERE ${whereSQL}
      ORDER BY ${orderCol} ${orderDir}, id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(querySQL, [...params, limitNum, offset]);

    return res.json({
      success: true,
      transactions: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, user_id, type, category, description, amount, payment_method, 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as transaction_date, 
              notes, created_at, updated_at 
       FROM transactions 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized access.'
      });
    }

    return res.json({
      success: true,
      transaction: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const userId = req.user.id;
    const { type, category, description, amount, payment_method, transaction_date, notes } = req.body;

    if (!type || !category || !description || amount === undefined || !payment_method || !transaction_date) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields: type, category, description, amount, payment method, and date.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount greater than zero.'
      });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be either Income or Expense.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, category, description, amount, payment_method, transaction_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        category.trim(),
        description.trim(),
        numAmount,
        payment_method.trim(),
        transaction_date,
        notes ? notes.trim() : null
      ]
    );

    const [createdRows] = await pool.query(
      `SELECT id, user_id, type, category, description, amount, payment_method, 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as transaction_date, 
              notes, created_at, updated_at 
       FROM transactions 
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Transaction added successfully.',
      transaction: createdRows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, category, description, amount, payment_method, transaction_date, notes } = req.body;

    // Check existence and ownership
    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized access.'
      });
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid amount greater than zero.'
        });
      }
    }

    if (type && !['Income', 'Expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Transaction type must be either Income or Expense.'
      });
    }

    await pool.query(
      `UPDATE transactions 
       SET type = COALESCE(?, type), 
           category = COALESCE(?, category), 
           description = COALESCE(?, description), 
           amount = COALESCE(?, amount), 
           payment_method = COALESCE(?, payment_method), 
           transaction_date = COALESCE(?, transaction_date), 
           notes = COALESCE(?, notes) 
       WHERE id = ? AND user_id = ?`,
      [
        type,
        category ? category.trim() : null,
        description ? description.trim() : null,
        amount !== undefined ? parseFloat(amount) : null,
        payment_method ? payment_method.trim() : null,
        transaction_date,
        notes !== undefined ? (notes ? notes.trim() : null) : null,
        id,
        userId
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT id, user_id, type, category, description, amount, payment_method, 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as transaction_date, 
              notes, created_at, updated_at 
       FROM transactions 
       WHERE id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await pool.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized access.'
      });
    }

    await pool.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);

    return res.json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
