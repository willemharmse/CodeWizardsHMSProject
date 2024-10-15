import logger from '../config/logger.mjs';

export const logRequests = (req, res, next) => {
    const { method, url, query, body } = req;
    
    // Make a copy of the body and mask sensitive data
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) {
        sanitizedBody.password = '******';  // Mask the password
    }

    // Log the method, URL, and query parameters
    logger.info(`Request: ${req.method} ${req.url} - Query: ${JSON.stringify(req.query)} - Body: ${JSON.stringify(sanitizedBody)}`);
    next();
};
