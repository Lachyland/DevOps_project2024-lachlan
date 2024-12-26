const fs = require('fs').promises; // For working with file system asynchronously

async function addStudent(req, res) {
    try {
        const { adminNumber, name, diploma, cGPA, image } = req.body;

        // Read the existing students from the JSON file
        const studentsData = await fs.readFile('studentdata.json', 'utf-8');
        const students = JSON.parse(studentsData); // Parse the JSON data

        // Create a new student object
        const newStudent = {
            adminNumber,
            name,
            diploma,
            cGPA: parseFloat(cGPA), // Convert cGPA to number
            image
        };

        // Add the new student to the array
        students.push(newStudent);

        // Save the updated students array back to the JSON file
        await fs.writeFile('studentdata.json', JSON.stringify(students, null, 2));

        // Return the added student in the response
        return res.status(201).json(newStudent);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { addStudent };
