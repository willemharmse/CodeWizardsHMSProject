import express from 'express';
import { Submission } from '../models/submission.mjs';
import { Assignment } from '../models/assignments.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';
import restrictUser from '../middleware/restrictUser.mjs';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';

const router = express.Router();
router.use(express.json());

router.get('/:assignCode', async (req, res) => { 
    try{
        const assignCode = req.params.assignCode;

        const assignment = await Assignment.findOne({ assignCode: assignCode });
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
    const {assignCode, grade, feedback, file} = req.body;

    try 
    {
        const userID = req.user.userId;

        const assignment = await Assignment.findOne({ assignCode: assignCode }); // Find assignment by title or any other field
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
});

router.put('/grade/:username/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async (req, res) =>{
    try{
        const username = req.params.username;
        const grade = req.body.grade;

        const user = await User.findOne({ username: username});
        if (!user)
        {
            return res.status(404).send('User not found');
        }

        const assignCode = req.params.assignCode;
        
        const assignment = await Assignment.findOne({ assignCode: assignCode });
        if (!assignment)
        {
            return res.status(404).send('Assignment not found');
        }

        const submission = await Submission.findOne({ user: user._id, assignment: assignment._id});
        if (!submission)
        {
            return res.status(404).send('Submission does not exist');
        }

        submission.grade = grade;
        await submission.save();

        return res.status(200).send('Submission graded successfully');
    }
    catch (err)
    {
        res.status(500).send('There was an error with the grading');
        console.log(err);
    }
});

router.delete('/delete/:id', async function(req, res) {
    const id = req.params.id;

    try {
        const submission = await Submission.findOneAndDelete({ id });

        if (!submission) {
            return res.status(404).send('Submission not found');
        }

        res.status(200).send('Submission deleted successfully');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting submission');
    }
});

export default router;