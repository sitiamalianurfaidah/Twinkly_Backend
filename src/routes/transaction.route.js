const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/create', transactionController.createTransaction);
router.post('/pay', transactionController.payTransaction); 
router.delete('/:id', transactionController.deleteTransaction);
router.get('/', transactionController.getAllTransactions);

module.exports = router;