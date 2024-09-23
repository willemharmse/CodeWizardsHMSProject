import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import index from '../src/routes/index.mjs';
import { logRequests } from '../src/middleware/logRequests.mjs';
import { logErrors } from '../src/middleware/logErrors.mjs';

dotenv.config();
const app = express();
app.use(express.json());

app.use(logRequests);

app.use('', index);

app.use(logErrors);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})