import express from 'express';
import { Submission } from '../models/submission.mjs';
import { Assignment } from '../models/assignments.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';
import { Course } from '../models/courses.mjs';

const router = express.Router();
router.use(express.json());

router.get('/:courseCode/:title', async (req, res) => { 
    try{
        const courseCode = req.params.courseCode;

        const crs = await Course.findOne({ courseCode: courseCode }); // Find assignment by title or any other field
        if (!crs) {
            return res.status(404).send('Course not found');
        }

        const title = req.params.title;

        const assignment = await Assignment.findOne({ course: crs, title: title});
        if (!assignment){
            return res.status(404).send('Assignment not found');
        }

        const submissions = await Submission.find({ assignment: assignment });
    
        if (submissions.length === 0) {
            return res.status(404).send('No submissions found');
        }
    
        res.status(200).json(submissions);
    }
    catch (err){
        res.status(500).send("Error retrieving submissions");
        console.log(err);
    }
});

router.post('/submit', verifyToken, async (req, res) =>{
    const {title, grade, feedback, file} = req.body;

    try 
    {
        const userID = req.user.userId;

        const assignment = await Assignment.findOne({ title: title }); // Find assignment by title or any other field
        if (!assignment) {
            return res.status(404).send('Assignment not found');
        }

        const newSubmission = new Submission({
            user: userID,
            grade, 
            feedback, 
            file,
            assignment: assignment._id 
        });


        await newSubmission.save();
        
        res.status(200).send({ message: 'Successful submission', ID: userID });
    }catch (err){
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