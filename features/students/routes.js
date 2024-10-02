const { Router } = require("express");

const { getStudents, addStudent, getStudentById, updateStudent, deleteStudent } = require("./studentController");

const studentRouter = Router()

studentRouter.get('/', getStudents);
studentRouter.post('/', addStudent);

studentRouter.get('/:id', getStudentById);

studentRouter.patch('/:id', updateStudent);

studentRouter.delete('/:id', deleteStudent);

module.exports = studentRouter;