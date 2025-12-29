
import jwt from 'jsonwebtoken';

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

export default generateToken;
