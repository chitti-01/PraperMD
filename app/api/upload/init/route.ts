import { NextRequest, NextResponse } from 'next/server';
import { checkDuplicateHash, getColleges } from '@/lib/db';
import { UploadPaperSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';

const MAX_SINGLE_FILE_BYTES = 50 * 1024 * 1024; // 50 MB max per file
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

export async function POST(request: NextRequest) {
  // 1. Rate limiting check
  const rateLimit = checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Upload rate limit exceeded. Please wait ${rateLimit.reset} seconds before trying again.`,
        },
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const {
      title,
      subject_id,
      exam_type_id,
      mbbs_year,
      semester,
      exam_year,
      academic_year,
      description,
      file_name,
      file_size,
      file_type,
      file_hash,
      page_count,
    } = body;

    // Validate metadata
    const validated = UploadPaperSchema.parse({
      title,
      subject_id,
      exam_type_id,
      mbbs_year,
      semester: semester || '',
      exam_year,
      academic_year: academic_year || '',
      description: description || '',
    });

    if (!file_name || !file_size || !file_hash) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_INFO',
            message: 'Missing file details (filename, file size, or hash).',
          },
        },
        { status: 400 }
      );
    }

    if (file_size > MAX_SINGLE_FILE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds the 50MB maximum supported limit (${(file_size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
          },
        },
        { status: 400 }
      );
    }

    if (file_type && !ALLOWED_MIME_TYPES.includes(file_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_TYPE',
            message: `Unsupported file format "${file_type}". Allowed formats: PDF, JPEG, PNG, WebP.`,
          },
        },
        { status: 400 }
      );
    }

    // 2. SHA-256 Duplicate Check BEFORE binary upload!
    const existingDuplicate = await checkDuplicateHash(file_hash);
    if (existingDuplicate) {
      return NextResponse.json(
        {
          success: false,
          isDuplicate: true,
          existingPaperId: existingDuplicate.id,
          error: {
            code: 'DUPLICATE_FILE',
            message: `Exact duplicate file detected! This question paper already exists in the repository as "${existingDuplicate.title}" (${existingDuplicate.exam_year}).`,
          },
        },
        { status: 409 }
      );
    }

    // 3. Prepare storage path
    const safeFilename = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const isPdf = file_type === 'application/pdf' || safeFilename.endsWith('.pdf');
    const finalFileType = isPdf ? 'pdf' : (page_count && page_count > 1) ? 'multi_image' : 'image';

    const colleges = await getColleges();
    const defaultCollege = colleges && colleges.length > 0
      ? colleges[0]
      : { id: 'col-gmc-01', name: 'Government Medical College (GMC)' };

    const storagePath = `${defaultCollege.id}/${Date.now()}_${safeFilename}`;

    const paperData = {
      college_id: defaultCollege.id,
      subject_id: validated.subject_id,
      exam_type_id: validated.exam_type_id,
      mbbs_year: validated.mbbs_year as '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final MBBS',
      semester: validated.semester,
      exam_year: validated.exam_year,
      academic_year: validated.academic_year || `${validated.exam_year - 1}-${validated.exam_year}`,
      title: validated.title,
      description: validated.description,
      storage_path: storagePath,
      original_file_name: safeFilename,
      file_type: finalFileType,
      file_size: file_size,
      file_hash: file_hash,
      page_count: page_count || 1,
    };

    if (isSupabaseConfigured()) {
      // Create presigned upload URL
      let { data, error } = await supabaseAdmin.storage
        .from('question-papers')
        .createSignedUploadUrl(storagePath);

      if (error) {
        // Auto-create bucket if missing
        const isBucketMissing =
          error.message?.toLowerCase().includes('not found') ||
          (error as { statusCode?: string }).statusCode === '404';

        if (isBucketMissing) {
          try {
            await supabaseAdmin.storage.createBucket('question-papers', { public: false });
            const retry = await supabaseAdmin.storage
              .from('question-papers')
              .createSignedUploadUrl(storagePath);
            data = retry.data;
            error = retry.error;
          } catch (bucketErr) {
            console.error('Failed to create storage bucket:', bucketErr);
          }
        }
      }

      if (data?.signedUrl) {
        return NextResponse.json({
          success: true,
          directUpload: true,
          signedUrl: data.signedUrl,
          token: data.token,
          path: data.path,
          storagePath,
          paperData,
        });
      }
    }

    // Fallback mode if Supabase is not configured or in dev memory mode
    return NextResponse.json({
      success: true,
      directUpload: false,
      storagePath,
      paperData,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload initialization failed.';
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INIT_FAILED',
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}
