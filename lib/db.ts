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
  INITIAL_QUESTION_PAPERS,
  INITIAL_REPORTS,
} from './mock-data';
import { supabase } from './supabase/client';
import { supabaseAdmin } from './supabase/admin';

// In-Memory state store for development fallback when Supabase is unconfigured
const memoryColleges: College[] = [INITIAL_COLLEGE];
const memorySubjects: Subject[] = [...INITIAL_SUBJECTS];
const memoryExamTypes: ExamType[] = [...INITIAL_EXAM_TYPES];
const memoryPapers: QuestionPaper[] = [...INITIAL_QUESTION_PAPERS];
const memoryReports: PaperReport[] = [...INITIAL_REPORTS];

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

const isProduction = process.env.NODE_ENV === 'production';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes('xyz-medico.supabase.co'));
}

function enforceProductionDbGuard() {
  if (isProduction && !isSupabaseConfigured()) {
    throw new Error(
      'Production Database Error: Valid Supabase configuration (NEXT_PUBLIC_SUPABASE_URL) is required in production environment.'
    );
  }
}

// ------------------------------------------------------------
// METADATA READS
// ------------------------------------------------------------
export async function getColleges(): Promise<College[]> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data && data.length > 0) {
      return data as College[];
    }
  }
  return memoryColleges;
}

export async function getSubjects(): Promise<Subject[]> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data && data.length > 0) {
      return data as Subject[];
    }
  }
  return memorySubjects.filter((s) => s.is_active);
}

export async function getExamTypes(): Promise<ExamType[]> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('exam_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data && data.length > 0) {
      return data as ExamType[];
    }
  }
  return memoryExamTypes.filter((e) => e.is_active);
}

// ------------------------------------------------------------
// QUESTION PAPERS READ & SEARCH
// ------------------------------------------------------------
export async function getQuestionPapers(params: PaperFilterParams = {}): Promise<{
  papers: QuestionPaper[];
  total: number;
}> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
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
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (params.limit && params.offset !== undefined) {
      query = query.range(params.offset, params.offset + params.limit - 1);
    } else if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      const formattedPapers: QuestionPaper[] = (data as DbPaperRow[]).map((p) => ({
        ...p,
        college_name: p.colleges?.name,
        subject_name: p.subjects?.name,
        exam_type_name: p.exam_types?.name,
        original_file_name: p.file_name || p.original_file_name || p.title || 'document.pdf',
        published_at: p.created_at,
      }));
      return { papers: formattedPapers, total: count || formattedPapers.length };
    }
  }

  // Local Memory Fallback
  let result = memoryPapers.filter((p) => p.status === 'active');

  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.subject_name && p.subject_name.toLowerCase().includes(q)) ||
        (p.exam_type_name && p.exam_type_name.toLowerCase().includes(q)) ||
        p.exam_year.toString().includes(q) ||
        p.mbbs_year.toLowerCase().includes(q)
    );
  }

  if (params.subjectId) result = result.filter((p) => p.subject_id === params.subjectId);
  if (params.examTypeId) result = result.filter((p) => p.exam_type_id === params.examTypeId);
  if (params.mbbsYear) result = result.filter((p) => p.mbbs_year === params.mbbsYear);
  if (params.examYear) result = result.filter((p) => p.exam_year === Number(params.examYear));
  if (params.collegeId) result = result.filter((p) => p.college_id === params.collegeId);

  if (params.sortBy === 'views') {
    result.sort((a, b) => b.view_count - a.view_count);
  } else if (params.sortBy === 'downloads') {
    result.sort((a, b) => b.download_count - a.download_count);
  } else {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const total = result.length;
  if (params.limit && params.offset !== undefined) {
    result = result.slice(params.offset, params.offset + params.limit);
  } else if (params.limit) {
    result = result.slice(0, params.limit);
  }

  return { papers: result, total };
}

