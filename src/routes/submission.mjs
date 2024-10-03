import express from 'express';
import logger from '../config/logger.mjs';
import { Submission } from '../models/submission.mjs';
import { Assignment } from '../models/assignments.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';
import restrictUser from '../middleware/restrictUser.mjs';
import { upload } from '../middleware/fileUpload.mjs';
import { compressVideo } from '../middleware/compressVideo.mjs';
import { uploadToAzure } from '../config/azureStorage.mjs';
import { File } from '../models/file.mjs';
import fs from 'fs';
import { User } from '../models/users.mjs';
import { Student } from '../models/student.mjs';

const router = express.Router();
router.use(express.json());

router.get('/assignment/:assignCode', verifyToken, async (req, res) => { 
    try{
        const assignCode = req.params.assignCode;

        const assignment = await Assignment.findOne({ assignCode: assignCode });
        if (!assignment){
            logger.warn(`Failed retrieving info for ${assignCode}. Assignment does not exist`);
            return res.status(404).send('Assignment not found');
        }

        const submissions = await Submission.find({ assignment: assignment })
                                            .populate('user');
    
        if (submissions.length === 0) {
            logger.info(`No assignments found for ${assignCode}`);
            return res.status(404).send('No submissions found');
        }
    
        logger.info(`Assignments found for ${assignCode} successfully loaded`);
        res.status(200).json(submissions);
    }
    catch (err){
        logger.error(`Error during submission retrieval: ${err}`);
        res.status(500).send("Error retrieving submissions");
    }
});

router.get('/:username/:assignCode', verifyToken, async (req, res) => { 
    try{
        const assignCode = req.params.assignCode;
        const username = req.params.username;

        const assignment = await Assignment.findOne({ assignCode: assignCode });
        if (!assignment){
            logger.warn(`Failed retrieving info for ${assignCode}. Assignment does not exist`);
            return res.status(404).send('Assignment not found');
        }

        const user = await User.findOne({ username: username });
        if (!user){
            logger.warn(`Failed retrieving info for ${username}. User does not exist`);
            return res.status(404).send('Assignment not found');
        }
        else if (user.role === 'lecturer')
        {
            logger.warn(`User is a lecturer and cannot have submissions`);
            return res.status(400).send('Lecturer cannot make a submission');
        }

        const submissions = await Submission.find({ assignment: assignment, user: user });
    
        if (submissions.length === 0) {
            logger.info(`No assignments found for user: ${username} for assignment: ${assignCode}`);
            return res.status(404).send('No submissions found');
        }
    
        logger.info(`Assignments found for user: ${username} for assignment: ${assignCode} successfully loaded`);
        res.status(200).json(submissions);
    }
    catch (err){
        logger.error(`Error during submission retrieval: ${err}`);
        res.status(500).send("Error retrieving submissions");
    }
});

router.get('/:id', verifyToken, async (req, res) => { 
    try{
        const id = req.params.id;

        const submission = await Submission.findOne({ _id: id })
                                           .populate('assignment user');
    
        if (!submission) {
            logger.info(`Submission not found`);
            return res.status(404).send('No submissions found');
        }
    
        logger.info(`Submission found`);
        res.status(200).json(submission);
    }
    catch (err){
        logger.error(`Error during submission retrieval: ${err}`);
        res.status(500).send("Error retrieving submissions");
    }
});

router.post('/submit', upload.single('file'), verifyToken, restrictUser(['admin','student']), compressVideo, async (req, res) =>{
    const assignCode = req.body.assignCode;
    const filePath = req.file.path;
    const fileName = req.file.filename;
    
    try 
    {
        const userID = req.user.userId;

        const assignment = await Assignment.findOne({ assignCode: assignCode }); // Find assignment by title or any other field
        if (!assignment) {
            logger.warn(`Failed retrieving info for ${assignCode}. Assignment does not exist`);
            return res.status(404).send('Assignment not found');
        }

        const user = await User.findOne({_id: userID});
        if (!user) {
            logger.warn(`Failed retrieving info for user. User does not exist`);
            return res.status(404).send('User not found');
        }

        if (user.role === 'student')
        {
            const student = await Student.findOne({user: userID});
            if (!student) {
                logger.warn(`Failed retrieving info for student. Student info not found for student`);
                return res.status(404).send('Student not found');
            }

            if (!student.coursesEnrolled.includes(assignment.course))
            {
                logger.info(`${user.username} not enrolled in this course, and cannot submit.`);
                return res.status(400).send('Student not enrolled in this course');
            }
        }
    
        // Upload the compressed file to Azure
        const { blobName, url } = await uploadToAzure(filePath, fileName);
    
        // Save file info to MongoDB
        const newFile = new File({
            fileName: blobName,
            fileURL: url,
            uploadedByUserID: userID,
        });
        await newFile.save();
    
        // Remove the local file after successful upload
        try {
            fs.unlinkSync(filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            logger.warn(`Failed deleting the created file from ${user.username}'s local storage.`);
            res.status(500).send('Error during file deletion on local drive');
        }
    
        const newSubmission = new Submission({
            user: userID,
            grade: null, 
            feedback: null, 
            file: newFile._id,
            assignment: assignment._id 
        });

        await newSubmission.save();
        
        logger.info(`Submission for ${user.username} created for ${assignment.title}`);
        res.status(200).send({ message: 'Successful submission'});
    }catch (err){
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        logger.error(`Error during submission: ${err}`);

        res.status(500).send('There was an error with the submission');
    }
});

router.put('/grade/:id', verifyToken, restrictUser(['admin','lecturer']), async (req, res) =>{
    try{
        const subID = req.params.id;
        const grade = req.body.grade;
        const feedback = req.body.feedback;

        const submission = await Submission.findOne({ _id: subID})
                                            .populate('assignment');
        if (!submission)
        {
            logger.warn(`Failed retrieving info for submission. Submission does not exist`);
            return res.status(404).send('Submission does not exist');
        }

        if (grade < 0 || grade > submission.assignment.mark)
        {
            logger.warn(`Mark entered is out of bounds.`);
            return res.status(400).send('The grade given to the submission is out of bounds');
        }
        
        submission.grade = grade;
        submission.feedback = feedback;
        await submission.save();

        return res.status(200).send('Submission graded successfully');
    }
    catch (err)
    {
        logger.error(`Error during grading: ${err}`);
        res.status(500).send('There was an error with the grading');
    }
});

router.delete('/delete/:id', verifyToken, restrictUser(['admin, student']), async function(req, res) {
    const id = req.params.id;

    try {
        const submission = await Submission.findOne({ _id: id });

        if (!submission) {
            logger.warn(`Failed retrieving info for submission. Submission does not exist`);
            return res.status(404).send('Submission not found');
        }

        const file = await File.findOne({_id: { $in: submission.file._id }});

        await deleteFromAzure(file.fileName);
        await File.findByIdAndDelete(file._id);
        await Submission.findByIdAndDelete(submission._id);
        
        logger.info(`Submission for deleted successfully`);
        res.status(200).send('Submission deleted successfully');
    } catch (err) {
        logger.error(`Error during submission deletion: ${err}`);
        res.status(500).send('Error deleting submission');
    }
});

export default router;