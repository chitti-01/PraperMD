import { NextRequest, NextResponse } from 'next/server';
import { calculateBufferHash } from '@/lib/hash';
import { checkDuplicateHash, createQuestionPaper, getColleges } from '@/lib/db';
import { UploadPaperSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase/admin';

const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB max total request size
const MAX_FILE_COUNT = 20; // 20 pages max
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
  // 1. Rate Limiting Check (Max 10 upload requests per 10 minutes per IP)
  const rateLimit = checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: `Upload rate limit exceeded. Please wait ${rateLimit.reset} seconds before trying again.` },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const subject_id = formData.get('subject_id') as string;
    const exam_type_id = formData.get('exam_type_id') as string;
    const mbbs_year = formData.get('mbbs_year') as string;
    const exam_attempt = (formData.get('exam_attempt') as string) || 'Main Examination';
    const exam_year = formData.get('exam_year');
    const academic_year = (formData.get('academic_year') as string) || '';
    const description = (formData.get('description') as string) || '';

    // Validate metadata via Zod schema
    const validated = UploadPaperSchema.parse({
      title,
      subject_id,
      exam_type_id,
      mbbs_year,
      exam_attempt,
      exam_year,
      academic_year,
      description,
    });

    // Extract uploaded files
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Please upload at least one PDF or image file.' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILE_COUNT) {
      return NextResponse.json(
        { error: `Exceeded maximum page limit. You may upload up to ${MAX_FILE_COUNT} pages per paper.` },
        { status: 400 }
      );
    }

    // 2. Validate total file size and MIME types
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { error: 'Total file size exceeds the 20MB limit. Please compress images or reduce page count.' },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type "${file.type}". Allowed formats: PDF, JPEG, PNG, WebP.` },
          { status: 400 }
        );
      }
    }

    // 3. Read first file buffer for SHA-256 hash calculation & Storage upload
    const firstFile = files[0];
    const arrayBuffer = await firstFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SHA-256 Duplicate Check
    const fileHash = calculateBufferHash(buffer);
    const existingDuplicate = await checkDuplicateHash(fileHash);

    if (existingDuplicate) {
      return NextResponse.json(
        {
          error: `Exact duplicate file detected! This question paper already exists in the repository as "${existingDuplicate.title}" (${existingDuplicate.exam_year}).`,
          isDuplicate: true,
          existingPaperId: existingDuplicate.id,
        },
        { status: 409 }
      );
    }

    // Sanitize filename to prevent path traversal
    const safeFilename = firstFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const isPdf = firstFile.type === 'application/pdf' || safeFilename.endsWith('.pdf');
    const fileType = isPdf ? 'pdf' : files.length > 1 ? 'multi_image' : 'image';
    const pageCount = isPdf ? 1 : files.length;

    const colleges = await getColleges();
    const defaultCollege = (colleges && colleges.length > 0)
      ? colleges[0]
      : { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Government Medical College (GMC)' };

    // Generate safe deterministic storage path
    const storagePath = `${defaultCollege.id}/${Date.now()}_${safeFilename}`;

    // 4. Upload file object to private Supabase Storage bucket 'question-papers' if configured
    let storageUploaded = false;
    if (isSupabaseConfigured()) {
      let { error: storageError } = await supabaseAdmin.storage
        .from('question-papers')
        .upload(storagePath, buffer, {
          contentType: firstFile.type || 'application/pdf',
          upsert: false,
        });

      if (storageError) {
        console.error('Supabase Storage Upload Error:', storageError);

        // Auto-create bucket if missing
        const isBucketMissing =
          storageError.message?.toLowerCase().includes('not found') ||
          (storageError as { statusCode?: string }).statusCode === '404' ||
          (storageError as { error?: string }).error === 'Bucket not found';

        if (isBucketMissing) {
          try {
            const { error: bucketCreateErr } = await supabaseAdmin.storage.createBucket('question-papers', {
              public: false,
            });

            if (!bucketCreateErr) {
              const { error: retryError } = await supabaseAdmin.storage
                .from('question-papers')
                .upload(storagePath, buffer, {
                  contentType: firstFile.type || 'application/pdf',
                  upsert: false,
                });
              if (!retryError) {
                storageError = null;
                storageUploaded = true;
              }
            }
          } catch (bucketErr) {
            console.error('Failed to auto-create question-papers bucket:', bucketErr);
          }
        }

        if (storageError && process.env.NODE_ENV === 'production') {
          return NextResponse.json(
            { error: `Storage Error: Failed to upload question paper file (${storageError.message}). Please verify that the 'question-papers' storage bucket exists in Supabase Storage.` },
            { status: 500 }
          );
        }
      } else {
        storageUploaded = true;
      }
    }

    // 5. Create database record atomically with Storage cleanup fallback
    let paper;
    try {
      paper = await createQuestionPaper({
        college_id: defaultCollege.id,
        subject_id: validated.subject_id,
        exam_type_id: validated.exam_type_id,
        mbbs_year: validated.mbbs_year as '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final MBBS',
        exam_attempt: validated.exam_attempt,
        exam_year: validated.exam_year,
        academic_year: validated.academic_year || `${validated.exam_year - 1}-${validated.exam_year}`,
        title: validated.title,
        description: validated.description,
        storage_path: storagePath,
        file_type: fileType,
        file_size: totalBytes,
        file_hash: fileHash,
        original_file_name: safeFilename,
        page_count: pageCount,
      });
    } catch (dbError: unknown) {
      // ATOMIC CLEANUP: If DB insert fails after storage upload succeeds, delete orphaned file from Storage
      if (storageUploaded) {
        await supabaseAdmin.storage.from('question-papers').remove([storagePath]);
      }
      throw dbError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Question paper published successfully!',
        paper,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid upload form data' },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred while processing your paper upload.';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
