import express from 'express';
import { Assignment } from '../models/assignments.mjs'; 
import { Student } from '../models/student.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs'
import restrictUser from '../middleware/restrictUser.mjs'
import { Course } from '../models/courses.mjs'
import jwt from 'jsonwebtoken';

const router = express.Router();

router.use(express.json());

router.get('/api/assignment', function(req, res){
    res.send('No Asssignments created yet');
});

router.post('/create', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    try {
        const { title, description, dueDate, courseCode } = req.body;

        const course = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!course) {
            return res.status(404).send('Course not found');
        }

        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            course: course
        });

        await newAssignment.save();

        res.status(201).send('Assignment created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating assignment');
    }
});

router.delete('/delete/:title', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const title = req.params.title;

    try {
        const assignment = await Assignment.findOneAndDelete({ title });

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

router.put('/update/:title', verifyToken, restrictUser(['admin','lecturer']), async function(req, res) {
    const title = req.params.title;
    const updates = req.body; // The fields to update, sent in the request body

    try {
        const assignment = await Assignment.findOneAndUpdate({ title }, updates, {
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