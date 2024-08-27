import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

const dbURI = process.env.DB_URI;

mongoose.connect(dbURI);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

db.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});

db.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

export default db;
