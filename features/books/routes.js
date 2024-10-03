const { Router } = require("express");

const { getBooks, getBookById, updateBook, deleteBook, addBook } = require("./bookController");

const bookRouter = Router()

bookRouter.get('/', getBooks);
bookRouter.post('/', addBook);

bookRouter.get('/:id', getBookById);

bookRouter.patch('/:id', updateBook);

bookRouter.delete('/:id', deleteBook);

module.exports = bookRouter;