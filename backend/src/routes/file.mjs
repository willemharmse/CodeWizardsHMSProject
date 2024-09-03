import express from 'express';
import multer from 'multer';
import { compressVideo } from '../middleware/compressVideo.mjs';
import { File } from '../models/file.mjs';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config();

router.use(express.json());

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const { filename: tempFilename, path: tempFilePath } = req.file;

        const originalFilename = req.file.originalname;
        const compressedPath = `uploads/compressed_${originalFilename}`;

        // Compress the video file
        await compressVideo(tempFilePath, compressedPath);

        // Upload compressed file to Nextcloud
        const fileStream = fs.createReadStream(compressedPath);
        await axios.put(`http://192.168.0.25/8070/remote.php/webdav/${originalFilename}`, fileStream, {
            auth: {
                username: process.env.NXT_User,
                password: process.env.NXT_Pass
            },
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        // Clean up the temporary files
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(compressedPath);

        res.status(200).send('File uploaded and compressed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading or compressing file');
    }
});

export default router;