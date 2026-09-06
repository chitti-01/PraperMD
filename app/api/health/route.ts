import { NextResponse } from 'next/server';
import { getColleges } from '@/lib/db';

export async function GET() {
  try {
    const colleges = await getColleges();
    const dbStatus = colleges && colleges.length > 0 ? 'ok' : 'degraded';

    return NextResponse.json(
      {
        status: dbStatus === 'ok' ? 'ok' : 'degraded',
        database: dbStatus,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API /health check error:', error);
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
