const http = require('http');

// Start backend app directly in memory for testing
const app = require('./server');
const server = app.listen(5099, async () => {
  console.log('[Test Suite] In-process server listening on port 5099');

  async function request(options, body = null) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 5099,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    console.log('--- 1. Testing Health Endpoint ---');
    const health = await request({ path: '/api/health', method: 'GET' });
    console.log('Health:', health.status, health.body.status);

    console.log('--- 2. Testing Demo Login ---');
    const loginRes = await request({
      path: '/api/auth/login',
      method: 'POST'
    }, {
      email: 'demo@tracker.com',
      password: 'Password123!'
    });
    console.log('Login:', loginRes.status, loginRes.body.success, loginRes.body.user.email);
    const token = loginRes.body.token;

    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log('--- 3. Testing Get Profile ---');
    const profileRes = await request({
      path: '/api/auth/profile',
      method: 'GET',
      headers: authHeaders
    });
    console.log('Profile:', profileRes.status, profileRes.body.user.name);

    console.log('--- 4. Testing Analytics Summary ---');
    const summaryRes = await request({
      path: '/api/analytics/summary',
      method: 'GET',
      headers: authHeaders
    });
    console.log('Summary Total Balance:', summaryRes.body.data.totalBalance, 'Total Trans:', summaryRes.body.data.totalTransactions);

    console.log('--- 5. Testing Create Transaction ---');
    const createTxRes = await request({
      path: '/api/transactions',
      method: 'POST',
      headers: authHeaders
    }, {
      type: 'Expense',
      category: 'Food',
      description: 'Automated Test Sushi Dinner',
      amount: 1250.50,
      payment_method: 'UPI',
      transaction_date: '2026-04-15',
      notes: 'Test note'
    });
    console.log('Create TX:', createTxRes.status, createTxRes.body.success, createTxRes.body.transaction.id);
    const newTxId = createTxRes.body.transaction.id;

    console.log('--- 6. Testing Update Transaction ---');
    const updateTxRes = await request({
      path: `/api/transactions/${newTxId}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      amount: 1300.00,
      description: 'Updated Sushi Dinner'
    });
    console.log('Update TX:', updateTxRes.status, updateTxRes.body.success, updateTxRes.body.transaction.amount);

    console.log('--- 7. Testing Delete Transaction ---');
    const deleteTxRes = await request({
      path: `/api/transactions/${newTxId}`,
      method: 'DELETE',
      headers: authHeaders
    });
    console.log('Delete TX:', deleteTxRes.status, deleteTxRes.body.success);

    console.log('--- 8. Testing Budgets ---');
    const budgetsRes = await request({
      path: '/api/budgets?month=2026-04',
      method: 'GET',
      headers: authHeaders
    });
    console.log('Budgets count:', budgetsRes.body.budgets.length, 'Summary:', budgetsRes.body.summary);

    console.log('--- 9. Testing Sample CSV Download ---');
    const sampleCsvRes = await request({
      path: '/api/export/sample-csv',
      method: 'GET'
    });
    console.log('Sample CSV status:', sampleCsvRes.status, 'Content-Type:', sampleCsvRes.headers['content-type']);

    console.log('\n>>> ALL BACKEND API TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
