import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
//import authRoute from './routes/auth.mjs';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})