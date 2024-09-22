import logger from '../config/logger.mjs';

export const logRequests = (req, res, next) => {
    // Log the method, URL, and query parameters
    logger.info(`Request: ${req.method} ${req.url} - Query: ${JSON.stringify(req.query)} - Body: ${JSON.stringify(req.body)}`);
    next();
};
