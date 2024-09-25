import express from 'express';
import db from './db.mjs';
import dotenv from 'dotenv';
import cors from 'cors';
import index from '../src/routes/index.mjs';
import { logRequests } from '../src/middleware/logRequests.mjs';
import { logErrors } from '../src/middleware/logErrors.mjs';
import statusMonitor from 'express-status-monitor';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(statusMonitor());

app.get('/status', statusMonitor().pageRoute);

app.use(logRequests);

app.use('/api', index);

app.use(logErrors);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
})