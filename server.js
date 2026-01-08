require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve frontend files from root

// Database Connection
const dbURI = process.env.MONGODB_URI; // Safe connection

mongoose.connect(dbURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// ... (Rest of your routes/schemas stay the same) ...

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// --- ROUTES ---

// 1. REGISTER USER
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

// 2. LOGIN USER (Updated to return _id)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Send back the user ID so the frontend can use it
        res.json({ 
            message: "Login Successful", 
            user: { _id: user._id, name: user.name, email: user.email } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. REGISTER FOR A COURSE (New!)
app.post('/register-course', async (req, res) => {
    const { userId, studentName, courseName, courseCode } = req.body;

    try {
        // Prevent duplicate registration
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

// 4. GET MY COURSES (New!)
app.get('/my-courses/:userId', async (req, res) => {
    try {
        const courses = await Course.find({ userId: req.params.userId });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 5. DELETE A REGISTERED COURSE (New!)
app.delete('/delete-course/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        
        // Find the course by ID and remove it
        await Course.findByIdAndDelete(courseId);
        
        res.status(200).json({ message: "Course removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));