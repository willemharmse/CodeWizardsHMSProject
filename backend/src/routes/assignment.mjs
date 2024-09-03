import express from 'express';
import { Assignment } from '../models/assignments.mjs'; 
import { Student } from '../models/student.mjs';

const router = express.Router();

router.use(express.json());

router.get('/api/assignment', function(req, res){
    res.send('No Asssignments created yet');
});

router.post('/create', async function(req, res) {
    try {
        const { title, description, dueDate } = req.body;

        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
        });

        await newAssignment.save();

        res.status(201).send('Assignment created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating assignment');
    }
});

router.delete('/delete/:title', async function(req, res) {
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

router.put('/update/:title', async function(req, res) {
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