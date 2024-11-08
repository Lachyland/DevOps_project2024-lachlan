const Student = require('../models/Student');

async function deleteStudent(req, res) {
    const { id } = req.params;
    try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = deleteStudent;
