export interface College {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  college_id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamType {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export type MBBSYear = '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final MBBS';

export type ExamAttempt = 'Main Examination' | 'Supplementary Examination';

export type PaperStatus = 'active' | 'removed';

export interface QuestionPaper {
  id: string;
  college_id: string;
  subject_id: string;
  exam_type_id: string;
  mbbs_year: MBBSYear;
  exam_attempt: ExamAttempt;
  exam_year: number;
  academic_year?: string;
  title: string;
  description?: string;
  storage_path: string;
  file_type: 'pdf' | 'image' | 'multi_image';
  file_size: number;
  file_hash: string;
  original_file_name: string;
  page_count: number;
  status: PaperStatus;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  // Joined relation fields for UI rendering
  college_name?: string;
  subject_name?: string;
  exam_type_name?: string;
}

export type ReportReason =
  | 'wrong_subject'
  | 'wrong_year'
  | 'duplicate'
  | 'unreadable'
  | 'incomplete'
  | 'not_a_question_paper'
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface PaperReport {
  id: string;
  paper_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: string;
  resolved_at?: string;
  paper_title?: string;
  subject_name?: string;
}

export interface PaperFilterParams {
  query?: string;
  subjectId?: string;
  examTypeId?: string;
  mbbsYear?: string;
  examAttempt?: string;
  examYear?: number;
  collegeId?: string;
  sortBy?: 'latest' | 'views' | 'downloads' | 'oldest';
  limit?: number;
  offset?: number;
}

export interface CoverageMatrixItem {
  subjectId: string;
  subjectName: string;
  yearCoverage: Record<number, boolean>;
  paperCount: number;
}
