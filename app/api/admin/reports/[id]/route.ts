import { NextRequest, NextResponse } from 'next/server';
import { resolveReport, getReports } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const reports = await getReports();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('GET /api/admin/reports/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 });
    }

    const report = await resolveReport(id, status);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('PATCH /api/admin/reports/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