export async function getQuestionPaperById(id: string): Promise<QuestionPaper | null> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseAdmin
      .from('question_papers')
      .select(
        `*,
        colleges!inner(name),
        subjects!inner(name),
        exam_types!inner(name)`
      )
      .eq('id', id)
      .single();

    if (!error && data) {
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
  }

  const paper = memoryPapers.find((p) => p.id === id);
  if (paper) {
    paper.view_count += 1;
    return paper;
  }
  return null;
}

export async function checkDuplicateHash(fileHash: string): Promise<QuestionPaper | null> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data } = await supabaseAdmin
      .from('question_papers')
      .select('*')
      .eq('file_hash', fileHash)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      return {
        ...data,
        original_file_name: data.file_name,
        published_at: data.created_at,
      } as QuestionPaper;
    }
    return null;
  }

  const existing = memoryPapers.find((p) => p.file_hash === fileHash && p.status === 'active');
  return existing || null;
}

// ------------------------------------------------------------
// QUESTION PAPERS MUTATIONS
// ------------------------------------------------------------
export async function createQuestionPaper(
  paperData: Omit<
    QuestionPaper,
    'id' | 'created_at' | 'updated_at' | 'published_at' | 'view_count' | 'download_count' | 'status'
  >
): Promise<QuestionPaper> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const payload = {
      college_id: paperData.college_id,
      subject_id: paperData.subject_id,
      exam_type_id: paperData.exam_type_id,
      title: paperData.title,
      description: paperData.description || null,
      mbbs_year: paperData.mbbs_year,
      semester: paperData.semester || null,
      exam_year: paperData.exam_year,
      academic_year: paperData.academic_year || null,
      storage_path: paperData.storage_path,
      file_name: paperData.original_file_name || 'document.pdf',
      file_type: paperData.file_type,
      file_size: paperData.file_size,
      file_hash: paperData.file_hash,
      page_count: paperData.page_count || 1,
      status: 'active',
    };

    const { data, error } = await supabaseAdmin
      .from('question_papers')
      .insert(payload)
      .select(
        `*,
        colleges(name),
        subjects(name),
        exam_types(name)`
      )
      .single();

    if (error || !data) {
      const isTableMissing = error?.message?.includes('schema cache') || error?.message?.includes('Could not find the table') || error?.code === 'PGRST205';
      const isFkError = error?.code === '23503' || error?.message?.includes('foreign key');

      if (!isProduction && (isTableMissing || isFkError)) {
        console.warn(
          `[PaperMD Dev Warning] Supabase table or relation missing (${error?.message}). Falling back to local memory storage for upload.`
        );
      } else if (isProduction && isTableMissing) {
        throw new Error(
          "Database Schema Error: Table 'question_papers' does not exist in your Supabase database. Please execute the SQL migration script in supabase/schema.sql in your Supabase SQL Editor."
        );
      } else if (isProduction && isFkError) {
        throw new Error(
          "Database Seed Error: Referenced medical college or subject ID does not exist in Supabase PostgreSQL. Please execute the initial seed script in supabase/schema.sql."
        );
      } else {
        throw new Error(`Database Error: ${error?.message || 'Failed to insert question paper metadata'}`);
      }
    } else {
      return {
        ...data,
        college_name: data.colleges?.name,
        subject_name: data.subjects?.name,
        exam_type_name: data.exam_types?.name,
        original_file_name: data.file_name || data.original_file_name || data.title || 'document.pdf',
        published_at: data.created_at,
      } as QuestionPaper;
    }
  }

  const subject = memorySubjects.find((s) => s.id === paperData.subject_id);
  const examType = memoryExamTypes.find((e) => e.id === paperData.exam_type_id);
  const college = memoryColleges.find((c) => c.id === paperData.college_id) || INITIAL_COLLEGE;

  const now = new Date().toISOString();
  const newPaper: QuestionPaper = {
    ...paperData,
    id: `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'active',
    view_count: 0,
    download_count: 0,
    created_at: now,
    updated_at: now,
    published_at: now,
    subject_name: subject?.name || 'Medical Subject',
    exam_type_name: examType?.name || 'Examination',
    college_name: college.name,
  };

  memoryPapers.unshift(newPaper);
  return newPaper;
}

export async function updateQuestionPaper(
  id: string,
  updates: Partial<QuestionPaper>
): Promise<QuestionPaper | null> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title) payload.title = updates.title;
    if (updates.subject_id) payload.subject_id = updates.subject_id;
    if (updates.exam_type_id) payload.exam_type_id = updates.exam_type_id;
    if (updates.mbbs_year) payload.mbbs_year = updates.mbbs_year;
    if (updates.semester !== undefined) payload.semester = updates.semester;
    if (updates.exam_year) payload.exam_year = updates.exam_year;
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

    if (!error && data) {
      return {
        ...data,
        college_name: data.colleges?.name,
        subject_name: data.subjects?.name,
        exam_type_name: data.exam_types?.name,
        original_file_name: data.file_name || data.original_file_name || data.title || 'document.pdf',
        published_at: data.created_at,
      } as QuestionPaper;
    }
  }

  const index = memoryPapers.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = memoryPapers[index];
  const updated: QuestionPaper = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  memoryPapers[index] = updated;
  return updated;
}

export async function incrementDownloadCount(id: string): Promise<boolean> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data } = await supabaseAdmin.from('question_papers').select('download_count').eq('id', id).single();
    if (data) {
      await supabaseAdmin
        .from('question_papers')
        .update({ download_count: (data.download_count || 0) + 1 })
        .eq('id', id);
      return true;
    }
  }

  const paper = memoryPapers.find((p) => p.id === id);
  if (paper) {
    paper.download_count += 1;
    return true;
  }
  return false;
}

export async function deleteQuestionPaper(id: string): Promise<boolean> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data } = await supabaseAdmin
      .from('question_papers')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (data) {
      // Clean up storage object if present
      if (data.storage_path && !data.storage_path.startsWith('mock/')) {
        await supabaseAdmin.storage.from('question-papers').remove([data.storage_path]);
      }
      return true;
    }
  }

  const paper = memoryPapers.find((p) => p.id === id);
  if (paper) {
    paper.status = 'removed';
    paper.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

// ------------------------------------------------------------
// REPORTS READ & MUTATIONS
// ------------------------------------------------------------
export async function createReport(
  paperId: string,
  reason: PaperReport['reason'],
  description?: string
): Promise<PaperReport> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
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

    if (!error && data) {
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
  }

  const paper = memoryPapers.find((p) => p.id === paperId);
  const newReport: PaperReport = {
    id: `rep-${Date.now()}`,
    paper_id: paperId,
    reason,
    description,
    status: 'pending',
    created_at: new Date().toISOString(),
    paper_title: paper?.title || 'Question Paper',
    subject_name: paper?.subject_name || 'Subject',
  };

  memoryReports.unshift(newReport);
  return newReport;
}

export async function getReports(): Promise<PaperReport[]> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select(
        `*,
        question_papers(title, subjects(name))`
      )
      .order('created_at', { ascending: false });

    if (!error && data) {
      return (data as unknown as DbReportRow[]).map((r) => ({
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
  }
  return memoryReports;
}

export async function resolveReport(
  id: string,
  status: 'resolved' | 'dismissed'
): Promise<PaperReport | null> {
  enforceProductionDbGuard();
  if (isSupabaseConfigured()) {
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

    if (!error && data) {
      return {
        id: data.id,
        paper_id: data.question_paper_id,
        reason: data.reason,
        description: data.details,
        status: data.status,
        created_at: data.created_at,
        resolved_at: data.resolved_at,
        paper_title: data.question_papers?.title || 'Question Paper',
        subject_name: data.question_papers?.subjects?.name || 'Subject',
      };
    }
  }

  const report = memoryReports.find((r) => r.id === id);
  if (report) {
    report.status = status;
    report.resolved_at = new Date().toISOString();
    return report;
  }
  return null;
}

// ------------------------------------------------------------
// REPOSITORY COVERAGE MATRIX
// ------------------------------------------------------------
export async function getCoverageMatrix(
  years: number[] = [2023, 2024, 2025, 2026]
): Promise<CoverageMatrixItem[]> {
  enforceProductionDbGuard();
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
