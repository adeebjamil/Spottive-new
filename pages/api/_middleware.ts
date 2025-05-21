import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../lib/mongoose';

export default async function dbMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: Function
) {
  await connectDB();
  return next();
}