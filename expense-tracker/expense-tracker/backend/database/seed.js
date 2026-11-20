const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabase } = require('./init');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker'
};

async function seedDatabase() {
  await initDatabase();

  console.log('[DB Seed] Connecting to database...');
  const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 5 });

  try {
    // 1. Create or retrieve demo user
    const demoEmail = 'demo@tracker.com';
    const demoPasswordPlain = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(demoPasswordPlain, salt);

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [demoEmail]);
    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Update password hash just in case
      await pool.query('UPDATE users SET password = ?, name = ? WHERE id = ?', [hashedPassword, 'Demo User', userId]);
      console.log(`[DB Seed] Found existing demo user (ID: ${userId}). Clearing past seed data...`);
      await pool.query('DELETE FROM transactions WHERE user_id = ?', [userId]);
      await pool.query('DELETE FROM budgets WHERE user_id = ?', [userId]);
    } else {
      const [insertRes] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Demo User', demoEmail, hashedPassword]
      );
      userId = insertRes.insertId;
      console.log(`[DB Seed] Created demo user (ID: ${userId}).`);
    }

    // 2. Insert Budgets for demo user across recent months
    const budgetData = [
      // 2026-01
      [userId, 'Food', 10000.00, '2026-01'],
      [userId, 'Rent', 22000.00, '2026-01'],
      [userId, 'Bills', 5000.00, '2026-01'],
      [userId, 'Transport', 5000.00, '2026-01'],
      [userId, 'Shopping', 8000.00, '2026-01'],
      [userId, 'Entertainment', 4000.00, '2026-01'],
      [userId, 'Healthcare', 3000.00, '2026-01'],

      // 2026-02
      [userId, 'Food', 12000.00, '2026-02'],
      [userId, 'Rent', 22000.00, '2026-02'],
      [userId, 'Bills', 4500.00, '2026-02'],
      [userId, 'Transport', 6000.00, '2026-02'],
      [userId, 'Shopping', 10000.00, '2026-02'],
      [userId, 'Entertainment', 3500.00, '2026-02'],
      [userId, 'Healthcare', 4000.00, '2026-02'],

      // 2026-03
      [userId, 'Food', 12000.00, '2026-03'],
      [userId, 'Rent', 22000.00, '2026-03'],
      [userId, 'Bills', 5500.00, '2026-03'],
      [userId, 'Transport', 5500.00, '2026-03'],
      [userId, 'Shopping', 9000.00, '2026-03'],
      [userId, 'Entertainment', 4500.00, '2026-03'],
      [userId, 'Healthcare', 3000.00, '2026-03'],
      [userId, 'Travel', 10000.00, '2026-03'],

      // 2026-04
      [userId, 'Food', 11000.00, '2026-04'],
      [userId, 'Rent', 22000.00, '2026-04'],
      [userId, 'Bills', 6000.00, '2026-04'],
      [userId, 'Transport', 6500.00, '2026-04'],
      [userId, 'Shopping', 7500.00, '2026-04'],
      [userId, 'Entertainment', 4000.00, '2026-04'],
      [userId, 'Healthcare', 5000.00, '2026-04'],
      [userId, 'Travel', 15000.00, '2026-04']
    ];

    for (const b of budgetData) {
      await pool.query(
        'INSERT INTO budgets (user_id, category, amount, month) VALUES (?, ?, ?, ?)',
        b
      );
    }
    console.log(`[DB Seed] Inserted ${budgetData.length} category budgets.`);

    // 3. Load transactions from sample_expense_dataset.csv
    const csvPath = path.resolve(__dirname, '../../dataset/sample_expense_dataset.csv');
    const fs = require('fs');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    let count = 0;
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV regex parser to handle quotes
      const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
      const match = [];
      let m;
      while ((m = regex.exec(line)) !== null) {
        if (m.index === regex.lastIndex) regex.lastIndex++;
        const val = m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2];
        match.push(val);
      }

      // transaction_id, date, type, category, description, amount, payment_method, notes
      const [, date, type, category, description, amountStr, paymentMethod, notes] = match;
      const amount = parseFloat(amountStr);

      await pool.query(
        `INSERT INTO transactions 
         (user_id, type, category, description, amount, payment_method, transaction_date, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, type, category, description, amount, paymentMethod, date, notes || '']
      );
      count++;
    }

    console.log(`[DB Seed] Seeded ${count} realistic transactions for demo user.`);
    console.log('[DB Seed] Complete! Demo user: demo@tracker.com');
  } catch (error) {
    console.error('[DB Seed Error]:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
