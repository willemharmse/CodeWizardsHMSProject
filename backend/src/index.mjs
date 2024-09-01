import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import authRoute from './routes/auth.mjs';
import userRoute from './routes/user.mjs';
import fileRoute from '../src/routes/file.mjs';

dotenv.config();
const app = express();

app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/file', fileRoute);
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})