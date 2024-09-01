import express from 'express';
import { Submission } from '../models/submission.mjs';

const router = express.Router();
router.use(express.json());

router.get('/api/submission', (req, res) => { 
    res.send('No submission created yet');
});

router.post('/submit', async (req, res) =>{
    const {assignment, student, fileURL, submittedAt, grade, feedback, compressed, compressionDetails} = req.body;
    const newSubmission = new Submission({assignment, student, fileURL, submittedAt, grade, feedback, compressed, compressionDetails});
    try{
        await newSubmission.save();
        res.status(200).send('Successful submission');
    }catch (err){
        console.log(err);
        res.status(500).send('There was an error with the submission');
    }
})

export default router;