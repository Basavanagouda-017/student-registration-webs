const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const port = 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Utility functions to read/write JSON file
const DATA_FILE = path.join(__dirname, "students.json");

function readStudents() {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function saveStudents(students) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// Routes

// Home
app.get("/", (req, res) => {
    res.render("index");
});

// Register form
app.get("/register", (req, res) => {
    res.render("register");
});

// Handle registration
app.post("/register", (req, res) => {
    const { name, email, age, phone, gender, course, address } = req.body;

    if (!name || !email || !age || !phone || !gender || !course || !address) {
        return res.send("All fields are required!");
    }

    let students = readStudents();
    students.push({ name, email, age, phone, gender, course, address });
    saveStudents(students);

    res.render("success", { name });
});

// View all students
app.get("/students", (req, res) => {
    const students = readStudents();
    res.render("students", { students, total: students.length });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
