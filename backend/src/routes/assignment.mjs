import express from 'express';
import { Assignment } from '../models/assignments.mjs'; 
import { Student } from '../models/student.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs'
import restrictUser from '../middleware/restrictUser.mjs'
import { Course } from '../models/courses.mjs'
import jwt from 'jsonwebtoken';

const router = express.Router();

router.use(express.json());

router.get('/:courseCode', async function(req, res){
    try{
        const courseCode = req.params.courseCode;
        const course = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!course) {
            return res.status(404).send('Course not found');
        }

        const assignment = await assignment.find({course: course});

        if (assignment.length === 0){
            return res.status(404).send("No assignments found");
        }
    }catch(err){
        res.status(500).send("Something went wrong");
    }
});

router.post('/create', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    try {
        const { title, description, dueDate, courseCode } = req.body;

        const course = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!course) {
            return res.status(404).send('Course not found');
        }

        const assignmentCount = await Assignment.countDocuments({ course: course });
        const assignCode = `${course.courseCode}-${assignmentCount + 1}`;

        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            course: course,
            assignCode
        });

        await newAssignment.save();

        res.status(201).send('Assignment created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating assignment');
    }
});

router.delete('/delete/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const assignCode = req.params.assignCode;

    try {
        const assignment = await Assignment.findOneAndDelete({ assignCode: assignCode });

        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        res.status(200).send('Assignment deleted successfully.');
    } 
    catch (error) {
        console.log(error);
        res.status(500).send('Error deleting assignment.');
    }  
});

router.put('/update/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const assignCode = req.params.assignCode;
    const updates = req.body; // The fields to update, sent in the request body

    try {
        const assignment = await Assignment.findOneAndUpdate({ assignCode: assignCode }, updates, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updates against the schema
        });

        if (!assignment) {
            return res.status(404).send('Assignment not found.');
        }

        res.status(200).send({ message: 'Assignment updated successfully.', assignment });
    } 
    catch (error) {
        console.log(error);
        res.status(500).send('Error updating assignment.');
    }  
});

export default router;