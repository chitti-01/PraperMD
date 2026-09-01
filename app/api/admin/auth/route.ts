import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { passkey } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'medico_admin_secret_2026';

    if (!passkey || passkey.trim() !== adminSecret.trim()) {
      return NextResponse.json({ error: 'Invalid admin passkey' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: `admin_session_${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
