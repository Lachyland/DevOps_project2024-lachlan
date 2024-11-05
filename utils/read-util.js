const student = require('../models/Student'); // Import the model directly

// Function to fetch all student data
async function readStudent(req, res) {
    try {
        const allStudents = await student.find();
        
        // Convert cGPA to string if needed
        const studentsData = allStudents.map(student => ({
            ...student.toObject(),
            cGPA: student.cGPA.toString() // Ensure Decimal128 is converted to string
        }));
        
        return res.status(200).json(studentsData);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    readStudent,
};
