import { NextRequest } from 'next/server';
import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'papermd_admin_session';

/**
 * Derives a secure session token hash from the server ADMIN_SECRET_KEY.
 * The secret key itself is NEVER sent to or stored in client JS.
 */
export function getAdminTokenHash(): string {
  const secret = process.env.ADMIN_SECRET_KEY || 'medico_admin_secret_2026';
  return crypto.createHash('sha256').update(`papermd_admin_session_${secret}`).digest('hex');
}

/**
 * Server-side authorization check for /api/admin/* endpoints.
 * Verifies the encrypted/hashed HttpOnly cookie or x-admin-key header on the server.
 */
export function verifyAdminSession(request: NextRequest): boolean {
  const expectedToken = getAdminTokenHash();
  const rawSecret = process.env.ADMIN_SECRET_KEY || 'medico_admin_secret_2026';

  // 1. Check HttpOnly Session Cookie (Primary production method)
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (sessionCookie && sessionCookie === expectedToken) {
    return true;
  }

  // 2. Check x-admin-key header fallback for API clients / dev testing
  const headerKey = request.headers.get('x-admin-key');
  if (headerKey && (headerKey.trim() === rawSecret.trim() || headerKey.trim() === expectedToken)) {
    return true;
  }

  return false;
}
