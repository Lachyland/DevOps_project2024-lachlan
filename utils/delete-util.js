const fs = require('fs').promises;

async function deleteStudent(req, res) {
    try {
        const { id } = req.params;

        // Read the existing student data
        const studentsData = await fs.readFile('studentdata.json', 'utf-8');
        const students = JSON.parse(studentsData);

        // Find the student to delete
        const studentIndex = students.findIndex(student => student.adminNumber === id);
        
        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove the student from the array
        students.splice(studentIndex, 1);

        // Save the updated students list back to the JSON file
        await fs.writeFile('studentdata.json', JSON.stringify(students, null, 2));

        // Send a success message
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

module.exports = deleteStudent;
