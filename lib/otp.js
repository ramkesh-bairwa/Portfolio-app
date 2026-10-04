import crypto from 'node:crypto';

export const hashOtp = (phone, code) =>
  crypto.createHash('sha256').update(`${phone}:${code}:${process.env.JWT_SECRET || 'dev'}`).digest('hex');
