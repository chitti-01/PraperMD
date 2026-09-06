import { NextRequest, NextResponse } from 'next/server';
import { getAdminTokenHash, ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'medico_admin_secret_2026';

    if (!passkey || passkey.trim() !== adminSecret.trim()) {
      return NextResponse.json({ error: 'Invalid admin passkey credentials' }, { status: 401 });
    }

    const tokenHash = getAdminTokenHash();
    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
    });

    // Set HttpOnly, SameSite=Lax, Secure session cookie on the response
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: tokenHash,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
