// update-student-util.js
const Student = require('../models/Student'); // Adjust the path as necessary

async function updateStudent(id, studentData) {
    const { adminNumber, name, diploma, cGPA } = studentData;

    try {
        const student = await Student.findByIdAndUpdate(
            id,
            { adminNumber, name, diploma, cGPA },
            { new: true }
        );

        if (!student) {
            throw new Error('Resource not found');
        }

        // Convert Decimal128 fields to strings if necessary
        return {
            adminNumber: student.adminNumber,
            name: student.name,
            diploma: student.diploma,
            cGPA: student.cGPA ? student.cGPA.toString() : null,
        };
    } catch (error) {
        throw new Error(`Error updating resource: ${error.message}`);
    }
}

module.exports = updateStudent;
