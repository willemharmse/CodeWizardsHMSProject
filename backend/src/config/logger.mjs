import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Write logs to a file in the src folder
        new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'app.log'), level: 'info' }),
        // Write error logs to a separate file
        new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
        // Log to the console
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

// Ensure logs folder exists
import fs from 'fs';

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

export default logger;
