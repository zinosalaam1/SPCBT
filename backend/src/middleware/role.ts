import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export default (role: string) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user.role !== role)
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };
