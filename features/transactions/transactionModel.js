const { Schema, model } = require("mongoose");

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
    },
    transactionType: {
        type: String,
        enum: ['issued', 'returned'], // Restrict values to 'issued' or 'returned'
        required: true // Make this field required
    }
}, { timestamps: true });

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
