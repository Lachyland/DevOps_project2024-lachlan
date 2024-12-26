const fs = require('fs').promises;

async function updateStudent(req, res) {
    try {
        const { adminNumber, name, diploma, cGPA, image } = req.body;

        // Read the student data from the JSON file
        const studentsData = await fs.readFile('studentdata.json', 'utf-8');
        const students = JSON.parse(studentsData);

        // Find the student to update
        const studentIndex = students.findIndex(student => student.adminNumber === adminNumber);
        
        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update the student data
        students[studentIndex] = {
            ...students[studentIndex],
            name,
            diploma,
            cGPA: parseFloat(cGPA),
            image
        };

        // Save the updated students list back to the JSON file
        await fs.writeFile('studentdata.json', JSON.stringify(students, null, 2));

        // Return the updated student
        res.json({ message: 'Student updated successfully', student: students[studentIndex] });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

module.exports = updateStudent;
