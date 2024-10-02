const { Router } = require("express");

const { getBooks, getBookById, updateBook, deleteBook, addBook } = require("./bookController");
const { issueBooks, returnBooks, getIssuedBookTransaction } = require("../transactions/transactionController");

const bookRouter = Router()

bookRouter.get('/', getBooks);
bookRouter.post('/', addBook);

bookRouter.get('/return', getIssuedBookTransaction);
bookRouter.post('/issue', issueBooks);
bookRouter.post('/return', returnBooks);

bookRouter.get('/:id', getBookById);

bookRouter.patch('/:id', updateBook);

bookRouter.delete('/:id', deleteBook);

module.exports = bookRouter;