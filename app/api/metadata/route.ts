import { NextResponse } from 'next/server';
import { getColleges, getSubjects, getExamTypes } from '@/lib/db';

export async function GET() {
  try {
    const [colleges, subjects, examTypes] = await Promise.all([
      getColleges(),
      getSubjects(),
      getExamTypes(),
    ]);

    return NextResponse.json({
      colleges,
      subjects,
      examTypes,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
