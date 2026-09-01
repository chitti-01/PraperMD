import { NextRequest, NextResponse } from 'next/server';
import { getQuestionPapers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const examTypeId = searchParams.get('examTypeId') || undefined;
    const mbbsYear = searchParams.get('mbbsYear') || undefined;
    const examYear = searchParams.get('examYear') ? Number(searchParams.get('examYear')) : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'latest';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = await getQuestionPapers({
      query,
      subjectId,
      examTypeId,
      mbbsYear,
      examYear,
      sortBy,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch question papers' }, { status: 500 });
  }
}
