import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'folio_session';
const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || 'dev-only-secret-change-me-0123456789abcdef');

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}
