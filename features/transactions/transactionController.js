const Student = require("../students/studentModel");
const Book = require("../books/bookModel");
const Transaction = require("./transactionModel");
const { sendError, sendResponse } = require("../../service/helperFunction");
const mongoose = require("mongoose");

const issueBooks = async (req, res) => {
    try {
        const { bookIds, studentId, transactionType } = req.body;
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
            const existingTransaction = await Transaction.findOne({ bookId, studentId, returnDate: null, transactionType });
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
            transactionType
        });

        return sendResponse(res, 201, { student, issuedBooks, transaction });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Something went wrong");
    }
};


const getIssuedBookTransaction = async (req, res) => {
    const { bookId } = req.params; // Get the bookId from request parameters
    if (!bookId) return sendError(res, 400, "Provide BookId");

    try {
        // Find all transactions that include the specified bookId
        const transactions = await Transaction.find({ bookIds: bookId }); // Ensure that 'bookIds' is the correct field name
        // If no transactions are found
        if (!transactions.length) {
            return sendResponse(res, 404, "No transactions found for this book.");
        }

        // Filter transactions to exclude those with null returnDate
        const validTransactions = transactions.filter(transaction => transaction.returnDate == null);

        // Map through the valid transactions to get detailed information
        const issueDetails = await Promise.all(validTransactions.map(async (transaction) => {
            const book = await Book.findById(transaction.bookIds)
            const student = await Student.findById(transaction.studentId); // Get student details

            return {
                book: book.name, // If bookIds is an array, you might need to adjust this based on your structure
                student: student ? student.name : "Unknown Student", // Handle case where student may not exist
                issueDate: transaction.issueDate,
                dueDate: transaction.dueDate,
                returnDate: transaction.returnDate,
                transactionId: transaction._id
            };
        }));

        // If no valid transactions are found after filtering
        if (!issueDetails.length) {
            return sendResponse(res, 404, { message: "No issued transactions found for this book." });
        }

        return sendResponse(res, 200, issueDetails); // Send all issue details in response
    } catch (error) {
        console.error("Error fetching transactions:", error); // Log the error for debugging
        return sendError(res, 500, "Something went wrong"); // Send a generic error message
    }
};


const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("bookIds").populate("studentId")
        if (!transactions || transactions.length === 0) return sendError(res, 200, "No transactions available!");
        sendResponse(res, 200, transactions)
    } catch (error) {
        sendError(res, 400, "Something went wrong")
    }
}

const returnBooks = async (req, res) => {
    try {
        const { bookIds, transactionType } = req.body;
        if (!bookIds || !Array.isArray(bookIds)) {
            return sendError(res, 400, "Provide array of BookIds");
        }

        if (!['returned'].includes(transactionType)) {
            return sendError(res, 400, "Invalid transaction type");
        }

        const returnedBooks = [];

        await Promise.all(bookIds.map(async (bookId) => {
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                throw new Error(`Invalid book ID: ${bookId}`);
            }

            const transaction = await Transaction.findOne({ bookIds: { $in: [bookId] }, returnDate: null });
            if (!transaction) throw new Error(`Transaction for book ID ${bookId} not found`);

            const book = await Book.findById(bookId);
            if (!book) throw new Error(`Book with ID ${bookId} not found`);

            const student = await Student.findById(transaction.studentId);
            if (!student) throw new Error(`Student with ID ${transaction.studentId} not found`);

            const bookIndex = book.issuedBy.indexOf(transaction.studentId);
            if (bookIndex > -1) {
                book.stock += 1;
                book.issuedBy.splice(bookIndex, 1);
                await book.save();
            }

            transaction.returnDate = new Date();
            transaction.transactionType = transactionType;
            await transaction.save();

            const studentBookIndex = student.booksIssued.indexOf(bookId);
            if (studentBookIndex > -1) {
                student.booksIssued.splice(studentBookIndex, 1);
                await student.save();
            }

            returnedBooks.push({ book });
        }));

        return sendResponse(res, 201, "Books returned successfully", returnedBooks);
    } catch (error) {
        console.error(error.message);
        return sendError(res, 500, error.message || "Something went wrong");
    }
};


module.exports = {
    issueBooks,
    returnBooks,
    getTransactions,
    getIssuedBookTransaction
};
