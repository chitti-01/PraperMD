import { NextRequest, NextResponse } from 'next/server';
import { ReportSchema } from '@/lib/validation';
import { createReport } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting check (Max 5 reports per 10 minutes per IP)
  const rateLimit = checkRateLimit(request, {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: `Report submission rate limit exceeded. Please wait ${rateLimit.reset} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = ReportSchema.parse(body);

    const report = await createReport(
      validated.paper_id,
      validated.reason,
      validated.description
    );

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid report payload' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
