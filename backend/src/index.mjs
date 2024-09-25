import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import authRoute from './routes/auth.mjs';
import userRoute from './routes/user.mjs';
import fileRoute from '../src/routes/files.mjs';
import subRoute from '../src/routes/submission.mjs';
import assignRoute from '../src/routes/assignment.mjs';
import courseRoute from '../src/routes/course.mjs';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(statusMonitor());

app.get('/status', statusMonitor().pageRoute);

app.use(logRequests);

app.use('/api', index);

app.use(logErrors);

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/file', fileRoute);
app.use('/api/submission', subRoute);
app.use('/api/assignment', assignRoute);
app.use('/api/course', courseRoute);
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})