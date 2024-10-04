const Book = require('./bookModel')
const Author = require('../authors/authorModel')
const Student = require('../students/studentModel')
const { sendError, sendResponse } = require('../../service/helperFunction')


const getBooks = async (req, res) => {
    const { category, minPrice, maxPrice, title, sortBy, page, limit, author } = req.query;
    let query = {};

    // Build query based on parameters
    if (category) {
        query.category = category;
    }
    if (minPrice || maxPrice) {
        query.originalPrice = {};
        if (minPrice) query.originalPrice.$gte = Number(minPrice);
        if (maxPrice) query.originalPrice.$lte = Number(maxPrice);
    }
    if (title) {
        query.title = { $regex: title, $options: 'i' }; // Case-insensitive regex for title
    }

    let options = {};
    if (sortBy) {
        options.sort = { originalPrice: sortBy === 'asc' ? 1 : -1 };
    }
    if (page && limit) {
        options.skip = (Number(page) - 1) * Number(limit);
        options.limit = Number(limit);
    }

    try {
        if (author) {
            const authorDoc = await Author.findOne({ name: { $regex: author, $options: 'i' } });
            if (authorDoc) {
                query.author = authorDoc._id;
            } else {
                return sendError(res, 200, "No books available for the specified author!");
            }
        }

        const books = await Book.find(query, null, options).populate('author');
        if (!books || books.length === 0) return sendError(res, 200, "No books available!");
        return sendResponse(res, 200, books);
    } catch (error) {
        return sendError(res, 500, "Database connection error");
    }
};




const getBookById = async (req, res) => {
    const { id } = req.params
    try {
        const book = await Book.findById(id).populate('author').populate("issuedBy").populate("booksIssued")
        if (!book) return sendError(res, 404, "Book not found")
        return sendResponse(res, 201, book)
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}
const addBook = async (req, res) => {
    const { title, author, description, originalPrice, category, images, stock, sku } = req.body;

    try {
        // Validate required fields
        if (!title) return res.status(400).json({ error: "Title is required" });
        if (!author) return res.status(400).json({ error: "Author is required" });
        if (!description) return res.status(400).json({ error: "Description is required" });
        if (!originalPrice) return res.status(400).json({ error: "Original price is required" });
        if (!category) return res.status(400).json({ error: "Category is required" });
        if (!images || !images.length) return res.status(400).json({ error: "At least one image is required" });
        if (!sku) return res.status(400).json({ error: "SKU is required" });
        if (typeof stock !== 'number') return res.status(400).json({ error: "Stock is required and must be a number" });

        // Create book
        const book = await Book.create({ title, author, description, originalPrice, category, images, stock, sku });
        // Find the author and update their books array
        const authorDoc = await Author.findOne({ _id: author });
        if (authorDoc) {
            authorDoc.books.push(book._id);
            await authorDoc.save();
        } else {
            // If author does not exist, create a new author document
            await Author.create({ authorName: author, authorDescription: "Author description", authorImage: "Author image URL", books: [book._id] });
        }
        console.log('Book added successfully');
        return sendResponse(res, 201, book, "Book added successfully")
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 500, "Seems like this book already exists")
        } else {
            return sendError(res, 500, `${error._message}: Please enter appropriate data`, error)
        }
    }
}



const updateBook = async (req, res) => {
    const { title, description, originalPrice, category, images, stock, sku } = req.body
    const { id } = req.params

    try {
        const book = await Product.findById(id)
        if (!book) return sendError(res, 404, "Book not found")
        await Book.findOneAndUpdate(id, { title, description, originalPrice, category, images, stock, sku })
        return sendResponse(res, 201, "Book updated successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}



const deleteBook = async (req, res) => {
    const { id } = req.params
    if (!id) return sendError(res, 404, "Unable to get the book")
    try {
        await Product.findOneAndDelete(id)
        return sendResponse(res, 201, "Book deleted successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}

module.exports = {
    addBook,
    getBookById,
    getBooks,
    updateBook,
    deleteBook,
}