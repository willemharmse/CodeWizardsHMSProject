import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Point ffmpeg to the static binary
ffmpeg.setFfmpegPath(ffmpegPath);

export const compressVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions('-crf 28') // Compression factor (lower = better quality)
            .save(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));
    });
};