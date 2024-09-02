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

router.put('/update/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const { assignment, student, fileURL, submittedAt, grade, feedback, compressed, compressionDetails } = req.body;
        
        // Find the submission by id
        const submission = await Submission.findOne({ id });

        if (!submission) {
            return res.status(404).send('Submission not found');
        }

        id.assignment = assignment || id.assignment;
        id.student = student || id.status;
        id.fileURL = fileURL || id.fileURL;
        id.submittedAt = submittedAt || id.submittedAt;
        id.grade = grade || id.grade;
        id.feedback = feedback || id.feedback;
        id.compressed = compressed || id.compressed;
        id.compressionDetails = compressionDetails || id.compressionDetails;
        await Submission.save();

        res.status(200).send('Submission updated successfully');
    }
    catch (err){
        res.status(500).send('Error during update');
    }
});

router.delete('/delete/:id', async function(req, res) {
    const id = req.params.id;

    try {
        const submission = await Submission.findOneAndDelete({ id });

        if (!user) {
            return res.status(404).send('Submission not found');
        }

        res.status(200).send('Submission deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting submission');
    }
});

export default router;