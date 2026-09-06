import { NextRequest, NextResponse } from 'next/server';
import { getQuestionPaperById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paper = await getQuestionPaperById(id);

    if (!paper) {
      return NextResponse.json({ error: 'Question paper not found' }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error('API /papers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch paper details' }, { status: 500 });
  }
}
