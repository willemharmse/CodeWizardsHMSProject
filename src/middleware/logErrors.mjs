import logger from '../config/logger.mjs';

export const logErrors = (err, req, res, next) => {
    // Log the error message, stack, and request details
    logger.error(`Error: ${req.method} ${req.url} - ${err.message}\nStack: ${err.stack}`);
    res.status(500).send('Internal Server Error');
};