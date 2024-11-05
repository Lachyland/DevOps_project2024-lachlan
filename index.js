var express = require('express')
var bodyParser = require("body-parser");
var app = express();
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT || 5050
var startPage = "index.html";
mongoose.set('strictQuery', true);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));
app.use(cors())

const { addStudent } = require('./utils/add-studentUtil')
app.post('/add-student', addStudent);

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


module.exports = { app, server }