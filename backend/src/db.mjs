import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './config/logger.mjs';

dotenv.config();  // Load environment variables from .env file

const dbURI = process.env.DB_URI;

mongoose.connect(dbURI);

const db = mongoose.connection;

db.on('connected', () => {
  logger.info('Mongoose connected to ' + dbURI);
});

db.on('error', (err) => {
  logger.error('Mongoose connection error: ' + err);
});

db.on('disconnected', () => {
  logger.info('Mongoose disconnected');
});

process.on('SIGINT', () => {
  db.close(() => {
    logger.info('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

export default db;
