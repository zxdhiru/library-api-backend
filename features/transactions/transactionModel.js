const { Schema, model, default: mongoose } = require("mongoose");

const transactionSchema = new Schema({
    bookIds: {
        type: [Schema.Types.ObjectId],
        ref: 'Book',
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Transaction = model('Transaction', transactionSchema);
module.exports = Transaction;