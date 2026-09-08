-- ============================================================
-- PaperMD — Production Supabase PostgreSQL Schema & Seed Data
-- ============================================================

-- Enable pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to maintain updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 1. COLLEGES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON colleges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 2. SUBJECTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_subject_per_college UNIQUE (college_id, name)
);

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------
-- 3. EXAM TYPES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. QUESTION PAPERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS question_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  additional_details TEXT,
  mbbs_year TEXT NOT NULL, -- '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final MBBS'
  exam_attempt TEXT NOT NULL DEFAULT 'Main Examination', -- 'Main Examination' | 'Supplementary Examination'
  exam_year INT NOT NULL,
  academic_year TEXT,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'image' | 'multi_image'
  file_size BIGINT NOT NULL,
  file_hash TEXT,
  page_count INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'removed'
  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_question_papers_updated_at
  BEFORE UPDATE ON question_papers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Performance Indexes for search & filtering
CREATE INDEX IF NOT EXISTS idx_qp_college ON question_papers(college_id);
CREATE INDEX IF NOT EXISTS idx_qp_subject ON question_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_qp_exam_type ON question_papers(exam_type_id);
CREATE INDEX IF NOT EXISTS idx_qp_exam_year ON question_papers(exam_year);
CREATE INDEX IF NOT EXISTS idx_qp_mbbs_year ON question_papers(mbbs_year);
CREATE INDEX IF NOT EXISTS idx_qp_exam_attempt ON question_papers(exam_attempt);
CREATE INDEX IF NOT EXISTS idx_qp_status ON question_papers(status);
CREATE INDEX IF NOT EXISTS idx_qp_file_hash ON question_papers(file_hash);
CREATE INDEX IF NOT EXISTS idx_qp_created_at ON question_papers(created_at DESC);

-- ------------------------------------------------------------
-- 5. REPORTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_paper_id UUID NOT NULL REFERENCES question_papers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL, -- 'wrong_subject' | 'wrong_year' | 'duplicate' | 'unreadable' | 'incomplete' | 'not_a_question_paper' | 'other'
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open' | 'resolved' | 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_qp_id ON reports(question_paper_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 1. Colleges RLS
CREATE POLICY "Public students can view active colleges"
  ON colleges FOR SELECT
  USING (is_active = true);

-- 2. Subjects RLS
CREATE POLICY "Public students can view active subjects"
  ON subjects FOR SELECT
  USING (is_active = true);

-- 3. Exam Types RLS
CREATE POLICY "Public students can view active exam types"
  ON exam_types FOR SELECT
  USING (is_active = true);

-- 4. Question Papers RLS (Public students can ONLY SELECT active papers)
CREATE POLICY "Public students can view active question papers"
  ON question_papers FOR SELECT
  USING (status = 'active');

-- Note: Anonymous direct INSERT/UPDATE/DELETE on question_papers is NOT allowed.
-- All contributions flow strictly through the application's server upload pipeline (/api/upload).

-- 5. Reports RLS
CREATE POLICY "Public students can read open reports"
  ON reports FOR SELECT
  USING (true);

-- ============================================================
-- INITIAL SEED DATA
-- ============================================================

-- Initial College
INSERT INTO colleges (id, name, code, description, is_active)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Government Medical College (GMC)',
  'GMC-MAIN',
  'Primary public medical institution for undergraduate and postgraduate medical education.',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Initial Core Exam Types
INSERT INTO exam_types (id, name, slug, description, is_active)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Internal Assessment', 'internal-assessment', 'Periodic term evaluation conducted by department faculty.', true),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Semester Examination', 'semester-examination', 'End-of-semester comprehensive theory examination paper.', true),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'University Examination', 'university-examination', 'Final university annual evaluation theory paper.', true),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Practical Examination', 'practical-examination', 'Spotting viva questions, OSPE, and clinical specimen question sheets.', true),
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Model Examination', 'model-examination', 'Pre-university preparatory trial examination paper.', true)
ON CONFLICT (name) DO NOTHING;

-- Initial 19 Canonical Medical Subjects for GMC
INSERT INTO subjects (id, college_id, name, slug, code, description, is_active)
VALUES
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Anatomy', 'anatomy', 'ANAT', 'Human gross anatomy, histology, embryology, and neuroanatomy.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Physiology', 'physiology', 'PHYS', 'Organ systems, cellular physiological processes, and nerve-muscle mechanisms.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Biochemistry', 'biochemistry', 'BIOC', 'Metabolic pathways, molecular biology, clinical biochemistry, and genetics.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pathology', 'pathology', 'PATH', 'General pathology, systemic pathology, hematology, and clinical pathology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pharmacology', 'pharmacology', 'PHAR', 'Autonomic, cardiovascular, antimicrobial therapeutics and clinical pharmacology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Microbiology', 'microbiology', 'MICR', 'Bacteriology, virology, mycology, parasitology, and immunology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Forensic Medicine and Toxicology', 'fmt', 'FMT', 'Forensic pathology, legal medicine, clinical toxicology, and medical jurisprudence.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Community Medicine', 'community-medicine', 'COMM', 'Epidemiology, public health, preventive medicine, and biostatistics.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ophthalmology', 'ophthalmology', 'OPHT', 'Ocular anatomy, refraction, cataract, glaucoma, and neuro-ophthalmology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Otorhinolaryngology (ENT)', 'ent', 'ENT', 'Diseases of ear, nose, throat, head and neck surgery.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General Medicine', 'general-medicine', 'MED', 'Internal medicine, cardiology, pulmonology, endocrinology, and critical care.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General Surgery', 'general-surgery', 'SURG', 'General surgical principles, trauma, gastrointestinal surgery, and urology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Obstetrics and Gynaecology', 'obgyn', 'OBGY', 'Antenatal care, labor management, high-risk pregnancy, and gynaecologic oncology.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Paediatrics', 'paediatrics', 'PAED', 'Childhood growth, development, neonatology, and paediatric infections.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Orthopaedics', 'orthopaedics', 'ORTH', 'Fractures, joint dislocations, bone tumors, and orthopaedic surgery.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dermatology, Venereology & Leprosy', 'dermatology', 'DVL', 'Skin disorders, sexually transmitted infections, and Hansen disease.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Psychiatry', 'psychiatry', 'PSYC', 'Mood disorders, psychosis, anxiety, addiction, and behavioral health.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Anaesthesiology', 'anaesthesiology', 'ANES', 'General and regional anaesthesia, airway management, and pain medicine.', true),
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Radiodiagnosis', 'radiodiagnosis', 'RADIO', 'X-rays, ultrasound, CT, MRI, and interventional radiology.', true)
ON CONFLICT (college_id, name) DO NOTHING;
