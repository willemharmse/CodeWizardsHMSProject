import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static'; // Import ffmpeg-static for binary path
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath); // Set the ffmpeg path from ffmpeg-static

export const compressVideo = (req, res, next) => {
    if (!req.file) return next(); // If there's no file, skip compression

    const outputFilePath = path.join('uploads', `${Date.now()}-${req.file.originalname}`);

    ffmpeg(req.file.path)
        .output(outputFilePath)
        .on('end', () => {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error(`Error deleting original file ${req.file.path}:`, err);
                } else {
                    console.log(`Original file ${req.file.path} deleted successfully`);
                }
            });
            // Replace the file path with the compressed one and continue
            req.file.path = outputFilePath;
            next();
        })
        .on('error', (err) => {
            // Handle any errors that occur during compression
            console.error('Error compressing video:', err);
            next(err);
        })
        .run();
};
