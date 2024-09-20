import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import index from '../src/routes/index.mjs'

dotenv.config();
const app = express();

app.use('', index);
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})