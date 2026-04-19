const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructorId', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a course (Instructor only)
const createCourse = async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = new Course({
      title,
      description,
      instructorId: req.user._id,
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructorId', 'name')
      .populate('lessons');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add lesson (Instructor only)
const addLesson = async (req, res) => {
  const { title, videoUrl, content } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this course' });
    }
    
    const lesson = await Lesson.create({
      title, videoUrl, content, courseId: course._id
    });
    
    course.lessons.push(lesson._id);
    await course.save();
    
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enroll in course
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const enrollmentExists = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: course._id
    });
    
    if (enrollmentExists) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    
    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId: course._id
    });
    
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user enrollments
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id }).populate('courseId');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user progress
const updateProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: req.params.id
    });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    
    enrollment.progress = req.body.progress;
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Course (Instructor only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Course (Instructor only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    await Course.deleteOne({ _id: req.params.id });
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
  addLesson,
  enrollCourse,
  getMyEnrollments,
  updateProgress
};
