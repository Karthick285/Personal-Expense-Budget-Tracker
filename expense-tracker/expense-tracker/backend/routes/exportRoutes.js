const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authenticateToken = require('../middleware/auth');

// Public sample dataset download
router.get('/sample-csv', exportController.downloadSampleCSV);

// User-specific authenticated downloads
router.get('/csv', authenticateToken, exportController.exportCSV);
router.get('/excel', authenticateToken, exportController.exportExcel);
router.get('/json', authenticateToken, exportController.exportJSON);

module.exports = router;
