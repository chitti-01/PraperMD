import { NextRequest, NextResponse } from 'next/server';
import { updateQuestionPaper, deleteQuestionPaper } from '@/lib/db';

function verifyAdmin(request: NextRequest): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const secret = process.env.ADMIN_SECRET_KEY || 'medico_admin_secret_2026';
  return adminKey?.trim() === secret.trim();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
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
    return NextResponse.json({ error: 'Failed to update paper' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) {
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
    return NextResponse.json({ error: 'Failed to delete paper' }, { status: 500 });
  }
}
