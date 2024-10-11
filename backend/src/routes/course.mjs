import express from 'express';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';
import { Student } from '../models/student.mjs';
import { Lecturer } from '../models/lecturers.mjs';
import { Assignment } from '../models/assignments.mjs';
import { Submission } from '../models/submission.mjs';
import { File } from '../models/file.mjs';
import { deleteFromAzure } from '../config/azureStorage.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs'
import restrictUser from '../middleware/restrictUser.mjs';
import logger from '../config/logger.mjs';

const router = express.Router();

router.use(express.json());

router.get('/', verifyToken, async function(req, res){
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
        logger.error(`Error during courses loading: ${err}`);
        res.status(500).send('Error fetching courses details');
    }
});

router.get('/:courseCode', verifyToken, async function(req, res){
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
        logger.error(`Error during course loading: ${err}`);
        res.status(500).send('Error fetching courses details');
    }
});

router.get('/courses/lecturer', verifyToken, restrictUser(['lecturer']), async function(req, res){
    try {
        const userID = req.user.userId;
    
        // Find the lecturer and populate the courses they teach
        const lecturer = await Lecturer.findOne({ user: userID })
                                       .populate('coursesTaught');
    
        if (!lecturer) {
            logger.warn(`User not found in database`);
            return res.status(404).send('No courses found');   
        }
    
        // Extract the coursesTaught from the lecturer object
        const courses = lecturer.coursesTaught;
    
        if (!courses || courses.length === 0) {
            logger.warn(`No courses assigned to lecturer`);
            return res.status(404).send('No courses found');
        }
    
        logger.info(`Courses loaded successfully`);
        res.status(200).json(courses);  // Return only the courses taught by the lecturer
    } catch (err) {
        logger.error(`Error during course loading: ${err}`);
        res.status(500).send('Error fetching course details');
    }    
});

router.get('/courses/student', verifyToken, restrictUser(['student', 'admin']), async function(req, res){
    try {
        const userID = req.user.userId;

        const user = await User.findOne({_id: userID});

        if (user.role === 'student')
        {
            // Find the lecturer and populate the courses they teach
            const student = await Student.findOne({ user: userID })
                                        .populate('coursesEnrolled');
        
            if (!student) {
                logger.warn(`User not found in database`);
                return res.status(404).send('No courses found');   
            }
        
            // Extract the coursesTaught from the lecturer object
            const courses = student.coursesEnrolled;
        
            if (!courses || courses.length === 0) {
                logger.warn(`No courses assigned to lecturer`);
                return res.status(404).send('No courses found');
            }
        
            logger.info(`Courses loaded successfully`);
            res.status(200).json(courses);  // Return only the courses taught by the lecturer
        }
        else if (user.role === 'admin')
        {
            const courses = await Course.find({});
        
            if (courses.length === 0) {
                logger.info(`No courses found in database`);
                return res.status(404).send('No course found');
            }
        
            logger.info(`Courses loaded successfully`);
            res.status(200).json(courses);
        }
    } catch (err) {
        logger.error(`Error during course loading: ${err}`);
        res.status(500).send('Error fetching course details');
    } 
});

router.post('/create', verifyToken, restrictUser(['admin']), async function(req, res) {
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
        logger.error(`Error during course creation: ${err}`);
        res.status(500).send('Error creating course');
    }
});

router.delete('/delete/:courseCode', verifyToken, restrictUser(['admin']), async function(req, res){
    const courseCode = req.params.courseCode;

    try {
        const course = await Course.findOne({ courseCode });

        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        const assignments = await Assignment.find({course: course._id});
        for (const assignment of assignments){
            const submissions = await Submission.find({assignment: assignment._id});
            for (const submission of submissions)
            {
                const file = await File.findOne({_id: { $in: submission.file._id }});

                await deleteFromAzure(file.fileName);
                await File.findByIdAndDelete(file._id);
                await Submission.findByIdAndDelete(submission._id);
            }

            await Assignment.findByIdAndDelete(assignment._id);
        }

        await Student.updateMany({ coursesEnrolled: course._id }, { $pull: { coursesEnrolled: course._id } });
        await Lecturer.updateMany({ coursesTaught: course._id }, { $pull: { coursesTaught: course._id } });

        await Course.findByIdAndDelete(course._id);

        logger.info(`Course: ${courseCode} successfully deleted`);
        res.status(200).send('Course deleted successfully.');
    } 
    catch (err) {
        logger.error(`Error during course deletion: ${err}`);
        res.status(500).send('Error deleting course.');
    }  
});

router.put('/update/:courseCode', verifyToken, restrictUser(['admin']), async function(req, res) {
    const Code = req.params.courseCode;
    const newCode = req.body.courseCode;
    const Name = req.body.courseName;
    const desc = req.body.description; // The fields to update, sent in the request body

    try {
        const course = await Course.findOne({ courseCode: Code });

        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        course.courseCode = newCode || course.courseCode;
        course.courseName = Name || course.courseName;
        course.description = desc || course.description;
        
        await course.save();

        logger.info(`Course: ${Code} successfully updated`);
        res.status(200).send({ message: 'Course updated successfully.' });
    } 
    catch (err) {
        logger.error(`Error during course update: ${err}`);
        res.status(500).send('Error updating course.');
    }  
});

router.post('/lecturer/:username/:courseCode', verifyToken, restrictUser(['admin']), async (req, res) => {
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
            res.status(400).send('User is not a lecturer');
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
        logger.error(`Error adding course to lecturer: ${err}`);
        res.status(500).send('Error adding course.');
    }
});

router.post('/student/:username/:courseCode', verifyToken, restrictUser(['admin']), async (req, res) => {
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
            res.status(400).send('User is not a student');
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
        logger.error(`Error adding course to lecturer: ${err}`);
        res.status(500).send('Error adding course.');
    }
});

router.delete('/remove/:username/:courseCode', verifyToken, restrictUser(['admin']), async (req, res) => {
    const username = req.params.username;
    const courseCode = req.params.courseCode;

    try{
        const user = await User.findOne({ username: username});
        if (!user)
        {
            logger.warn(`Failed retrieving info for user. User does not exist`);
            return res.status(404).send('User not found.');
        }

        const course = await Course.findOne({ courseCode: courseCode });
        if (!course) {
            logger.warn(`Course not found in database`);
            return res.status(404).send('Course not found.');
        }

        if (user.role === 'student')
        {
            const student = await Student.findOne({user: user});
            if (!student)
            {
                logger.warn(`Failed retrieving info for user. User is not a student`);
                return res.status(404).send('Student not found.');
            }

            await student.coursesEnrolled.pull(course._id);
            await student.save();

            logger.info(`Course ${courseCode} removed from course enrolled for student: ${username}.`);
            res.status(200).send('Course removed successfully from courses enrolled.');
        }
        else if (user.role === 'lecturer')
        {
            const lecturer = await Lecturer.findOne({user: user});
            if (!lecturer)
            {
                logger.warn(`Failed retrieving info for user. User is not a lecturer`);
                return res.status(404).send('Lecturer not found.');
            }

            await lecturer.coursesTaught.pull(course._id);
            await lecturer.save();

            logger.info(`Course ${courseCode} removed from course taught for lecturer: ${username}.`);
            res.status(200).send('Course removed successfully from courses taught.');
        }
        else {
            logger.info(`Course could not be removed from user.`);
            res.status(200).send('Failed to remove course.');
        }
    }
    catch (err)
    {
        logger.error(`Error removing course: ${err}`);
        res.status(500).send('Error removing course.');
    }
});

export default router;