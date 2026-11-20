const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const pool = require('../config/db');

async function exportCSV(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id, user_id, 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as date, 
              type, category, description, amount, payment_method, notes 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC, id DESC`,
      [userId]
    );

    const header = 'transaction_id,user_id,date,type,category,description,amount,payment_method,notes\n';
    const csvRows = rows.map(r => {
      const cleanDesc = `"${(r.description || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(r.notes || '').replace(/"/g, '""')}"`;
      return `${r.id},${r.user_id},${r.date},${r.type},${r.category},${cleanDesc},${r.amount},${r.payment_method},${cleanNotes}`;
    });

    const csvContent = header + csvRows.join('\n');
    const filename = `user_transactions_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
}

async function exportExcel(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id as 'Transaction ID', 
              user_id as 'User ID', 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as 'Date', 
              type as 'Type', 
              category as 'Category', 
              description as 'Description', 
              amount as 'Amount (INR)', 
              payment_method as 'Payment Method', 
              COALESCE(notes, '') as 'Notes' 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC, id DESC`,
      [userId]
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `user_transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
}

async function exportJSON(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT id as transaction_id, 
              user_id, 
              DATE_FORMAT(transaction_date, '%Y-%m-%d') as date, 
              type, 
              category, 
              description, 
              amount, 
              payment_method, 
              notes,
              created_at 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC, id DESC`,
      [userId]
    );

    const filename = `user_transactions_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(JSON.stringify(rows, null, 2));
  } catch (error) {
    next(error);
  }
}

async function downloadSampleCSV(req, res, next) {
  try {
    const csvPath = path.resolve(__dirname, '../../dataset/sample_expense_dataset.csv');
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'Sample dataset file not found on server.'
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample_expense_dataset.csv"');
    const fileStream = fs.createReadStream(csvPath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportCSV,
  exportExcel,
  exportJSON,
  downloadSampleCSV
};
