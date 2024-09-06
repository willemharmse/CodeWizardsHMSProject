import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import authRoute from './routes/auth.mjs';
import userRoute from './routes/user.mjs';
import fileRoute from '../src/routes/files.mjs';
import subRoute from '../src/routes/submission.mjs';
import assignRoute from '../src/routes/assignment.mjs';

dotenv.config();
const app = express();

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/file', fileRoute);
app.use('/api/submission', subRoute);
app.use('/api/assignment', assignRoute);
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})