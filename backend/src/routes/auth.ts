import { Router } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import auth, { AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    user,
    token: generateToken(user._id.toString())
  });
});

router.get('/me', auth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post('/logout', auth, (_req, res) => {
  res.json({ success: true });
});

router.post('/seed-admin', async (_req, res) => {
  const user = await User.create({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrator',
    email: 'admin@example.com'
  });

  res.json(user);
});


export default router;

