import {
  College,
  Subject,
  ExamType,
  QuestionPaper,
  PaperReport,
  PaperFilterParams,
  CoverageMatrixItem,
} from './types';
import {
  INITIAL_COLLEGE,
  INITIAL_SUBJECTS,
  INITIAL_EXAM_TYPES,
} from './mock-data';
import { supabaseAdmin } from './supabase/admin';

interface DbPaperRow extends QuestionPaper {
  file_name?: string;
  colleges?: { name: string };
  subjects?: { name: string };
  exam_types?: { name: string };
}

interface DbReportRow {
  id: string;
  question_paper_id: string;
  reason: PaperReport['reason'];
  details?: string | null;
  status: string;
  created_at: string;
  resolved_at?: string | null;
  question_papers?: {
    title?: string;
    subjects?: { name?: string };
  };
}

export interface UploadIntent {
  id: string;
  idempotency_key: string;
  college_id: string;
  subject_id: string;
  exam_type_id: string;
  title: string;
  description?: string | null;
  mbbs_year: '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final MBBS';
  exam_attempt: 'Main Examination' | 'Supplementary Examination';
  exam_year: number;
  academic_year?: string | null;
  storage_path: string;
  file_name: string;
  file_type: 'pdf' | 'image' | 'multi_image';
  file_size: number;
  file_hash: string;
  page_count: number;
  status: 'UPLOADING' | 'STORAGE_UPLOADED' | 'VERIFYING' | 'READY' | 'FAILED';
  error_message?: string | null;
  question_paper_id?: string | null;
  created_at: string;
  updated_at: string;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

function assertSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error('Database Error: NEXT_PUBLIC_SUPABASE_URL is unconfigured or pointing to placeholder endpoint.');
  }
}

// ------------------------------------------------------------
// METADATA READS (UI SELECTION HELPERS)
// ------------------------------------------------------------
export async function getColleges(): Promise<College[]> {
  if (!isSupabaseConfigured()) {
    return [INITIAL_COLLEGE];
  }
  const { data, error } = await supabaseAdmin
    .from('colleges')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[PaperMD DB Error] getColleges failed:', error);
    return [INITIAL_COLLEGE];
  }
  return (data && data.length > 0) ? (data as College[]) : [INITIAL_COLLEGE];
}

export async function getSubjects(): Promise<Subject[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_SUBJECTS;
  }
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[PaperMD DB Error] getSubjects failed:', error);
    return INITIAL_SUBJECTS;
  }
  return (data && data.length > 0) ? (data as Subject[]) : INITIAL_SUBJECTS;
}

export async function getExamTypes(): Promise<ExamType[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_EXAM_TYPES;
  }
  const { data, error } = await supabaseAdmin
    .from('exam_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[PaperMD DB Error] getExamTypes failed:', error);
    return INITIAL_EXAM_TYPES;
  }
  return (data && data.length > 0) ? (data as ExamType[]) : INITIAL_EXAM_TYPES;
}

// ------------------------------------------------------------
// QUESTION PAPERS READ & SEARCH
// STRICT READ PATH: Throws Database Error on DB failure!
// ------------------------------------------------------------
export async function getQuestionPapers(params: PaperFilterParams = {}): Promise<{
  papers: QuestionPaper[];
  total: number;
}> {
  assertSupabaseConfigured();

  let query = supabaseAdmin
    .from('question_papers')
    .select(
      `*,
      colleges(name),
      subjects(name),
      exam_types(name)`,
      { count: 'exact' }
    )
    .eq('status', 'active');

  if (params.subjectId) query = query.eq('subject_id', params.subjectId);
  if (params.examTypeId) query = query.eq('exam_type_id', params.examTypeId);
  if (params.mbbsYear) query = query.eq('mbbs_year', params.mbbsYear);
  if (params.examAttempt) query = query.eq('exam_attempt', params.examAttempt);
  if (params.examYear) query = query.eq('exam_year', Number(params.examYear));
  if (params.collegeId) query = query.eq('college_id', params.collegeId);

  if (params.query && params.query.trim()) {
    const q = `%${params.query.trim()}%`;
    query = query.or(`title.ilike.${q},description.ilike.${q},academic_year.ilike.${q}`);
  }

  if (params.sortBy === 'views') {
    query = query.order('view_count', { ascending: false });
  } else if (params.sortBy === 'downloads') {
    query = query.order('download_count', { ascending: false });
  } else if (params.sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (params.limit && params.offset !== undefined) {
    query = query.range(params.offset, params.offset + params.limit - 1);
  } else if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('[PaperMD DB Error] getQuestionPapers failed:', error);
    throw new Error(`Database Query Error: ${error.message} (Code: ${error.code})`);
  }

  const formattedPapers: QuestionPaper[] = (data as DbPaperRow[] || []).map((p) => ({
    ...p,
    college_name: p.colleges?.name,
    subject_name: p.subjects?.name,
    exam_type_name: p.exam_types?.name,
    original_file_name: p.file_name || p.original_file_name || p.title || 'document.pdf',
    published_at: p.created_at,
  }));

  return { papers: formattedPapers, total: count !== null ? count : formattedPapers.length };
}

