import express from 'express';
import { Submission } from '../models/submission.mjs';
import { Assignment } from '../models/assignments.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';
import restrictUser from '../middleware/restrictUser.mjs';
import { Course } from '../models/courses.mjs';
import { User } from '../models/users.mjs';
import { Student } from '../models/student.mjs';

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

router.post('/submit', verifyToken, restrictUser(['admin','student']), async (req, res) =>{
    const {assignCode, grade, feedback, file} = req.body;

    try 
    {
        const userID = req.user.userId;

        const assignment = await Assignment.findOne({ assignCode: assignCode }); // Find assignment by title or any other field
        if (!assignment) {
            return res.status(404).send('Assignment not found');
        }

        const user = await User.findOne({_id: userID});
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.role === 'student')
        {
            const student = await Student.findOne({user: userID});
            if (!student) {
                return res.status(404).send('Student not found');
            }

            if (student.coursesEnrolled.includes(assignment.course))
            {
                const newSubmission = new Submission({
                    user: userID,
                    grade: null, 
                    feedback: null, 
                    file,
                    assignment: assignment._id 
                });

                await newSubmission.save();
                
                res.status(200).send({ message: 'Successful submission'});
            }
            else
            {
                return res.status(400).send('Student not enrolled in this course');
            }
        }
        else if (user.role === 'admin')
        {
            const newSubmission = new Submission({
                user: userID,
                grade: null, 
                feedback: null, 
                file,
                assignment: assignment._id 
            });

            await newSubmission.save();
            
            res.status(200).send({ message: 'Successful submission'});
        }
    }catch (err){
        res.status(500).send('There was an error with the submission');
    }
});

router.put('/grade/:username/:assignCode', verifyToken, restrictUser(['admin','lecturer']), async (req, res) =>{
    try{
        const username = req.params.username;
        const grade = req.body.grade;
        const feedback = req.body.feedback;

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

        if (grade < 0 || grade > assignment.mark)
        {
            return res.status(400).send('The grade given to the submission is out of bounds')
        }
        
        submission.grade = grade;
        submission.feedback = feedback;
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