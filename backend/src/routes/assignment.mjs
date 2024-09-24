import express from 'express';
import { Assignment } from '../models/assignments.mjs'; 
import logger from '../config/logger.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';
import restrictUser from '../middleware/restrictUser.mjs';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';
import { Lecturer } from '../models/lecturers.mjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.use(express.json());

router.get('/course/:courseCode', async function(req, res){
    try{
        const courseCode = req.params.courseCode;
        const course = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!course) {
            logger.warn(`${courseCode} not found`);
            return res.status(404).send('Course not found');
        }

        const assignment = await Assignment.find({course: course});

        if (assignment.length === 0){
            logger.info(`Assignments for ${courseCode} not found`);
            return res.status(404).send("No assignments found");
        }

        logger.info(`Assignments for ${courseCode} successfully returned`);
        return res.status(200).send(assignment);
    }catch(err){
        logger.warn(`Error occured during retrieval of assignments: ${err}`);
        res.status(500).send("Something went wrong");
    }
});

router.get('/:assignCode', async function(req, res){
    try{
        const assignCode = req.params.assignCode;

        const assignment = await Assignment.findOne({assignCode: assignCode});

        if (!assignment){
            logger.warn(`Assignment for ${assignCode} not found`);
            return res.status(404).send("No assignments found");
        }

        logger.info(`Assignment for ${assignCode} successfully found`);
        res.status(200).send(assignment);
    }catch(err){
        logger.warn(`Error occured during retrieval of assignment: ${err}`);
        res.status(500).send("Something went wrong");
    }
});

router.post('/create', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    try {
        const { title, description, dueDate, courseCode, mark } = req.body;
        const userID = req.user.userId;

        const course = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!course) {
            logger.warn(`${courseCode} not found`);
            return res.status(404).send('Course not found');
        }

        const user = await User.findOne({ _id: userID});
        if (!user)
        {
            logger.warn(`Failed retrieving info for user. User does not exist`);
            return res.status(404).send('User not found.');
        }

        if (mark < 0 || mark > 250)
        {
            logger.warn(`Mark entered is out of bounds.`);
            return res.status(400).send('Mark value is out of bounds');
        }

        if (user.role === 'lecturer')
        {
            const lecturer = await Lecturer.findOne({user: user._id});
            if (!lecturer)
            {
                logger.warn(`User is not a lecturer.`);
                return res.status(404).send('Lecturer not found.');
            }

            if (lecturer.coursesTaught.includes(course._id))
            {
                const assignmentCount = await Assignment.countDocuments({ course: course });
                const assignCode = `${course.courseCode}-${assignmentCount + 1}`;

                const newAssignment = new Assignment({
                    title,
                    description,
                    dueDate,
                    course: course,
                    assignCode,
                    mark
                });

                await newAssignment.save();

                logger.info(`Assignment created for ${coures.courseCode} by ${user.role}: ${user.username}.`);
                res.status(201).send('Assignment created successfully');
            }
            else
            {
                logger.warn(`User is not a lecturer for ${coures.courseCode}.`);
                res.status(404).send('Lecturer not found as a course lecturer');
            }
        }
        else if (user.role === 'admin')
        {
            const assignmentCount = await Assignment.countDocuments({ course: course });
            const assignCode = `${course.courseCode}-${assignmentCount + 1}`;

            const newAssignment = new Assignment({
                title,
                description,
                dueDate,
                course: course,
                assignCode,
                mark
            });

            await newAssignment.save();

            logger.info(`Assignment created for ${coures.courseCode} by ${user.role}: ${user.username}.`);
            res.status(201).send('Assignment created successfully');
        }
    } catch (err) {
        logger.warn(`Error occured during creation of assignment: ${err}`);
        res.status(500).send('Error creating assignment');
    }
});

router.delete('/delete/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const assignCode = req.params.assignCode;

    try {
        const assignment = await Assignment.findOne({ assignCode: assignCode });

        if (!assignment) {
            logger.warn(`Assignment for ${assignCode} not found`);
            return res.status(404).send('Assignment not found.');
        }

        const submissions = await Submission.find({assignment: assignment._id});
        for (const submission of submissions)
        {
            const file = await File.findOne({_id: { $in: submission.file._id }});

            await deleteFromAzure(file.fileName);
            await File.findByIdAndDelete(file._id);
            await Submission.findByIdAndDelete(submission._id);
        }

        await Assignment.findByIdAndDelete(assignment._id);

        logger.info(`Assignment ${assignCode} deleted.`);
        res.status(200).send('Assignment deleted successfully.');
    } 
    catch (err) {
        logger.warn(`Error occured during deletion of assignment: ${err}`);
        res.status(500).send('Error deleting assignment.');
    }  
});

router.put('/update/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const assignCode = req.params.assignCode;
    const title = req.body.title;
    const description = req.body.description;
    const dueDate = req.body.dueDate;
    const mark = req.body.mark;

    try {
        if (mark < 0 || mark > 250)
        {
            logger.warn(`Mark entered is out of bounds.`);
            return res.status(400).send('Mark value is out of bounds');
        }
    
        const assignment = await Assignment.findOne({ assignCode: assignCode });

        if (!assignment) {
            logger.warn(`Assignment for ${assignCode} not found`);
            return res.status(404).send('Assignment not found.');
        }

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.mark = mark || assignment.mark;

        await assignment.save();

        logger.info(`Assignment ${assignCode} updated successfully.`);
        res.status(200).send({ message: 'Assignment updated successfully.' });
    } 
    catch (err) {
        logger.warn(`Error occured during update of assignment: ${err}`);
        res.status(500).send('Error updating assignment.');
    }  
});

export default router;