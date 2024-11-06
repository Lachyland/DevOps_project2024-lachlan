const Student = require('../models/Student'); // Adjust the path if necessary

async function updateStudent(adminNumber, studentData) {
    const { name, diploma, cGPA, image } = studentData;

    try {
        const student = await Student.findOneAndUpdate(
            { adminNumber }, // Find by adminNumber
            { name, diploma, cGPA, image }, // Update fields, including image
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
            image: student.image,
        };
    } catch (error) {
        throw new Error(`Error updating resource: ${error.message}`);
    }
}

module.exports = updateStudent;
