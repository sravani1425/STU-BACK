import Student from '../models/Student.js';
import User from '../models/User.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const students = await Student.find({ ...keyword });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student by roll number
// @route   GET /api/students/roll/:rollNumber
// @access  Private
export const getStudentByRollNumber = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber });
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Update student's own profile (CGPA, Backlogs)
// @route   PUT /api/students/my-profile
// @access  Private
export const updateMyProfile = async (req, res) => {
  const { cgpa, activeBacklogs } = req.body;
  
  try {
    // Find the student record associated with the logged-in user's roll number
    let student = await Student.findOne({ rollNumber: req.user.rollNumber });
    
    // If student record doesn't exist yet, create a shell for them
    if (!student) {
      student = new Student({
        name: req.user.name,
        email: req.user.email,
        rollNumber: req.user.rollNumber,
        course: 'Not Assigned',
        cgpa: cgpa || 0,
        activeBacklogs: activeBacklogs || 0
      });
    } else {
      if (cgpa !== undefined) student.cgpa = cgpa;
      if (activeBacklogs !== undefined) student.activeBacklogs = activeBacklogs;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res) => {
  const { name, email, rollNumber, course, cgpa, activeBacklogs } = req.body;

  try {
    const studentExists = await Student.findOne({ email });
    const rollExists = await Student.findOne({ rollNumber });

    if (studentExists) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }
    if (rollExists) {
      return res.status(400).json({ message: 'Student with this roll number already exists' });
    }

    const student = new Student({
      name,
      email,
      rollNumber,
      course,
      cgpa: cgpa || 0,
      activeBacklogs: activeBacklogs || 0,
    });

    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  const { name, email, rollNumber, course, cgpa, activeBacklogs } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      const oldEmail = student.email;
      const oldRollNumber = student.rollNumber;

      student.name = name || student.name;
      student.email = email || student.email;
      student.rollNumber = rollNumber || student.rollNumber;
      student.course = course || student.course;
      student.cgpa = cgpa !== undefined ? cgpa : student.cgpa;
      student.activeBacklogs = activeBacklogs !== undefined ? activeBacklogs : student.activeBacklogs;

      const updatedStudent = await student.save();

      // Find and update corresponding User credential document
      const user = await User.findOne({
        $or: [
          { email: oldEmail },
          { rollNumber: oldRollNumber }
        ]
      });

      if (user) {
        user.name = student.name;
        user.email = student.email;
        user.rollNumber = student.rollNumber;
        await user.save();
      }

      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      await Student.deleteOne({ _id: student._id });
      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
