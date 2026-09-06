import { NextResponse } from 'next/server';
import { getCoverageMatrix } from '@/lib/db';

export async function GET() {
  try {
    const years = [2023, 2024, 2025, 2026];
    const matrix = await getCoverageMatrix(years);

    return NextResponse.json({
      years,
      matrix,
    });
  } catch (error) {
    console.error('API /coverage error:', error);
    return NextResponse.json({ error: 'Failed to generate coverage matrix' }, { status: 500 });
  }
}
