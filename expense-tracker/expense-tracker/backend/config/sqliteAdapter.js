const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../expense_tracker.sqlite');

function initSqliteDatabase() {
  const db = new sqlite3.Database(dbPath);

  const initPromise = new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        db.run('PRAGMA foreign_keys = ON;');
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('Income', 'Expense')),
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            payment_method TEXT NOT NULL,
            transaction_date TEXT NOT NULL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);
        db.run(`
          CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            month TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, category, month),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        // Check if demo user exists
        db.get('SELECT id FROM users WHERE email = ?', ['demo@tracker.com'], async (err, row) => {
          if (err) return reject(err);
          let userId;
          if (!row) {
            const hash = await bcrypt.hash('Password123!', 10);
            db.run(
              'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
              ['Demo User', 'demo@tracker.com', hash],
              function (insertErr) {
                if (insertErr) return reject(insertErr);
                userId = this.lastID;
                seedData(userId);
              }
            );
          } else {
            userId = row.id;
            seedData(userId);
          }
        });

        function seedData(userId) {
          // Check if transactions exist
          db.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', [userId], (err, txRow) => {
            if (err) return reject(err);
            if (txRow.count === 0) {
              const csvPath = path.resolve(__dirname, '../../dataset/sample_expense_dataset.csv');
              if (fs.existsSync(csvPath)) {
                const content = fs.readFileSync(csvPath, 'utf8');
                const lines = content.split('\n').filter(l => l.trim().length > 0);
                const stmt = db.prepare(`
                  INSERT INTO transactions 
                  (user_id, type, category, description, amount, payment_method, transaction_date, notes) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                for (let i = 1; i < lines.length; i++) {
                  const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
                  const match = [];
                  let m;
                  while ((m = regex.exec(lines[i])) !== null) {
                    if (m.index === regex.lastIndex) regex.lastIndex++;
                    const val = m[1] !== undefined ? m[1].replace(/""/g, '"') : m[2];
                    match.push(val);
                  }
                  if (match.length >= 8) {
                    const [, date, type, category, description, amountStr, paymentMethod, notes] = match;
                    stmt.run([userId, type, category, description, parseFloat(amountStr) || 0, paymentMethod, date, notes || '']);
                  }
                }
                stmt.finalize();
              }
            }
          });

          // Check if budgets exist
          db.get('SELECT COUNT(*) as count FROM budgets WHERE user_id = ?', [userId], (err, bRow) => {
            if (err) return reject(err);
            if (bRow.count === 0) {
              const budgetData = [
                [userId, 'Food', 10000.00, '2026-01'],
                [userId, 'Rent', 22000.00, '2026-01'],
                [userId, 'Bills', 5000.00, '2026-01'],
                [userId, 'Transport', 5000.00, '2026-01'],
                [userId, 'Shopping', 8000.00, '2026-01'],
                [userId, 'Entertainment', 4000.00, '2026-01'],
                [userId, 'Healthcare', 3000.00, '2026-01'],
                [userId, 'Food', 12000.00, '2026-02'],
                [userId, 'Rent', 22000.00, '2026-02'],
                [userId, 'Bills', 4500.00, '2026-02'],
                [userId, 'Transport', 6000.00, '2026-02'],
                [userId, 'Food', 12000.00, '2026-03'],
                [userId, 'Rent', 22000.00, '2026-03'],
                [userId, 'Bills', 5500.00, '2026-03'],
                [userId, 'Food', 11000.00, '2026-04'],
                [userId, 'Rent', 22000.00, '2026-04'],
                [userId, 'Bills', 6000.00, '2026-04'],
                [userId, 'Transport', 6500.00, '2026-04'],
                [userId, 'Shopping', 7500.00, '2026-04'],
                [userId, 'Entertainment', 4000.00, '2026-04'],
                [userId, 'Healthcare', 5000.00, '2026-04'],
                [userId, 'Travel', 15000.00, '2026-04'],
                [userId, 'Food', 11000.00, '2026-10'],
                [userId, 'Rent', 22000.00, '2026-10'],
                [userId, 'Bills', 6000.00, '2026-10'],
                [userId, 'Transport', 6500.00, '2026-10'],
                [userId, 'Shopping', 7500.00, '2026-10'],
                [userId, 'Entertainment', 4000.00, '2026-10'],
                [userId, 'Healthcare', 5000.00, '2026-10']
              ];
              const bStmt = db.prepare('INSERT OR IGNORE INTO budgets (user_id, category, amount, month) VALUES (?, ?, ?, ?)');
              for (const b of budgetData) {
                bStmt.run(b);
              }
              bStmt.finalize();
            }
            resolve();
          });
        }
      } catch (e) {
        reject(e);
      }
    });
  });

  function translateSql(sql) {
    let s = sql;
    s = s.replace(/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*['"]%Y-%m-%d['"]\s*\)/gi, "strftime('%Y-%m-%d', $1)");
    s = s.replace(/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*['"]%Y-%m['"]\s*\)/gi, "strftime('%Y-%m', $1)");
    s = s.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+amount\s*=\s*VALUES\s*\(\s*amount\s*\)/gi,
      "ON CONFLICT(user_id, category, month) DO UPDATE SET amount = excluded.amount"
    );
    return s;
  }

  const pool = {
    async query(sql, params = []) {
      await initPromise;
      const translated = translateSql(sql);
      const safeParams = (params || []).map(p => (p === undefined ? null : p));
      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(translated);

      return new Promise((resolve, reject) => {
        if (isSelect) {
          db.all(translated, safeParams, (err, rows) => {
            if (err) return reject(err);
            resolve([rows || [], null]);
          });
        } else {
          db.run(translated, safeParams, function (err) {
            if (err) return reject(err);
            resolve([{
              insertId: this.lastID,
              affectedRows: this.changes
            }, null]);
          });
        }
      });
    },

    async getConnection() {
      await initPromise;
      return {
        query: pool.query,
        release: () => {}
      };
    },

    async end() {
      return new Promise((resolve) => db.close(resolve));
    }
  };

  return { pool, initPromise };
}

module.exports = { initSqliteDatabase };
