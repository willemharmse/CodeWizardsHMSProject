import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING; // Get this from your environment variables or Azure Portal
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

export const uploadToAzure = async (filePath, fileName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);
        return {
            blobName: fileName,
            url: blockBlobClient.url,
            uploadResponse: uploadBlobResponse
        };
    } catch (err) {
        console.error('Error uploading to Azure:', err);
        throw err;
    }
};  

export const deleteFromAzure = async (blobName) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        const deleteBlobResponse = await blockBlobClient.delete();
        return deleteBlobResponse;
    } catch (err) {
        console.error('Error deleting from Azure:', err);
        throw err;
    }
};
export const downloadFromAzure = async (blobName, downloadPath) => {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    try {
        // Download the file from Azure Blob Storage to the specified path
        await blockBlobClient.downloadToFile(downloadPath);
        return downloadPath;
    } catch (err) {
        console.error('Error downloading from Azure:', err);
        throw err;
    }
};
