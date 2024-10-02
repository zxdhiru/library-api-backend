const { Schema, model } = require("mongoose");

// Define the main product schema
const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  issuedBy: {
    type: [Schema.Types.ObjectId],
    ref: 'Student'
  }
}, { timestamps: true });

// Create and export the Product model
const Book = model("Book", bookSchema);

module.exports = Book;