export async function getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('question_papers')
    .select(
      `*,
      colleges(name),
      subjects(name),
      exam_types(name)`
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Record not found
    console.error('[PaperMD DB Error] getQuestionPaperById failed:', error);
    throw new Error(`Database Error: ${error.message}`);
  }

  if (!data) return null;

  // Increment view count asynchronously
  await supabaseAdmin
    .from('question_papers')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id);

  return {
    ...data,
    college_name: data.colleges?.name,
    subject_name: data.subjects?.name,
    exam_type_name: data.exam_types?.name,
    original_file_name: data.file_name || data.original_file_name || data.title || 'document.pdf',
    published_at: data.created_at,
    view_count: (data.view_count || 0) + 1,
  } as QuestionPaper;
}

export async function checkDuplicateHash(fileHash: string): Promise<QuestionPaper | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('question_papers')
    .select('*')
    .eq('file_hash', fileHash)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('[PaperMD DB Error] checkDuplicateHash failed:', error);
    throw new Error(`Database Error: ${error.message}`);
  }

  if (data) {
    return {
      ...data,
      original_file_name: data.file_name,
      published_at: data.created_at,
    } as QuestionPaper;
  }
  return null;
}

// ------------------------------------------------------------
// UPLOAD INTENTS & TRANSACTION LIFECYCLE
// ------------------------------------------------------------
// ------------------------------------------------------------
// UPLOAD INTENTS & TRANSACTION LIFECYCLE
// ------------------------------------------------------------
export async function createUploadIntent(
  intent: Omit<UploadIntent, 'created_at' | 'updated_at' | 'status' | 'error_message' | 'question_paper_id'> & { id?: string }
): Promise<UploadIntent> {
  assertSupabaseConfigured();

  // 1. Check if intent already exists for this idempotency key (handles retries/duplicate POST requests)
  const { data: existing, error: selectErr } = await supabaseAdmin
    .from('upload_intents')
    .select('*')
    .eq('idempotency_key', intent.idempotency_key)
    .maybeSingle();

  if (selectErr) {
    console.error('[PaperMD DB Error] createUploadIntent select failed:', selectErr);
    throw new Error(`Database Failure: Could not verify idempotency key (${selectErr.message})`);
  }

  if (existing) {
    return existing as UploadIntent;
  }

  // 2. Insert intent into PostgreSQL. Throws HARD ERROR if insertion fails. ZERO SILENT FALLBACK.
  const payload = {
    ...intent,
    id: intent.id || crypto.randomUUID(),
    status: 'UPLOADING',
  };

  const { data, error } = await supabaseAdmin
    .from('upload_intents')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    console.error('[PaperMD DB Error] createUploadIntent insert failed:', error);
    throw new Error(`Database Write Failure: Failed to create persistent upload intent (${error?.message || 'DB Error'}).`);
  }

  return data as UploadIntent;
}

export async function updateUploadIntentStatus(
  intentId: string,
  status: UploadIntent['status'],
  errorMessage?: string,
  questionPaperId?: string
): Promise<void> {
  assertSupabaseConfigured();

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (errorMessage !== undefined) updates.error_message = errorMessage;
  if (questionPaperId !== undefined) updates.question_paper_id = questionPaperId;

  const { error } = await supabaseAdmin
    .from('upload_intents')
    .update(updates)
    .eq('id', intentId);

  if (error) {
    console.error('[PaperMD DB Error] updateUploadIntentStatus failed:', error);
    throw new Error(`Database Update Failure: Failed to update upload intent status (${error.message})`);
  }
}

