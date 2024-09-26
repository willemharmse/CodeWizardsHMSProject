import express from 'express';
import userRoute from '../routes/user.mjs';
import fileRoute from '../routes/files.mjs';
import subRoute from '../routes/submission.mjs';
import assignRoute from '../routes/assignment.mjs';
import courseRoute from '../routes/course.mjs';
import markRoute from '../routes/getMarks.mjs';

const router = express();

router.use('/user', userRoute);
router.use('/file', fileRoute);
router.use('/submission', subRoute);
router.use('/assignment', assignRoute);
router.use('/course', courseRoute);
router.use('/grades', markRoute);

export default router;