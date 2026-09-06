import { NextRequest, NextResponse } from 'next/server';
import { updateQuestionPaper, deleteQuestionPaper } from '@/lib/db';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateQuestionPaper(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, paper: updated });
  } catch (error) {
    console.error('PATCH /api/admin/papers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update paper' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteQuestionPaper(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Paper removed from repository' });
  } catch (error) {
    console.error('DELETE /api/admin/papers/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete paper' }, { status: 500 });
  }
}
