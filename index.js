const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');
const { readStudent } = require('./utils/read-util.js'); // Import the readStudent function
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;
const startPage = "index.html";

mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

// Start the server
const server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' : address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});

module.exports = { app, server };
