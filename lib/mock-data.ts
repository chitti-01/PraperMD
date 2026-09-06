import { College, Subject, ExamType, QuestionPaper, PaperReport } from './types';

export const INITIAL_COLLEGE: College = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Government Medical College (GMC)',
  code: 'GMC-MAIN',
  description: 'Primary public medical institution for undergraduate and postgraduate medical education.',
  is_active: true,
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date('2025-01-01').toISOString(),
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Anatomy',
    slug: 'anatomy',
    description: 'Human gross anatomy, histology, embryology, and neuroanatomy.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Physiology',
    slug: 'physiology',
    description: 'Organ systems, cellular physiological processes, and nerve-muscle mechanisms.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Biochemistry',
    slug: 'biochemistry',
    description: 'Metabolic pathways, molecular biology, clinical biochemistry, and genetics.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Pathology',
    slug: 'pathology',
    description: 'General pathology, systemic pathology, hematology, and clinical pathology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Pharmacology',
    slug: 'pharmacology',
    description: 'Autonomic, cardiovascular, antimicrobial therapeutics and clinical pharmacology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Microbiology',
    slug: 'microbiology',
    description: 'Bacteriology, virology, mycology, parasitology, and immunology.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'General Medicine',
    slug: 'general-medicine',
    description: 'Internal medicine, cardiology, pulmonology, endocrinology, and critical care.',
    is_active: true,
    created_at: new Date('2025-01-01').toISOString(),
    updated_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a08',
    college_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
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
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    name: 'Internal Assessment',
    slug: 'internal-assessment',
    description: 'Periodic term evaluation conducted by department faculty.',
    is_active: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    name: 'Semester Examination',
    slug: 'semester-examination',
    description: 'End-of-semester comprehensive theory examination paper.',
    is_active: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    name: 'University Examination',
    slug: 'university-examination',
    description: 'Final university annual evaluation theory paper.',
    is_active: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    name: 'Practical Examination',
    slug: 'practical-examination',
    description: 'Spotting viva questions, OSPE, and clinical specimen question sheets.',
    is_active: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05',
    name: 'Model Examination',
    slug: 'model-examination',
    description: 'Pre-university preparatory trial examination paper.',
    is_active: true,
  },
];

export const INITIAL_QUESTION_PAPERS: QuestionPaper[] = [];

export const INITIAL_REPORTS: PaperReport[] = [];
