import { NextRequest, NextResponse } from 'next/server';
import { getQuestionPapers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const examTypeId = searchParams.get('examTypeId') || undefined;
    const mbbsYear = searchParams.get('mbbsYear') || undefined;
    const examAttempt = searchParams.get('examAttempt') || undefined;
    const examYear = searchParams.get('examYear') ? Number(searchParams.get('examYear')) : undefined;
    const sortBy = (searchParams.get('sortBy') as 'latest' | 'oldest' | 'downloads' | 'views') || 'latest';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = await getQuestionPapers({
      query,
      subjectId,
      examTypeId,
      mbbsYear,
      examAttempt,
      examYear,
      sortBy,
      limit,
    });

    return NextResponse.json({
      success: true,
      papers: result.papers,
      total: result.total,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch question papers';
    console.error('API /papers error:', error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
        message: 'Database query failure. Please verify PostgreSQL connection and schema migration state.',
      },
      { status: 500 }
    );
  }
}
