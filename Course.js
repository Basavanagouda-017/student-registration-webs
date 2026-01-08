const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    studentName: String, // Optional: helpful for admin views
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true }
});

module.exports = mongoose.model('Course', CourseSchema);