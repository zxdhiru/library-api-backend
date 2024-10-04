const { Router } = require("express");

const { issueBooks, returnBooks, getIssuedBookTransaction, getTransactions } = require("./transactionController");

const transactionRouter = Router()

transactionRouter.get('/', getTransactions);
transactionRouter.get('/:bookId', getIssuedBookTransaction);
transactionRouter.post('/issue', issueBooks);
transactionRouter.post('/return', returnBooks);

module.exports = transactionRouter;