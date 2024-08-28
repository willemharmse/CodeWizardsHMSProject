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

export default router;