// ------------------------------------------------------------
// STORAGE VERIFICATION HELPERS
// ------------------------------------------------------------
export async function verifyStorageObject(
  storagePath: string,
  expectedSize?: number
): Promise<{ exists: boolean; size?: number; mimeType?: string }> {
  assertSupabaseConfigured();

  const folderPath = storagePath.split('/')[0];
  const fileName = storagePath.split('/').slice(1).join('/');

  const { data: fileList, error } = await supabaseAdmin.storage
    .from('question-papers')
    .list(folderPath, { search: fileName });

  if (error || !fileList || fileList.length === 0) {
    return { exists: false };
  }

  const file = fileList.find((f) => f.name === fileName || storagePath.endsWith(f.name));
  if (!file) return { exists: false };

  const actualSize = file.metadata?.size || file.metadata?.contentLength;

  if (expectedSize && actualSize && Math.abs(actualSize - expectedSize) > 100) {
    console.warn(`[Storage Verification Mismatch] Expected size ${expectedSize}, actual size ${actualSize}`);
    return { exists: false, size: actualSize };
  }

  return {
    exists: true,
    size: actualSize,
    mimeType: file.metadata?.mimetype,
  };
}

// ------------------------------------------------------------
// ATOMIC FINALIZATION WITH POSTGRESQL RPC / TRANSACTION & READ-AFTER-WRITE
// ------------------------------------------------------------
export async function finalizeQuestionPaperAtomic(intentId: string): Promise<QuestionPaper> {
  assertSupabaseConfigured();

  // 1. Fetch persistent upload intent
  const { data: intent, error: intentErr } = await supabaseAdmin
    .from('upload_intents')
    .select('*')
    .eq('id', intentId)
    .single();

  if (intentErr || !intent) {
    throw new Error(`Upload Intent Verification Failure: Intent record ${intentId} not found in database.`);
  }

  // 2. Perform Storage Object Verification
  await updateUploadIntentStatus(intentId, 'VERIFYING');
  const storageVerification = await verifyStorageObject(intent.storage_path, intent.file_size);

  if (!storageVerification.exists) {
    await updateUploadIntentStatus(intentId, 'FAILED', 'Storage file verification failed: Binary object missing or size mismatch in Supabase Storage.');
    throw new Error(`Storage Verification Failure: File at path "${intent.storage_path}" could not be verified in Storage bucket "question-papers".`);
  }

  // 3. Single Authoritative Atomic Database Finalization via PostgreSQL RPC Function
  const { data: rpcResult, error: rpcErr } = await supabaseAdmin.rpc('finalize_paper_transaction', {
    p_intent_id: intentId,
  });

  if (rpcErr) {
    const errMsg = rpcErr.message;
    await updateUploadIntentStatus(intentId, 'FAILED', `RPC Error: ${errMsg}`).catch(() => {});
    throw new Error(`Database Transaction Failure: Failed to finalize question paper via RPC (${errMsg}).`);
  }

  const resultObj = rpcResult as { success: boolean; is_duplicate?: boolean; error?: string; paper?: QuestionPaper };
  if (!resultObj || resultObj.success === false) {
    const errMsg = resultObj?.error || 'RPC finalization transaction failed.';
    throw new Error(`Database Transaction Failure: ${errMsg}`);
  }

  const paperRow = resultObj.paper as QuestionPaper;

  // 4. READ-AFTER-WRITE VERIFICATION
  // Query PostgreSQL to verify the paper is readable by GET path. If read fails, return paperRow (transaction committed!).
  const verifiedRead = await getQuestionPaperById(paperRow.id);
  if (!verifiedRead) {
    console.warn(`[Read-After-Write Warning] Inserted paper ${paperRow.id} read check missed, returning transaction committed row directly.`);
    return paperRow;
  }

  return verifiedRead;
}

// ------------------------------------------------------------
// MUTATIONS & REPORTS
// ------------------------------------------------------------
export async function updateQuestionPaper(
  id: string,
  updates: Partial<QuestionPaper>
): Promise<QuestionPaper | null> {
  assertSupabaseConfigured();

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title) payload.title = updates.title;
  if (updates.subject_id) payload.subject_id = updates.subject_id;
  if (updates.exam_type_id) payload.exam_type_id = updates.exam_type_id;
  if (updates.mbbs_year) payload.mbbs_year = updates.mbbs_year;
  if (updates.exam_attempt) payload.exam_attempt = updates.exam_attempt;
  if (updates.exam_year) payload.exam_year = updates.exam_year;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.status) payload.status = updates.status;

  const { data, error } = await supabaseAdmin
    .from('question_papers')
    .update(payload)
    .eq('id', id)
    .select(
      `*,
      colleges(name),
      subjects(name),
      exam_types(name)`
    )
    .single();

  if (error) {
    console.error('[PaperMD DB Error] updateQuestionPaper failed:', error);
    throw new Error(`Database Update Error: ${error.message}`);
  }

  return data ? ({
    ...data,
    college_name: data.colleges?.name,
    subject_name: data.subjects?.name,
    exam_type_name: data.exam_types?.name,
    original_file_name: data.file_name || data.original_file_name || data.title || 'document.pdf',
    published_at: data.created_at,
  } as QuestionPaper) : null;
}

