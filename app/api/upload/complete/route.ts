import { NextRequest, NextResponse } from 'next/server';
import { createQuestionPaper } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storagePath, paperData, directUpload } = body;

    if (!paperData || !paperData.title || !paperData.subject_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAPER_DATA',
            message: 'Incomplete paper metadata provided.',
          },
        },
        { status: 400 }
      );
    }

    // Verify storage object if directUpload was used and Supabase is configured
    if (directUpload && isSupabaseConfigured() && storagePath) {
      const folderPath = storagePath.split('/')[0];
      const fileName = storagePath.split('/').slice(1).join('/');

      const { data: fileList, error: listErr } = await supabaseAdmin.storage
        .from('question-papers')
        .list(folderPath, { search: fileName });

      if (listErr || !fileList || fileList.length === 0) {
        console.warn('Storage file verification warning:', listErr || 'File not found in storage list');
      }
    }

    // Insert database record atomically with Storage cleanup fallback on failure
    let paper;
    try {
      paper = await createQuestionPaper(paperData);
    } catch (dbErr) {
      // Clean up storage object if DB insert failed
      if (isSupabaseConfigured() && storagePath) {
        await supabaseAdmin.storage.from('question-papers').remove([storagePath]);
      }
      throw dbErr;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question paper published successfully!',
        paper,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to finalize paper publishing.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
