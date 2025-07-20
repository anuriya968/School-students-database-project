const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));



// Middleware to parse JSON bodies from requests
app.use(express.json());

app.use(cors()); // Allow cross-origin requests

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/schoolDB')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define Student schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  age: { type: Number, required: true },
  marks: {
    chemistry: { type: Number, default: 0 },
    math: { type: Number, default: 0 },
    science: { type: Number, default: 0 },
    english: { type: Number, default: 0 }
  }
});

const Student = mongoose.model('Student', studentSchema);

// ROUTES

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});


// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student by ID
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new student
app.post('/students', async (req, res) => {
  try {
    console.log('POST /students body:', req.body);
   const { name, class: className, age, marks } = req.body;

const student = new Student({
  name,
  class: className,
  age,
  marks
});

    await student.save();
    console.log('Student saved:', student);
    res.status(201).json(student);
  } catch (err) {
    console.error('Error saving student:', err);
    res.status(400).json({ error: err.message });
  }
});

//find a student by ID


// Update a student by ID
app.put('/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) return res.status(404).json({ error: "Student not found" });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a student by ID
app.delete('/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
