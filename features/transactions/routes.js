const { Router } = require("express");

const { issueBooks, returnBooks, getIssuedBookTransaction, getTransactions, getTransactionDetails } = require("./transactionController");

const transactionRouter = Router()

transactionRouter.get('/', getTransactions);
transactionRouter.get('book/:bookId', getIssuedBookTransaction);
transactionRouter.get('/:transactionId', getTransactionDetails);
transactionRouter.post('/issue', issueBooks);
transactionRouter.post('/return', returnBooks);

module.exports = transactionRouter;