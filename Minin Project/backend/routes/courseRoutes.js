const express = require('express');
const router = express.Router();
const { getCourses, createCourse, updateCourse, deleteCourse, getCourseById, addLesson, enrollCourse, getMyEnrollments, updateProgress } = require('../controllers/courseController');
const { protect, instructor } = require('../middleware/authMiddleware');

router.route('/').get(getCourses).post(protect, instructor, createCourse);
router.route('/enrollments/my').get(protect, getMyEnrollments);
router.route('/:id').get(protect, getCourseById).put(protect, instructor, updateCourse).delete(protect, instructor, deleteCourse);
router.route('/:id/lessons').post(protect, instructor, addLesson);
router.route('/:id/enroll').post(protect, enrollCourse);
router.route('/:id/progress').put(protect, updateProgress);

module.exports = router;
