import { NextRequest, NextResponse } from 'next/server';
import { ReportSchema } from '@/lib/validation';
import { createReport } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ReportSchema.parse(body);

    const report = await createReport(
      validated.paper_id,
      validated.reason,
      validated.description
    );

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid report payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
