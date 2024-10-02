const { Schema, model } = require("mongoose");

// Define the main product schema
const authorSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true
    },
    books: {
        type: [Schema.Types.ObjectId],
        ref: 'Book',
        default: []
    }
}, { timestamps: true });

// Create and export the Product model
const Author = model("Author", authorSchema);

module.exports = Author;
