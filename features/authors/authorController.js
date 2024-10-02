const Author = require('./authorModel')
const { sendError, sendResponse } = require('../../service/helperFunction')

const getAuthor = async (req, res) => {
    try {
        const author = await Author.find();
        if (!author || author.length === 0) return sendError(res, 200, "No author available!");
        return sendResponse(res, 200, author);
    } catch (error) {
        return sendError(res, 500, "Database connection error");
    }
};


const getAuthorById = async (req, res) => {
    const { id } = req.params
    try {
        const author = await Author.findById(id).populate({
            path: 'books',
            select: 'title originalPrice'
        })
        if (!author) return sendError(res, 404, "Author not found")
        return sendResponse(res, 201, author)
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}
const addAuthor = async (req, res) => {
    const { name, image, description, books } = req.body;

    try {
        // Validate required fields
        if (!name) return sendError(res, 400, "Name is required");
        if (!description) return sendError(res, 400, "Batch is required")
        if (!image) return sendError(res, 400, "Image is required")

        // Create author
        const author = await Author.create({ name, image, description, books })
        console.log('Author added successfully');
        return sendResponse(res, 201, author, "Author added successfully")
    } catch (error) {
        const duplicateEntryKey = Object.keys(error.keyValue)[0]
        const duplicateEntryValue = Object.values(error.keyValue)[0]

        if (error.code === 11000) return sendError(res, 500, `${duplicateEntryKey}: ${duplicateEntryValue} already exists`)
        return sendError(res, 500, "Something went wrong")
    }
}



const updateAuthor = async (req, res) => {
    const { name, image, description, books } = req.body
    const { id } = req.params

    try {
        const author = await Author.findById(id)
        if (!author) return sendError(res, 404, "Author not found")
        await Author.findOneAndUpdate(id, { name, image, description, books })
        return sendResponse(res, 201, "Author updated successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}



const deleteAuthor = async (req, res) => {
    const { id } = req.params
    if (!id) return sendError(res, 404, "Unable to get the author")
    try {
        await Author.findOneAndDelete(id)
        return sendResponse(res, 201, "Author deleted successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}

module.exports = {
    addAuthor,
    getAuthorById,
    getAuthor,
    updateAuthor,
    deleteAuthor
}