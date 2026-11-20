const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/summary', analyticsController.getSummary);
router.get('/category-expenses', analyticsController.getCategoryExpenses);
router.get('/monthly-expenses', analyticsController.getMonthlyExpenses);
router.get('/income-vs-expense', analyticsController.getIncomeVsExpense);
router.get('/budget-vs-actual', analyticsController.getBudgetVsActual);

module.exports = router;
