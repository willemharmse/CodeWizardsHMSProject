import jwt from 'jsonwebtoken';

export default function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('Access denied');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user ID and role to request
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
}