const { Router } = require("express");

const { getAuthor, addAuthor, getAuthorById, updateAuthor, deleteAuthor } = require("./authorController");

const authorRouter = Router()

authorRouter.get('/', getAuthor);
authorRouter.post('/', addAuthor);

authorRouter.get('/:id', getAuthorById);

authorRouter.patch('/:id', updateAuthor);

authorRouter.delete('/:id', deleteAuthor);

module.exports = authorRouter;