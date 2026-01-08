require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve frontend files

// Database Connection
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// ==========================================
// 1. DEFINE SCHEMAS & MODELS (Missing in your code)
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    studentName: String,
    courseName: String,
    courseCode: String
});
const Course = mongoose.model('Course', courseSchema);

// ==========================================
// 2. ROUTES
// ==========================================

// Register User
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        res.json({ 
            message: "Login Successful", 
            user: { _id: user._id, name: user.name, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register Course
app.post('/register-course', async (req, res) => {
    const { userId, studentName, courseName, courseCode } = req.body;
    try {
        const existing = await Course.findOne({ userId, courseCode });
        if (existing) {
            return res.status(400).json({ message: "You have already registered for this course!" });
        }
        const newCourse = new Course({ userId, studentName, courseName, courseCode });
        await newCourse.save();
        res.status(201).json({ message: "Course Registered Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Courses
app.get('/my-courses/:userId', async (req, res) => {
    try {
        const courses = await Course.find({ userId: req.params.userId });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Course
app.delete('/delete-course/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Course removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 3. START SERVER (Only ONCE at the end)
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
