import { NextRequest, NextResponse } from 'next/server';
import { getReports } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const reports = await getReports();
    return NextResponse.json({ reports });
  } catch (error: unknown) {
    console.error('GET /api/admin/reports error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch reports';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
