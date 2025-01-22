const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const Student = require('./models/Student'); 
const cors = require('cors');
const { readStudent } = require('./utils/read-util.js');
require('dotenv').config();
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 5050;
const startPage = "index.html";

const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());

mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const { addStudent } = require('./utils/add-studentUtil');
app.post('/add-student', addStudent);

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
});

app.use(express.static("public"));
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// Serve the start page
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
});

// Set up the route for reading student data
app.get('/read-student', readStudent); // Use the readStudent function as a handler

// Delete student route
const deleteStudent = require('./utils/delete-util'); // Import the delete function
app.delete('/delete-student/:id', deleteStudent); // Use delete function for deleting a student by ID

// Set up the route for updating student data
const updateStudent = require('./utils/update-student-util'); // Adjust path as needed
app.put('/update-student', async (req, res) => {
    try {
        const { adminNumber, name, diploma, cGPA, image } = req.body;

        // Log the data received
        console.log('Received update for student:', { adminNumber, name, diploma, cGPA, image });

        // Update the student record in the database
        const updatedStudent = await Student.findOneAndUpdate(
            { adminNumber },
            { name, diploma, cGPA, image },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Send success message upon successful update
        res.json({ message: 'Student updated successfully', student: updatedStudent });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error updating student: ' + error.message });
    }
});


// Start the server
const server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' : address.address}:${address.port}`;
    console.log(`project at: ${baseUrl}`);
    logger.info(`Demo project at: ${baseUrl}!`);
    logger.error(`Example or error log`)
});

module.exports = { app, server };
