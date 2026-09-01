import { NextRequest, NextResponse } from 'next/server';
import { calculateBufferHash } from '@/lib/hash';
import { checkDuplicateHash, createQuestionPaper, getColleges } from '@/lib/db';
import { UploadPaperSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get('title') as string;
    const subject_id = formData.get('subject_id') as string;
    const exam_type_id = formData.get('exam_type_id') as string;
    const mbbs_year = formData.get('mbbs_year') as string;
    const semester = (formData.get('semester') as string) || '';
    const exam_year = formData.get('exam_year');
    const academic_year = (formData.get('academic_year') as string) || '';
    const description = (formData.get('description') as string) || '';

    // Validate metadata
    const validated = UploadPaperSchema.parse({
      title,
      subject_id,
      exam_type_id,
      mbbs_year,
      semester,
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

    // Read first file buffer for SHA-256 hash calculation
    const firstFile = files[0];
    const arrayBuffer = await firstFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. SHA-256 Duplicate Check
    const fileHash = calculateBufferHash(buffer);
    const existingDuplicate = await checkDuplicateHash(fileHash);

    if (existingDuplicate) {
      return NextResponse.json(
        {
          error: `Exact duplicate file detected! This question paper already exists as "${existingDuplicate.title}" (${existingDuplicate.exam_year}).`,
          isDuplicate: true,
          existingPaperId: existingDuplicate.id,
        },
        { status: 409 }
      );
    }

    // 2. Identify file type & page count
    const isPdf = firstFile.type === 'application/pdf' || firstFile.name.endsWith('.pdf');
    const fileType = isPdf ? 'pdf' : files.length > 1 ? 'multi_image' : 'image';
    const pageCount = isPdf ? 1 : files.length;
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    const colleges = await getColleges();
    const defaultCollege = colleges[0];

    // 3. Create active question paper record
    const paper = await createQuestionPaper({
      college_id: defaultCollege.id,
      subject_id: validated.subject_id,
      exam_type_id: validated.exam_type_id,
      mbbs_year: validated.mbbs_year as any,
      semester: validated.semester,
      exam_year: validated.exam_year,
      academic_year: validated.academic_year || `${validated.exam_year - 1}-${validated.exam_year}`,
      title: validated.title,
      description: validated.description,
      storage_path: `supabase/question-papers/${Date.now()}_${firstFile.name}`,
      file_type: fileType,
      file_size: totalBytes,
      file_hash: fileHash,
      original_file_name: firstFile.name,
      page_count: pageCount,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Question paper published successfully!',
        paper,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid form data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process upload' },
      { status: 500 }
    );
  }
}
