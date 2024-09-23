import express from 'express';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';
import { Student } from '../models/student.mjs';
import { Lecturer } from '../models/lecturers.mjs';
import logger from '../config/logger.mjs';

const router = express.Router();

router.use(express.json());

router.get('/', async function(req, res){
    try {
        // Find all lecturer documents
        const courses = await Course.find({});
    
        if (courses.length === 0) {
            logger.info(`No courses found in database`);
            return res.status(404).send('No course found');
        }
    
        logger.info(`Courses loaded successfully`);
        res.status(200).json(courses);
    } catch (err) {
        logger.warn(`Error during courses loading: ${err}`);
        res.status(500).send('Error fetching courses details');
    }
});

router.get('/:courseCode', async function(req, res){
    try {
        // Find all lecturer documents
        const courseCode = req.params.courseCode;
        
        const course = await Course.findOne({ courseCode: courseCode});
        if (!course) {
            logger.warn(`${courseCode} not found in database`);
            return res.status(404).send('Course not found');
        }
    
        logger.info(`Course loaded successfully`);
        res.status(200).json(course);
    } catch (err) {
        logger.warn(`Error during course loading: ${err}`);
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

        logger.info(`Course: ${courseName} successfully created`);
        res.status(201).send('Course created successfully');
    } catch (err) {
        logger.warn(`Error during course creation: ${err}`);
        res.status(500).send('Error creating course');
    }
});

router.delete('/delete/:courseCode', async function(req, res){
    const courseCode = req.params.courseCode;

    try {
        const course = await Course.findOneAndDelete({ courseCode });

        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        logger.info(`Course: ${courseCode} successfully deleted`);
        res.status(200).send('Course deleted successfully.');
    } 
    catch (error) {
        logger.warn(`Error during course deletion: ${err}`);
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
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        course.courseCode = Code;
        course.courseName = Name;
        course.description = desc;
        
        await course.save();

        logger.info(`Course: ${courseCode} successfully updated`);
        res.status(200).send({ message: 'Course updated successfully.' });
    } 
    catch (error) {
        logger.warn(`Error during course update: ${err}`);
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
            logger.warn(`Failed retrieving info for user. User does not exist`);
            return res.status(404).send('User not found.');
        }
        else if (!user.role === 'lecturer')
        {
            logger.warn(`User is not a lecturer.`);
            res.status(500).send('User is not a lecturer');
        }

        const lecturer = await Lecturer.findOne({user: user});
        if (!lecturer)
        {
            logger.warn(`Failed retrieving info for user. User is not a lecturer`);
            return res.status(404).send('Lecturer not found.');
        }

        const course = await Course.findOne({ courseCode: courseCode });
        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        const isCourseAlreadyAdded = lecturer.coursesTaught.includes(course._id);

        if (isCourseAlreadyAdded) {
            logger.info(`Lecturer is already teaching course.`);
            return res.status(400).send('Course already exists in courses taught.');
        }

        lecturer.coursesTaught.push(course._id);
        await lecturer.save();
    
        logger.info(`Course ${courseCode} added to course taught for lecturer: ${username}.`);
        res.status(200).send('Course added successfully to courses taught.');
    }
    catch (err)
    {
        logger.warn(`Error adding course to lecturer: ${err}`);
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
            logger.warn(`Failed retrieving info for user. User does not exist`);
            return res.status(404).send('User not found.');
        }
        else if (!user.role === 'student')
        {
            logger.warn(`User is not a student.`);
            res.status(500).send('User is not a student');
        }

        const student = await Student.findOne({user: user});
        if (!student)
        {
            logger.warn(`Failed retrieving info for user. User is not a student`);
            return res.status(404).send('Student not found.');
        }

        const course = await Course.findOne({ courseCode: courseCode });
        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        const isCourseAlreadyAdded = student.coursesEnrolled.includes(course._id);

        if (isCourseAlreadyAdded) {
            logger.info(`Student is already enrolled in course.`);
            return res.status(400).send('Course already exists in courses enrolled.');
        }

        student.coursesEnrolled.push(course._id);
        await student.save();
    
        logger.info(`Course ${courseCode} added to course enrolled for student: ${username}.`);
        res.status(200).send('Course added successfully to courses enrolled.');
    }
    catch (err)
    {
        logger.warn(`Error adding course to lecturer: ${err}`);
        res.status(500).send('Error adding course.');
    }
});

export default router;