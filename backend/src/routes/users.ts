import { Router, Response } from 'express';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';
import role from '../middleware/role';

const router = Router();

// GET /api/users (admin)
router.get('/', auth, role('admin'), async (_, res: Response) => {
  const users = await User.find().select('-password');
  res.json({ users });
});

// POST /api/users (admin)
router.post('/', auth, role('admin'), async (req: AuthRequest, res: Response) => {
  const user = await User.create(req.body);
  res.json({ user });
});

// DELETE /api/users/:id (admin)
router.delete('/:id', auth, role('admin'), async (req, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
