import express from 'express';
import userRoute from '../routes/user.mjs';
import fileRoute from '../routes/files.mjs';
import subRoute from '../routes/submission.mjs';
import assignRoute from '../routes/assignment.mjs';
import courseRoute from '../routes/course.mjs';
import markRoute from '../routes/getMarks.mjs';

const router = express();

router.use('/api/user', userRoute);
router.use('/api/file', fileRoute);
router.use('/api/submission', subRoute);
router.use('/api/assignment', assignRoute);
router.use('/api/course', courseRoute);
router.use('/api/grades', markRoute);

export default router;