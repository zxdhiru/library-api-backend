const Student = require("../students/studentModel");
const Book = require("../books/bookModel");
const Transaction = require("./transactionModel");
const { sendError, sendResponse } = require("../../service/helperFunction");
const mongoose = require("mongoose");

const issueBooks = async (req, res) => {
    try {
        const { bookIds, studentId } = req.body;
        if (!bookIds || !studentId || !Array.isArray(bookIds)) {
            return sendError(res, 400, "Provide student Id and an array of BookIds");
        }

        // Ensure the ID is a valid mongoose ObjectId
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return sendError(res, 400, "Invalid student ID");
        }

        const student = await Student.findById(studentId);
        if (!student) return sendError(res, 404, "Student not found");

        const issuedBooks = [];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        for (const bookId of bookIds) {
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return sendError(res, 400, `Invalid book ID: ${bookId}`);
            }

            const book = await Book.findById(bookId);
            if (!book) return sendError(res, 404, `Book with ID ${bookId} not found`);
            if (book.stock <= 0) return sendError(res, 400, `Book with ID ${bookId} is out of stock`);

            // Check if the book is already issued to the same student
            const existingTransaction = await Transaction.findOne({ bookId, studentId, returnDate: null });
            if (existingTransaction) {
                return sendError(res, 400, `Book with ID ${bookId} is already issued to this student`);
            }

            // Decrease book stock
            book.stock -= 1;

            // Add studentId to the issuedBy array of the book
            book.issuedBy.push(studentId);
            await book.save();

            // Add bookId to student's issued books
            student.booksIssued.push(bookId);

            issuedBooks.push({ book, dueDate });
        }

        // Save student after all books are issued
        await student.save();

        // Create a single transaction with all bookIds
        const transaction = await Transaction.create({
            bookIds,
            studentId,
            dueDate,
            issueDate: new Date(),
        });

        return sendResponse(res, 201, { student, issuedBooks, transaction });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Something went wrong");
    }
};


const getIssuedBookTransaction = async (req, res) => {
    const { bookIds } = req.body
    if (!bookIds || !Array.isArray(bookIds)) return sendError(res, 400, "Provide array of BookIds");
    const issuedBooks = []
    try {
        for (const bookId of bookIds) {
            const transaction = await Transaction.findOne({ bookIds })
            const book = await Book.findById(bookId)
            const student = await Student.findById(transaction.studentId)
            const issueDetail = {
                book: book.title,
                student: student.name,
                issueDate: transaction.issueDate,
                dueDate: transaction.dueDate,
                transactionId: transaction._id
            }
            issuedBooks.push(issueDetail)
        }
        console.log(issuedBooks);

        return sendResponse(res, 200, issuedBooks)
    } catch (error) {
        return sendError(res, 404, "Something went wrong")
    }
}
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
        if (!transactions || transactions.length === 0) return sendError(res, 200, "No transactions available!");
        sendResponse(res, 200, transactions)
    } catch (error) {
        sendError(res, 400, "Something went wrong")
    }
}

const returnBooks = async (req, res) => {
    try {
        const { bookIds } = req.body;
        if (!bookIds || !Array.isArray(bookIds)) {
            return sendError(res, 400, "Provide array of BookIds");
        }

        const returnedBooks = [];

        for (const bookId of bookIds) {
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return sendError(res, 400, `Invalid book ID: ${bookId}`);
            }

            const transaction = await Transaction.findOne({ bookIds });
            if (!transaction) return sendError(res, 404, `Transaction for book ID ${bookId} not found`);

            const book = await Book.findById(bookId);
            if (!book) return sendError(res, 404, `Book with ID ${bookId} not found`);

            const student = await Student.findById(transaction.studentId);
            if (!student) return sendError(res, 404, `Student with ID ${transaction.studentId} not found`);

            const bookIndex = book.issuedBy.indexOf(transaction.studentId);
            if (bookIndex > -1) {
                // Update the book stock and issuedBy array
                book.stock += 1;
                book.issuedBy.splice(bookIndex, 1);
                await book.save();
            }

            // Set the return date on the transaction
            transaction.returnDate = new Date();
            await transaction.save();

            // Remove the book from the student's booksIssued array
            const studentBookIndex = student.booksIssued.indexOf(bookId);
            if (studentBookIndex > -1) {
                student.booksIssued.splice(studentBookIndex, 1);
                await student.save();
            }

            returnedBooks.push({ book });
        }

        return sendResponse(res, 201, "Books returned successfully", returnedBooks);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Something went wrong");
    }
};


module.exports = {
    issueBooks,
    returnBooks,
    getTransactions,
    getIssuedBookTransaction
};
