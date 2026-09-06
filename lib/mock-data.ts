import { College, Subject, ExamType, QuestionPaper, PaperReport } from './types';

export const INITIAL_COLLEGE: College = {
  id: 'col-gmc-01',
  name: 'Government Medical College (GMC)',
  code: 'GMC-MAIN',
  description: 'Primary public medical institution for undergraduate and postgraduate medical education.',
  is_active: true,
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date('2025-01-01').toISOString(),
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-anat-01',
    college_id: 'col-gmc-01',
    name: 'Anatomy',
    slug: 'anatomy',
    description: 'Human gross anatomy, histology, embryology, and neuroanatomy.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-phys-02',
    college_id: 'col-gmc-01',
    name: 'Physiology',
    slug: 'physiology',
    description: 'Organ systems, cellular physiological processes, and nerve-muscle mechanisms.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-bioc-03',
    college_id: 'col-gmc-01',
    name: 'Biochemistry',
    slug: 'biochemistry',
    description: 'Metabolic pathways, molecular biology, clinical biochemistry, and genetics.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-path-04',
    college_id: 'col-gmc-01',
    name: 'Pathology',
    slug: 'pathology',
    description: 'General pathology, systemic pathology, hematology, and clinical pathology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-phar-05',
    college_id: 'col-gmc-01',
    name: 'Pharmacology',
    slug: 'pharmacology',
    description: 'Autonomic, cardiovascular, antimicrobial therapeutics and clinical pharmacology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-micr-06',
    college_id: 'col-gmc-01',
    name: 'Microbiology',
    slug: 'microbiology',
    description: 'Bacteriology, virology, mycology, parasitology, and immunology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-med-07',
    college_id: 'col-gmc-01',
    name: 'General Medicine',
    slug: 'general-medicine',
    description: 'Internal medicine, cardiology, pulmonology, endocrinology, and critical care.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'sub-surg-08',
    college_id: 'col-gmc-01',
    name: 'General Surgery',
    slug: 'general-surgery',
    description: 'General surgical principles, trauma, gastrointestinal surgery, and urology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
];

export const INITIAL_EXAM_TYPES: ExamType[] = [
  {
    id: 'exam-ia-01',
    name: 'Internal Assessment',
    slug: 'internal-assessment',
    description: 'Periodic term evaluation conducted by department faculty.',
    is_active: true,
  },
  {
    id: 'exam-sem-02',
    name: 'Semester Examination',
    slug: 'semester-examination',
    description: 'End-of-semester comprehensive theory examination paper.',
    is_active: true,
  },
  {
    id: 'exam-univ-03',
    name: 'University Examination',
    slug: 'university-examination',
    description: 'Final university annual evaluation theory paper.',
    is_active: true,
  },
  {
    id: 'exam-prac-04',
    name: 'Practical Examination',
    slug: 'practical-examination',
    description: 'Spotting viva questions, OSPE, and clinical specimen question sheets.',
    is_active: true,
  },
  {
    id: 'exam-mod-05',
    name: 'Model Examination',
    slug: 'model-examination',
    description: 'Pre-university preparatory trial examination paper.',
    is_active: true,
  },
];

export const INITIAL_QUESTION_PAPERS: QuestionPaper[] = [];

export const INITIAL_REPORTS: PaperReport[] = [];
