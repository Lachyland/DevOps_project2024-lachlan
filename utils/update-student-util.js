const Student = require('../models/Student'); // Adjust the path if necessary

async function updateStudentByAdminNumber(adminNumber, studentData) {
    const { name, diploma, cGPA } = studentData;

    try {
        const student = await Student.findOneAndUpdate(
            { adminNumber }, // Find by adminNumber
            { name, diploma, cGPA }, // Update fields
            { new: true } // Return the updated document
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

module.exports = updateStudentByAdminNumber;
