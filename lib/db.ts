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

// In-Memory state store for development fallback
let memoryColleges: College[] = [INITIAL_COLLEGE];
let memorySubjects: Subject[] = [...INITIAL_SUBJECTS];
let memoryExamTypes: ExamType[] = [...INITIAL_EXAM_TYPES];
let memoryPapers: QuestionPaper[] = [...INITIAL_QUESTION_PAPERS];
let memoryReports: PaperReport[] = [...INITIAL_REPORTS];

export async function getColleges(): Promise<College[]> {
  return memoryColleges;
}

export async function getSubjects(): Promise<Subject[]> {
  return memorySubjects.filter((s) => s.is_active);
}

export async function getExamTypes(): Promise<ExamType[]> {
  return memoryExamTypes.filter((e) => e.is_active);
}

export async function getQuestionPapers(params: PaperFilterParams = {}): Promise<{
  papers: QuestionPaper[];
  total: number;
}> {
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

  if (params.subjectId) {
    result = result.filter((p) => p.subject_id === params.subjectId);
  }

  if (params.examTypeId) {
    result = result.filter((p) => p.exam_type_id === params.examTypeId);
  }

  if (params.mbbsYear) {
    result = result.filter((p) => p.mbbs_year === params.mbbsYear);
  }

  if (params.examYear) {
    result = result.filter((p) => p.exam_year === Number(params.examYear));
  }

  if (params.collegeId) {
    result = result.filter((p) => p.college_id === params.collegeId);
  }

  // Sort
  if (params.sortBy === 'views') {
    result.sort((a, b) => b.view_count - a.view_count);
  } else if (params.sortBy === 'downloads') {
    result.sort((a, b) => b.download_count - a.download_count);
  } else {
    // Default: latest created_at or exam_year
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
  const paper = memoryPapers.find((p) => p.id === id);
  if (!paper) return null;

  // Increment view count
  paper.view_count += 1;
  return paper;
}

export async function checkDuplicateHash(fileHash: string): Promise<QuestionPaper | null> {
  const existing = memoryPapers.find(
    (p) => p.file_hash === fileHash && p.status === 'active'
  );
  return existing || null;
}

export async function createQuestionPaper(
  paperData: Omit<QuestionPaper, 'id' | 'created_at' | 'updated_at' | 'published_at' | 'view_count' | 'download_count' | 'status'>
): Promise<QuestionPaper> {
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
  const index = memoryPapers.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = memoryPapers[index];
  const updated: QuestionPaper = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Re-resolve metadata names if changed
  if (updates.subject_id) {
    const sub = memorySubjects.find((s) => s.id === updates.subject_id);
    if (sub) updated.subject_name = sub.name;
  }
  if (updates.exam_type_id) {
    const exam = memoryExamTypes.find((e) => e.id === updates.exam_type_id);
    if (exam) updated.exam_type_name = exam.name;
  }

  memoryPapers[index] = updated;
  return updated;
}

export async function incrementDownloadCount(id: string): Promise<boolean> {
  const paper = memoryPapers.find((p) => p.id === id);
  if (paper) {
    paper.download_count += 1;
    return true;
  }
  return false;
}

export async function deleteQuestionPaper(id: string): Promise<boolean> {
  const paper = memoryPapers.find((p) => p.id === id);
  if (paper) {
    paper.status = 'removed';
    paper.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function createReport(
  paperId: string,
  reason: PaperReport['reason'],
  description?: string
): Promise<PaperReport> {
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
  return memoryReports;
}

export async function resolveReport(id: string, status: 'resolved' | 'dismissed'): Promise<PaperReport | null> {
  const report = memoryReports.find((r) => r.id === id);
  if (report) {
    report.status = status;
    report.resolved_at = new Date().toISOString();
    return report;
  }
  return null;
}

export async function getCoverageMatrix(years: number[] = [2023, 2024, 2025, 2026]): Promise<CoverageMatrixItem[]> {
  const subjects = memorySubjects.filter((s) => s.is_active);
  const activePapers = memoryPapers.filter((p) => p.status === 'active');

  return subjects.map((sub) => {
    const yearCoverage: Record<number, boolean> = {};
    let paperCount = 0;

    years.forEach((yr) => {
      const hasPaper = activePapers.some(
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
