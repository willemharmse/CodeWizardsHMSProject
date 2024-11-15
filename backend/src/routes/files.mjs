//Azure
import express from 'express';
import { upload } from '../middleware/fileUpload.mjs';
import { compressVideo } from '../middleware/compressVideo.mjs';
import { uploadToAzure, deleteFromAzure, downloadFromAzure } from '../config/azureStorage.mjs';
import { File } from '../models/file.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BlobServiceClient } from '@azure/storage-blob';
import logger from '../config/logger.mjs';
import verifyToken from '../middleware/verifyJWTToken.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findOne({_id: id});
        if (!file)
        {
            logger.warn(`File does not exist and cannot be deleted.`);
            return res.status(404).send("File does not exist");
        }

        const fileName = file.fileName;

        // Delete the file from Azure Blob Storage
        await deleteFromAzure(fileName);

        // Remove from MongoDB
        await File.findOneAndDelete({ fileName });

        logger.info(`${fileName} successfully deleted`);
        res.status(200).send('File deleted successfully');
    } catch (err) {
        logger.error(`Error during file deletion: ${err}`);
        res.status(500).send('Error during file deletion');
    }
});

router.get('/download/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findOne({_id: id});
        if (!file)
        {
            logger.warn(`File does not exist and cannot be downloaded.`);
            return res.status(404).send("File does not exist");
        }

        const fileName = file.fileName;

        const downloadPath = path.join(__dirname, '..', 'downloads', fileName);

        // Create the downloads folder if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, '..', 'downloads'))) {
            fs.mkdirSync(path.join(__dirname, '..', 'downloads'));
        }

        // Download the file from Azure Blob Storage
        await downloadFromAzure(fileName, downloadPath);

        // Send the file to the client
        res.download(downloadPath, fileName, (err) => {
            if (err) {
                logger.warn(`Error during file download: ${err}`);
            } else {
                // Clean up the downloaded file after sending it
                if (fs.existsSync(downloadPath)) {
                    fs.unlinkSync(downloadPath);  // Check if the file exists before deleting
                }
            }
        });
    } catch (err) {
        logger.error(`Error during file download: ${err}`);
        res.status(500).send('Error during file download');
    }
});

router.get('/stream/:id', verifyToken, async (req, res) => {
    try{
        const { id } = req.params;

        const file = await File.findOne({_id: id});
        if (!file)
        {
            logger.warn(`File does not exist and cannot be streamed.`);
            return res.status(404).send("File does not exist");
        }

        const fileName = file.fileName;

        const range = req.headers.range;

        if (!range) {
            logger.warn(`Range header erquired to stream ${fileName}`);
            return res.status(400).send('Requires Range header');
        }

        // Initialize the BlobServiceClient and ContainerClient
        const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blobClient = containerClient.getBlobClient(fileName);
        const properties = await blobClient.getProperties();
        const fileSize = properties.contentLength;

        if (!properties) {
            logger.warn(`File: ${fileName} not found`);
            return res.status(404).send('File not found');
        }

        // Parse Range
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;

        // Set headers for partial content
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': properties.contentType
        };

        res.writeHead(206, headers);

        // Stream the video using the download method
        const downloadResponse = await blobClient.download(start, chunkSize);
        downloadResponse.readableStreamBody.pipe(res);
    } catch (err) {
        logger.error(`Error streaming video: ${err}`);
        res.status(500).send('Error streaming video');
    }
});

export default router;
