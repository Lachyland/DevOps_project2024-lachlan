const student = require('../models/Student');

// Function to fetch all student data with server-side filtering, sorting, and searching
async function readStudent(req, res) {
    try {
        const { adminNumber, searchName, sortCGPA, filterDiploma } = req.query;

        // Build query object for MongoDB
        const query = {};

        if (adminNumber) {
            query.adminNumber = adminNumber;
        }

        if (searchName) {
            query.name = { $regex: searchName, $options: 'i' }; // Case-insensitive regex search
        }

        if (filterDiploma) {
            query.diploma = filterDiploma;
        }

        // Fetch students from the database
        let students = await student.find(query);

        // Apply sorting if requested
        if (sortCGPA) {
            const sortOrder = sortCGPA === 'asc' ? 1 : -1;
            students = students.sort((a, b) => sortOrder * (a.cGPA - b.cGPA));
        }

        // Handle case where no student data is found
        if (students.length === 0) {
            return res.status(404).json({ message: 'No student records found' });
        }

        // Format response to include proper type conversions
        const formattedStudents = students.map(stu => ({
            ...stu.toObject(),
            cGPA: stu.cGPA?.toString()
        }));

        return res.status(200).json(formattedStudents);
    } catch (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

module.exports = { readStudent };
