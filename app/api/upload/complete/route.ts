import { NextRequest, NextResponse } from 'next/server';
import {
  finalizeQuestionPaperAtomic,
  verifyStorageObject,
  updateUploadIntentStatus,
} from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storagePath, paperData, intentId, directUpload } = body;

    if (!intentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_INTENT_ID',
            message: 'Missing upload intent identifier. Upload cannot be finalized without a valid upload_intent record.',
          },
        },
        { status: 400 }
      );
    }

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

    // 1. Mandatory Storage Verification
    if (directUpload && isSupabaseConfigured() && storagePath) {
      const verification = await verifyStorageObject(storagePath, paperData.file_size);
      if (!verification.exists) {
        await updateUploadIntentStatus(intentId, 'FAILED', 'Storage file verification failed: Object missing or size mismatch in bucket.');
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'STORAGE_VERIFICATION_FAILED',
              message: 'Storage Verification Failure: The uploaded file could not be verified in Supabase Storage. Paper was not published.',
            },
          },
          { status: 400 }
        );
      }
    }

    // 2. Single Authoritative Finalization Path (NO FALLBACKS)
    const paper = await finalizeQuestionPaperAtomic(intentId);

    if (!paper || !paper.id) {
      if (isSupabaseConfigured() && storagePath) {
        await supabaseAdmin.storage.from('question-papers').remove([storagePath]);
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_COMMIT_FAILED',
            message: 'Database Commit Failure: Failed to verify metadata write in PostgreSQL.',
          },
        },
        { status: 500 }
      );
    }

    // Zero-Silent-Data-Loss Success Response
    return NextResponse.json(
      {
        success: true,
        message: 'Question paper published and verified successfully in production repository!',
        paper,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to finalize paper publishing.';
    console.error('Publish completion error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PUBLISH_FAILED',
          message: `Upload Error: ${msg}. Your question paper was NOT saved to the database.`,
        },
      },
      { status: 500 }
    );
  }
}
