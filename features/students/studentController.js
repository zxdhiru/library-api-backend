const Student = require('./studentModel')
const { sendError, sendResponse } = require('../../service/helperFunction')

const getStudents = async (req, res) => {
    const { batch, emailDomain } = req.query;
    let query = {};

    // Build query based on parameters
    if (batch) {
        query.batch = batch;
    }
    if (emailDomain) {
        query.email = { $regex: `@${emailDomain}$`, $options: 'i' }; // Case-insensitive regex for email domain
    }

    try {
        const students = await Student.find(query);
        if (!students || students.length === 0) return sendError(res, 200, "No students available!");
        return sendResponse(res, 200, students);
    } catch (error) {
        return sendError(res, 500, "Database connection error");
    }
};



const getStudentById = async (req, res) => {
    const { id } = req.params
    try {
        const student = await Student.findById(id).populate("booksIssued")
        if (!student) return sendError(res, 404, "Student not found")
        return sendResponse(res, 201, student)
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}
const addStudent = async (req, res) => {
    const { name, email, phone, studentId, image, batch } = req.body;

    try {
        // Validate required fields
        if (!name) return sendError(res, 400, "Name is required");
        if (!email) return sendError(res, 400, "Email is required")
        if (!phone) return sendError(res, 400, "Phone number is required")
        if (!studentId) return sendError(res, 400, "Student ID is required")
        if (!image) return sendError(res, 400, "Image is required")
        if (!batch) return sendError(res, 400, "Batch is required")

        // Create student
        const student = await Student.create({ name, email, phone, studentId, image, batch })
        console.log('Student added successfully');
        return sendResponse(res, 201, student, "Student added successfully")
    } catch (error) {
        const duplicateEntryKey = Object.keys(error.keyValue)[0]
        const duplicateEntryValue = Object.values(error.keyValue)[0]

        if (error.code === 11000) return sendError(res, 500, `${duplicateEntryKey}: ${duplicateEntryValue} already exists`)
        return sendError(res, 500, "Something went wrong")
    }
}



const updateStudent = async (req, res) => {
    const { name, email, phone, studentId, image, batch } = req.body
    const { id } = req.params

    try {
        const student = await Student.findById(id)
        if (!student) return sendError(res, 404, "Student not found")
        await Student.findOneAndUpdate(id, { name, email, phone, studentId, image, batch })
        return sendResponse(res, 201, "Student updated successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}



const deleteStudent = async (req, res) => {
    const { id } = req.params
    if (!id) return sendError(res, 404, "Unable to get the student")
    try {
        await Student.findOneAndDelete(id)
        return sendResponse(res, 201, "Student deleted successfully")
    } catch (error) {
        return sendError(res, 400, error.message)
    }
}

module.exports = {
    addStudent,
    getStudentById,
    getStudents,
    updateStudent,
    deleteStudent
}