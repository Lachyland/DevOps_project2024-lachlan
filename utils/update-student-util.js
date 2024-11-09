const Student = require('../models/Student'); // Adjust the path if necessary

async function updateStudent(adminNumber, studentData) {
    const { name, diploma, cGPA, image } = studentData;

    try {
        // Prepare update object
        const updateFields = {
            name,
            diploma,
            cGPA
        };

        // If image exists, include it in the update
        if (image !== undefined) {
            updateFields.image = image;  // Only update the image if it's provided
        }

        // Perform the update operation
        const student = await Student.findOneAndUpdate(
            { adminNumber },  // Find by adminNumber
            updateFields,  // Update fields, including image if present
            { new: true }  // Return the updated document
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
