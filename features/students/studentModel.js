const { Schema, model } = require("mongoose");

// Define the main product schema
const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  studentId: {
    type: Number,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  booksIssued: {
    type: [Schema.Types.ObjectId],
    ref: 'Book',
    default: []
  }
}, { timestamps: true, strictPopulate: false });

// Create and export the Product model
const Student = model("Student", studentSchema);

module.exports = Student;
