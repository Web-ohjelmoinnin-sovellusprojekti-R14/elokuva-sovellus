import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

function authMe(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: decoded.user_id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function getCurrentUser(req, res) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: { user_id: decoded.user_id, username: decoded.username } });
  } catch {
    return res.status(401).json({ user: null });
  }
}

export { authMe, getCurrentUser };
