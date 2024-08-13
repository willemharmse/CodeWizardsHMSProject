import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})