export async function incrementDownloadCount(id: string): Promise<boolean> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin.from('question_papers').select('download_count').eq('id', id).single();
  if (!error && data) {
    await supabaseAdmin
      .from('question_papers')
      .update({ download_count: (data.download_count || 0) + 1 })
      .eq('id', id);
    return true;
  }
  return false;
}

export async function deleteQuestionPaper(id: string): Promise<boolean> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('question_papers')
    .update({ status: 'removed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[PaperMD DB Error] deleteQuestionPaper failed:', error);
    throw new Error(`Database Delete Error: ${error.message}`);
  }

  if (data && data.storage_path && !data.storage_path.startsWith('mock/')) {
    await supabaseAdmin.storage.from('question-papers').remove([data.storage_path]);
  }
  return true;
}

export async function createReport(
  paperId: string,
  reason: PaperReport['reason'],
  description?: string
): Promise<PaperReport> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('reports')
    .insert({
      question_paper_id: paperId,
      reason,
      details: description || null,
      status: 'open',
    })
    .select(
      `*,
      question_papers(title, subjects(name))`
    )
    .single();

  if (error || !data) {
    console.error('[PaperMD DB Error] createReport failed:', error);
    throw new Error(`Database Report Error: ${error?.message || 'Failed to create report'}`);
  }

  const typedData = data as unknown as DbReportRow;
  return {
    id: typedData.id,
    paper_id: typedData.question_paper_id,
    reason: typedData.reason,
    description: typedData.details || undefined,
    status: typedData.status === 'open' ? 'pending' : (typedData.status as PaperReport['status']),
    created_at: typedData.created_at,
    resolved_at: typedData.resolved_at || undefined,
    paper_title: typedData.question_papers?.title || 'Question Paper',
    subject_name: typedData.question_papers?.subjects?.name || 'Subject',
  };
}

export async function getReports(): Promise<PaperReport[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('reports')
    .select(
      `*,
      question_papers(title, subjects(name))`
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PaperMD DB Error] getReports failed:', error);
    throw new Error(`Database Reports Error: ${error.message}`);
  }

  return (data as unknown as DbReportRow[] || []).map((r) => ({
    id: r.id,
    paper_id: r.question_paper_id,
    reason: r.reason,
    description: r.details || undefined,
    status: r.status === 'open' ? 'pending' : (r.status as PaperReport['status']),
    created_at: r.created_at,
    resolved_at: r.resolved_at || undefined,
    paper_title: r.question_papers?.title || 'Question Paper',
    subject_name: r.question_papers?.subjects?.name || 'Subject',
  }));
}

export async function resolveReport(
  id: string,
  status: 'resolved' | 'dismissed'
): Promise<PaperReport | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabaseAdmin
    .from('reports')
    .update({
      status,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      `*,
      question_papers(title, subjects(name))`
    )
    .single();

  if (error) {
    console.error('[PaperMD DB Error] resolveReport failed:', error);
    throw new Error(`Database Resolve Report Error: ${error.message}`);
  }

  return data ? {
    id: data.id,
    paper_id: data.question_paper_id,
    reason: data.reason,
    description: data.details,
    status: data.status,
    created_at: data.created_at,
    resolved_at: data.resolved_at,
    paper_title: data.question_papers?.title || 'Question Paper',
    subject_name: data.question_papers?.subjects?.name || 'Subject',
  } : null;
}

export async function getCoverageMatrix(
  years: number[] = [2023, 2024, 2025, 2026]
): Promise<CoverageMatrixItem[]> {
  const subjects = await getSubjects();
  const { papers } = await getQuestionPapers({ limit: 500 });

  return subjects.map((sub) => {
    const yearCoverage: Record<number, boolean> = {};
    let paperCount = 0;

    years.forEach((yr) => {
      const hasPaper = papers.some(
        (p) => p.subject_id === sub.id && p.exam_year === yr
      );
      yearCoverage[yr] = hasPaper;
      if (hasPaper) paperCount++;
    });

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      yearCoverage,
      paperCount,
    };
  });
}
