import express from 'express';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';
import { Student } from '../models/student.mjs';
import { Lecturer } from '../models/lecturers.mjs';

const router = express.Router();

router.use(express.json());

router.get('/', async function(req, res){
    try {
        // Find all lecturer documents
        const courses = await Course.find({});
    
        if (courses.length === 0) {
            return res.status(404).send('No course found');
        }
    
        res.status(200).json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching courses details');
    }
});

router.post('/create', async function(req, res) {
    try {
        const { courseName, courseCode, description } = req.body;

        const course = new Course({
            courseName: courseName,
            courseCode: courseCode,
            description: description
        });

        await course.save();

        res.status(201).send('Course created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating course');
    }
});

router.delete('/delete/:courseCode', async function(req, res){
    const courseCode = req.params.courseCode;

    try {
        const course = await Course.findOneAndDelete({ courseCode });

        if (!course) {
            return res.status(404).send('Course not found.');
        }

        res.status(200).send('Course deleted successfully.');
    } 
    catch (error) {
        console.log(error);
        res.status(500).send('Error deleting course.');
    }  
});

router.put('/update/:courseCode', async function(req, res) {
    const Code = req.params.courseCode;
    const Name = req.params.courseName;
    const desc = req.params.description; // The fields to update, sent in the request body

    try {
        const course = await Course.findOne({ courseCode });

        if (!course) {
            return res.status(404).send('Course not found.');
        }

        course.courseCode = Code;
        course.courseName = Name;
        course.description = desc;
        
        await course.save();

        res.status(200).send({ message: 'Course updated successfully.' });
    } 
    catch (error) {
        res.status(500).send('Error updating course.');
    }  
});

router.post('/lecturer/:username/:courseCode', async (req, res) => {
    const username = req.params.username;
    const courseCode = req.params.courseCode;

    try{
        const user = await User.findOne({ username: username});
        if (!user)
        {
            return res.status(404).send('User not found.');
        }
        else if (!user.role === 'lecturer')
        {
            res.status(500).send('User is not a lecturer');
        }

        const lecturer = await Lecturer.findOne({user: user});
        if (!lecturer)
        {
            return res.status(404).send('Lecturer not found.');
        }

        const course = await Course.findOne({ courseCode: courseCode });
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        const isCourseAlreadyAdded = lecturer.coursesTaught.includes(course._id);

        if (isCourseAlreadyAdded) {
            return res.status(400).send('Course already exists in courses taught.');
        }

        lecturer.coursesTaught.push(course._id);
        await lecturer.save();
    
        res.status(200).send('Course added successfully to courses taught.');
    }
    catch (err)
    {
        res.status(500).send('Error adding course.');
    }
});

router.post('/student/:username/:courseCode', async (req, res) => {
    const username = req.params.username;
    const courseCode = req.params.courseCode;

    try{
        const user = await User.findOne({ username: username});
        if (!user)
        {
            return res.status(404).send('User not found.');
        }
        else if (!user.role === 'student')
        {
            res.status(500).send('User is not a student');
        }

        const student = await Student.findOne({user: user});
        if (!student)
        {
            return res.status(404).send('Student not found.');
        }

        const course = await Course.findOne({ courseCode: courseCode });
        if (!course) {
            return res.status(404).send('Course not found.');
        }

        const isCourseAlreadyAdded = student.coursesEnrolled.includes(course._id);

        if (isCourseAlreadyAdded) {
            return res.status(400).send('Course already exists in courses enrolled.');
        }

        student.coursesEnrolled.push(course._id);
        await student.save();
    
        res.status(200).send('Course added successfully to courses enrolled.');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Error adding course.');
    }
});

export default router;