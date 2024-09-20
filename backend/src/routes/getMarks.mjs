import express from 'express';
import { Submission } from '../models/submission.mjs'; 
import { Assignment } from '../models/assignments.mjs'; 
import verifyToken from '../middleware/verifyJWTToken.mjs';
import restrictUser from '../middleware/restrictUser.mjs';
import { User } from '../models/users.mjs'; 
import xlsx from 'xlsx';

const router = express.Router();
router.use(express.json());

router.get('/:assignCode', verifyToken, restrictUser(['admin', 'lecturer']), async (req, res) => {
    try {
        const { assignCode } = req.params;

        const assignment = await Assignment.findOne({assignCode: assignCode});
        if (!assignment) {
            return res.status(404).send('Assignment not found');
        }

        const submissions = await Submission.find({ assignment: assignment._id })
            .populate({
                path: 'user', 
                select: 'username'}) // Populate the student to get user details
            .select('grade feedback'); // Select fields to include

        if (!submissions.length) {
            return res.status(404).send('No submissions found for this assignment');
        }

        // Prepare data for the Excel file
        const data = submissions.map(submission => ({
            Student: submission.user ? submission.user.username : 'Unknown', // Assuming the User model has a 'username' field
            Grade: submission.grade !== null ? submission.grade : 'Not graded',
            Feedback: submission.feedback !== "" ? submission.feedback : 'No feedback provided',
        }));

        // Create a new workbook and add the data
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Grades');

        // Create buffer from the workbook
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Send the file as a download
        res.setHeader('Content-Disposition', 'attachment; filename=grades.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating the Excel file');
    }
});

export default router;