const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { initSqliteDatabase } = require('./sqliteAdapter');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let activePool = null;
let activeEngine = 'unknown';

const initPromise = (async () => {
  // 1. Try MySQL first
  try {
    const mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'expense_tracker',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    const conn = await mysqlPool.getConnection();
    conn.release();

    activePool = mysqlPool;
    activeEngine = 'MySQL';
    console.log(`[Database] Successfully connected to MySQL (${process.env.DB_NAME || 'expense_tracker'})`);
    return activePool;
  } catch (mysqlErr) {
    console.warn(`[Database] MySQL not reachable (${mysqlErr.code || mysqlErr.message}).`);
    console.log('[Database] Automatically activating embedded SQLite engine (expense_tracker.sqlite)...');

    const { pool, initPromise: sqliteInit } = initSqliteDatabase();
    await sqliteInit;
    activePool = pool;
    activeEngine = 'SQLite';
    console.log('[Database] Embedded SQLite engine activated and ready.');
    return activePool;
  }
})();

const poolWrapper = {
  async query(sql, params) {
    await initPromise;
    return activePool.query(sql, params);
  },

  async execute(sql, params) {
    await initPromise;
    if (typeof activePool.execute === 'function') {
      return activePool.execute(sql, params);
    }
    return activePool.query(sql, params);
  },

  async getConnection() {
    await initPromise;
    return activePool.getConnection();
  },

  async end() {
    if (activePool && typeof activePool.end === 'function') {
      return activePool.end();
    }
  },

  getEngine() {
    return activeEngine;
  }
};

module.exports = poolWrapper;
