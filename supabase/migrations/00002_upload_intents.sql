-- ============================================================
-- PaperMD Migration 00002: Durable Upload Intents, DB Uniqueness & RPC Atomic Transaction
-- ============================================================

-- 1. Database-Level Unique Constraint for Active Paper SHA-256 Hashes
-- Prevents race conditions and guarantees no simultaneous identical uploads create duplicate papers at PostgreSQL level
CREATE UNIQUE INDEX IF NOT EXISTS idx_qp_unique_active_hash 
  ON question_papers(file_hash) 
  WHERE status = 'active' AND file_hash IS NOT NULL;

-- 2. Durable Upload Intents Table
CREATE TABLE IF NOT EXISTS upload_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT UNIQUE NOT NULL,
  college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  exam_type_id UUID NOT NULL REFERENCES exam_types(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  mbbs_year TEXT NOT NULL,
  exam_attempt TEXT NOT NULL DEFAULT 'Main Examination',
  exam_year INT NOT NULL,
  academic_year TEXT,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_hash TEXT NOT NULL,
  page_count INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'UPLOADING', -- 'UPLOADING' | 'STORAGE_UPLOADED' | 'VERIFYING' | 'READY' | 'FAILED'
  error_message TEXT,
  question_paper_id UUID REFERENCES question_papers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_upload_intent_status CHECK (status IN ('UPLOADING', 'STORAGE_UPLOADED', 'VERIFYING', 'READY', 'FAILED')),
  CONSTRAINT check_upload_intent_mbbs_year CHECK (mbbs_year IN ('1st MBBS', '2nd MBBS', '3rd MBBS', 'Final MBBS')),
  CONSTRAINT check_upload_intent_file_type CHECK (file_type IN ('pdf', 'image', 'multi_image'))
);

DROP TRIGGER IF EXISTS update_upload_intents_updated_at ON upload_intents;
CREATE TRIGGER update_upload_intents_updated_at
  BEFORE UPDATE ON upload_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_upload_intents_key ON upload_intents(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_upload_intents_hash ON upload_intents(file_hash);
CREATE INDEX IF NOT EXISTS idx_upload_intents_status ON upload_intents(status);

-- 3. Strict Row Level Security (RLS) for upload_intents
-- Restricted ONLY to service_role (server-side admin key). Public/anon access is completely revoked.
ALTER TABLE upload_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public students can view active upload intents" ON upload_intents;
DROP POLICY IF EXISTS "Service role manages upload intents" ON upload_intents;
DROP POLICY IF EXISTS "Only service role can manage upload intents" ON upload_intents;

CREATE POLICY "Only service role can manage upload intents"
  ON upload_intents FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. PostgreSQL Atomic Finalization Transaction Function (RPC)
-- Executes intent validation, paper row creation, and intent status finalization inside a single database transaction.
CREATE OR REPLACE FUNCTION finalize_paper_transaction(p_intent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_intent upload_intents%ROWTYPE;
  v_paper_id UUID;
  v_paper_row question_papers%ROWTYPE;
BEGIN
  -- Lock intent row FOR UPDATE to prevent race conditions
  SELECT * INTO v_intent
  FROM upload_intents
  WHERE id = p_intent_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', format('Upload Intent %s not found', p_intent_id));
  END IF;

  IF v_intent.status = 'READY' AND v_intent.question_paper_id IS NOT NULL THEN
    -- Already finalized (Idempotent return)
    SELECT * INTO v_paper_row FROM question_papers WHERE id = v_intent.question_paper_id;
    RETURN jsonb_build_object('success', true, 'is_duplicate', false, 'paper', to_jsonb(v_paper_row));
  END IF;

  IF v_intent.status = 'FAILED' THEN
    RETURN jsonb_build_object('success', false, 'error', format('Cannot finalize upload intent %s: intent is in FAILED state', p_intent_id));
  END IF;

  IF v_intent.status NOT IN ('UPLOADING', 'STORAGE_UPLOADED', 'VERIFYING') THEN
    RETURN jsonb_build_object('success', false, 'error', format('Invalid state transition for upload intent %s from status %s', p_intent_id, v_intent.status));
  END IF;

  -- Insert into question_papers
  INSERT INTO question_papers (
    college_id,
    subject_id,
    exam_type_id,
    title,
    description,
    mbbs_year,
    exam_attempt,
    exam_year,
    academic_year,
    storage_path,
    file_name,
    file_type,
    file_size,
    file_hash,
    page_count,
    status
  ) VALUES (
    v_intent.college_id,
    v_intent.subject_id,
    v_intent.exam_type_id,
    v_intent.title,
    v_intent.description,
    v_intent.mbbs_year,
    v_intent.exam_attempt,
    v_intent.exam_year,
    v_intent.academic_year,
    v_intent.storage_path,
    v_intent.file_name,
    v_intent.file_type,
    v_intent.file_size,
    v_intent.file_hash,
    v_intent.page_count,
    'active'
  )
  RETURNING * INTO v_paper_row;

  -- Update upload intent to READY
  UPDATE upload_intents
  SET status = 'READY',
      question_paper_id = v_paper_row.id,
      error_message = NULL,
      updated_at = NOW()
  WHERE id = p_intent_id;

  RETURN jsonb_build_object('success', true, 'is_duplicate', false, 'paper', to_jsonb(v_paper_row));

EXCEPTION
  WHEN unique_violation THEN
    -- Race condition: Concurrent transaction inserted active paper with same SHA-256 file_hash
    SELECT * INTO v_paper_row 
    FROM question_papers 
    WHERE file_hash = v_intent.file_hash AND status = 'active' 
    LIMIT 1;

    IF FOUND THEN
      UPDATE upload_intents
      SET status = 'READY',
          question_paper_id = v_paper_row.id,
          error_message = NULL,
          updated_at = NOW()
      WHERE id = p_intent_id;

      RETURN jsonb_build_object('success', true, 'is_duplicate', true, 'paper', to_jsonb(v_paper_row));
    ELSE
      UPDATE upload_intents
      SET status = 'FAILED',
          error_message = 'Duplicate active paper constraint violation.',
          updated_at = NOW()
      WHERE id = p_intent_id;

      RETURN jsonb_build_object('success', false, 'error', 'Duplicate active paper constraint violation.');
    END IF;

  WHEN OTHERS THEN
    -- Durably mark intent as FAILED and return explicit JSON error (commits status update!)
    UPDATE upload_intents
    SET status = 'FAILED',
        error_message = SQLERRM,
        updated_at = NOW()
    WHERE id = p_intent_id;

    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Explicit RPC execution security: REVOKE from public/anon/authenticated; GRANT strictly to service_role
REVOKE EXECUTE ON FUNCTION finalize_paper_transaction(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION finalize_paper_transaction(UUID) TO service_role;
