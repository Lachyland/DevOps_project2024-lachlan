const fs = require('fs').promises; // For working with file system asynchronously

// Function to fetch all student data from the JSON file
async function readStudent(req, res) {
    try {
        const { adminNumber, searchName, sortCGPA, filterDiploma } = req.query;

        // Read the student data from the JSON file
        const studentsData = await fs.readFile('studentdata.json', 'utf-8');
        const students = JSON.parse(studentsData);

        // Filter the students array based on query parameters
        let filteredStudents = students;

        if (adminNumber) {
            filteredStudents = filteredStudents.filter(student => student.adminNumber === adminNumber);
        }

        if (searchName) {
            filteredStudents = filteredStudents.filter(student => student.name.toLowerCase().includes(searchName.toLowerCase()));
        }

        if (filterDiploma) {
            filteredStudents = filteredStudents.filter(student => student.diploma === filterDiploma);
        }

        // Sort by CGPA if required
        if (sortCGPA) {
            const sortOrder = sortCGPA === 'asc' ? 1 : -1;
            filteredStudents = filteredStudents.sort((a, b) => sortOrder * (a.cGPA - b.cGPA));
        }

        // If no students match the criteria
        if (filteredStudents.length === 0) {
            return res.status(404).json({ message: 'No student records found' });
        }

        // Send the students as a response
        return res.status(200).json(filteredStudents);
    } catch (error) {
        console.error("Error fetching students:", error); // Log the error
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
}


module.exports = { readStudent };
