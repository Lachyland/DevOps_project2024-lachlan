const Student = require('../models/Student');
const fs = require('fs').promises;
const mongoose = require('mongoose');

async function addStudent(req, res) {
    try {
        const { adminNumber, name, diploma, cGPA, image } = req.body;

        const cGPADecimal = mongoose.Types.Decimal128.fromString(cGPA.toString());

        const newStudent = new Student({ adminNumber, name, diploma, cGPA: cGPADecimal, image });
        const savedStudent = await newStudent.save();

        return res.status(201).json(savedStudent);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = {
    addStudent
};