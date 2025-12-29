import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // ✅ Allow preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default auth;
