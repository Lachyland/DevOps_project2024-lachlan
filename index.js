var express = require('express')
var bodyParser = require("body-parser");
var app = express();

const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT || 5050
var startPage = "index.html";
mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' :
        address.address}:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
});

const updateStudent = require('./utils/update-student-util'); // Adjust path as needed

app.put('/update-student/:id', async (req, res) => {
    const { id } = req.params;
    const { adminNumber, name, diploma, cGPA } = req.body;

    try {
        const updatedStudent = await updateStudent(id, { adminNumber, name, diploma, cGPA });
        res.json({ message: 'Resource updated successfully', student: updatedStudent });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = { app, server }