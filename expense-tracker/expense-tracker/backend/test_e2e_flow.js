const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
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

async function runE2E() {
  console.log('=== STARTING END-TO-END FLOW VERIFICATION ===');
  
  const testUser = {
    name: 'Jane Doe',
    email: `jane_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!'
  };

  // 1. Register
  console.log('Step 1: Register new account...');
  const regRes = await request('/api/auth/register', 'POST', testUser);
  if (regRes.status !== 201 || !regRes.body.token) throw new Error('Registration failed: ' + JSON.stringify(regRes.body));
  console.log('✓ Registered successfully with ID:', regRes.body.user.id);
  const token = regRes.body.token;

  // 2. Login
  console.log('Step 2: Login with credentials...');
  const loginRes = await request('/api/auth/login', 'POST', {
    email: testUser.email,
    password: testUser.password
  });
  if (loginRes.status !== 200) throw new Error('Login failed');
  console.log('✓ Login verified.');

  // 3. Add Income Transaction
  console.log('Step 3: Add Income transaction (Salary: ₹90,000)...');
  const incRes = await request('/api/transactions', 'POST', {
    type: 'Income',
    category: 'Salary',
    description: 'Monthly Senior Tech Salary',
    amount: 90000,
    payment_method: 'Net Banking',
    transaction_date: '2026-04-01',
    notes: 'Direct salary deposit'
  }, token);
  if (incRes.status !== 201) throw new Error('Add income failed: ' + JSON.stringify(incRes.body));
  console.log('✓ Income transaction added, ID:', incRes.body.transaction.id);

  // 4. Add Expense Transaction (Rent)
  console.log('Step 4: Add Expense transaction (Rent: ₹20,000)...');
  const rentRes = await request('/api/transactions', 'POST', {
    type: 'Expense',
    category: 'Rent',
    description: 'April Apartment Rent',
    amount: 20000,
    payment_method: 'Net Banking',
    transaction_date: '2026-04-02',
    notes: 'Monthly rent'
  }, token);
  if (rentRes.status !== 201) throw new Error('Add rent failed');
  console.log('✓ Rent expense added, ID:', rentRes.body.transaction.id);

  // 5. Add Expense Transaction (Food)
  console.log('Step 5: Add Expense transaction (Food: ₹6,000)...');
  const foodRes = await request('/api/transactions', 'POST', {
    type: 'Expense',
    category: 'Food',
    description: 'Organic Supermarket Grocery',
    amount: 6000,
    payment_method: 'UPI',
    transaction_date: '2026-04-03',
    notes: 'Weekly pantry'
  }, token);
  if (foodRes.status !== 201) throw new Error('Add food failed');
  const foodTxId = foodRes.body.transaction.id;
  console.log('✓ Food expense added, ID:', foodTxId);

  // 6. Set Monthly Budget for Food (₹8,000)
  console.log('Step 6: Set monthly budget for Food (₹8,000 for 2026-04)...');
  const budgetRes = await request('/api/budgets', 'POST', {
    category: 'Food',
    amount: 8000,
    month: '2026-04'
  }, token);
  if (budgetRes.status !== 201) throw new Error('Set budget failed: ' + JSON.stringify(budgetRes.body));
  console.log('✓ Budget set successfully.');

  // 7. Verify Dashboard Calculations
  console.log('Step 7: Verify Dashboard calculations from database...');
  const summaryRes = await request('/api/analytics/summary', 'GET', null, token);
  const s = summaryRes.body.data;
  console.log('   Total Balance:', s.totalBalance, '(Expected: 64000)');
  console.log('   Total Income:', s.totalIncome, '(Expected: 90000)');
  console.log('   Total Expenses:', s.totalExpenses, '(Expected: 26000)');
  console.log('   Savings:', s.savings, '(Expected: 64000)');
  if (s.totalBalance !== 64000 || s.totalIncome !== 90000 || s.totalExpenses !== 26000) {
    throw new Error('Summary calculations do not match expected figures!');
  }
  console.log('✓ Math verified: Balance = Income - Expenses = ₹64,000');

  // 8. Verify Budget Progress & Warning
  console.log('Step 8: Verify Budget progress calculation...');
  const budgetsCheck = await request('/api/budgets?month=2026-04', 'GET', null, token);
  const foodBudget = budgetsCheck.body.budgets.find(b => b.category === 'Food');
  console.log(`   Food Budget: ${foodBudget.budget}, Spent: ${foodBudget.spent}, Remaining: ${foodBudget.remaining}, Progress: ${foodBudget.progress}%`);
  if (foodBudget.progress !== 75 || foodBudget.remaining !== 2000) {
    throw new Error('Food budget calculation mismatch!');
  }
  console.log('✓ Budget progress verified: 75% utilized, ₹2,000 remaining.');

  // 9. Update Transaction (Increase Food to ₹9,000 to trigger over budget warning)
  console.log('Step 9: Update Food transaction to ₹9,000 to trigger budget exceeded...');
  const updateRes = await request(`/api/transactions/${foodTxId}`, 'PUT', {
    amount: 9000,
    description: 'Large Supermarket Run & Dinner'
  }, token);
  if (updateRes.status !== 200) throw new Error('Update transaction failed');
  
  const budgetsOver = await request('/api/budgets?month=2026-04', 'GET', null, token);
  const foodOver = budgetsOver.body.budgets.find(b => b.category === 'Food');
  console.log(`   Updated Food Spent: ${foodOver.spent}, Budget: ${foodOver.budget}, isExceeded: ${foodOver.isExceeded}`);
  if (!foodOver.isExceeded) throw new Error('Expected food budget to be marked as exceeded!');
  console.log('✓ Over-budget warning confirmed (isExceeded: true).');

  // 10. Delete Transaction
  console.log('Step 10: Delete transaction...');
  const delRes = await request(`/api/transactions/${foodTxId}`, 'DELETE', null, token);
  if (delRes.status !== 200) throw new Error('Delete failed');
  console.log('✓ Transaction deleted successfully.');

  // 11. Test Exports (CSV, Excel, JSON)
  console.log('Step 11: Testing Data Exports...');
  const csvRes = await request('/api/export/csv', 'GET', null, token);
  if (csvRes.status !== 200 || !csvRes.raw.includes('transaction_id,user_id')) throw new Error('CSV export failed');
  console.log('✓ CSV export generated and verified.');

  const jsonRes = await request('/api/export/json', 'GET', null, token);
  if (jsonRes.status !== 200 || !Array.isArray(jsonRes.body)) throw new Error('JSON export failed');
  console.log(`✓ JSON export generated with ${jsonRes.body.length} records.`);

  const sampleRes = await request('/api/export/sample-csv', 'GET');
  if (sampleRes.status !== 200 || !sampleRes.raw.includes('transaction_id,date,type,category')) throw new Error('Sample CSV failed');
  console.log('✓ Sample 120-row CSV download endpoint verified.');

  console.log('\n======================================================');
  console.log('>>> COMPLETE END-TO-END FLOW VERIFICATION PASSED! <<<');
  console.log('======================================================\n');
}

runE2E().catch(err => {
  console.error('E2E Failure:', err);
  process.exit(1);
});
