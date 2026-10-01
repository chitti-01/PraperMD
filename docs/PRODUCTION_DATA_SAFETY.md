# PaperMD — Production Data Safety & Architectural Integrity Guidelines

## 1. Overview & Core Philosophy
PaperMD is a production medical academic repository where uploaded question papers are permanent, high-value assets. To ensure zero silent data loss, the architecture enforces strict boundaries between Supabase Storage and PostgreSQL metadata.

---

## 2. Database Architecture & Schema Safeguards
- **Primary Entities:** `colleges`, `subjects`, `exam_types`, `question_papers`, `upload_intents`, `reports`.
- **Integrity Indexing:**
  - Partial Unique Index `idx_qp_unique_active_hash` on `question_papers(file_hash) WHERE status = 'active' AND file_hash IS NOT NULL`.
  - Durable Idempotency Index `idx_upload_intents_key` on `upload_intents(idempotency_key)`.
- **Foreign Key Rules:** `question_papers` references `colleges(id)`, `subjects(id)`, and `exam_types(id)` with `ON DELETE RESTRICT` to prevent orphan metadata cascades.

---

## 3. Storage Architecture
- **Bucket:** `question-papers` (Private access only).
- **Access Protocol:** Authenticated Signed URLs (`supabaseAdmin.storage.from('question-papers').createSignedUrl(path, 3600)`).
- **Path Standard:** Canonical path format: `${college_id}/${intent_id}_${file_name}`.

---

## 4. Two-Step Atomic Upload Lifecycle & State Machine
The upload pipeline eliminates race conditions and unlinked storage files:

1. **Step 1: Upload Initiation (`POST /api/upload/init`)**
   - Calculates SHA-256 hash client-side.
   - Checks for duplicate active hashes (`checkDuplicateHash`). Returns HTTP 409 Conflict if found.
   - Inserts durable `upload_intents` row in status `UPLOADING`.
   - Returns Supabase Storage signed upload URL.

2. **Step 2: Storage Binary Transfer**
   - Browser/Client uploads binary payload directly to Supabase Storage signed upload URL.

3. **Step 3: Atomic Finalization Transaction (`POST /api/upload/complete`)**
   - Verifies file presence and byte size in Supabase Storage (`verifyStorageObject`).
   - Calls PostgreSQL RPC function `finalize_paper_transaction(p_intent_id)`.
   - RPC acquires row lock (`FOR UPDATE`) on intent row, inserts into `question_papers`, sets status to `'active'`, and updates intent status to `'READY'`.
   - Executes Read-After-Write verification (`getQuestionPaperById`) before responding to client.

---

## 5. Storage / Database Non-Atomicity & Partial Failure Protocols

| Scenario | Storage State | Database State | Intent Status | System Action & Recovery |
| :--- | :--- | :--- | :--- | :--- |
| **Case A (Success)** | Binary Uploaded | Row Inserted (`active`) | `READY` | Paper published & retrievable. |
| **Case B (DB Fail)** | Binary Uploaded | Insert Failed | `FAILED` | Intent records error message. Binary preserved for diagnostic review. |
| **Case C (Storage Fail)** | Upload Failed / Missing | No Row Inserted | `FAILED` | RPC aborts transaction; 0 `question_papers` rows created. |
| **Case D (Invalid State)** | File Missing in Storage | DB Row Present | N/A | Caught by Read-Only Diagnostic (`verify_data_integrity.ts`). |

---

## 6. Elimination of Silent Fallbacks & Outage Masking
- **Zero Fake PDFs:** Download route (`/api/papers/[id]/download`) returns HTTP 500 explicit JSON error if signed URL generation fails or storage object is missing. Development mock PDFs are strictly restricted to `NODE_ENV === 'development'` when Supabase is unconfigured.
- **Zero Mock Metadata Fallbacks:** `getColleges()`, `getSubjects()`, `getExamTypes()` throw explicit `Database Error` on PostgreSQL query failure when Supabase is configured.
- **Explicit Database Outage Status:** API routes (`/api/papers`) return HTTP 500 with diagnostic message `Database query failure` rather than returning empty `[]` arrays.

---

## 7. Migration & Maintenance Safety Rules
- **Prohibited Operations:**
  - `DROP TABLE` or `TRUNCATE` on production tables.
  - Automatic deletion or renaming of orphan storage objects.
  - Re-seeding canonical UUIDs in a manner that breaks foreign keys.
- **Additive Migrations:** All schema changes must be safe against existing production data.

---

## 8. Diagnostic & Verification Procedures
Run read-only data integrity verification at any time:
```bash
npx tsx scripts/verify_data_integrity.ts
```
Run live end-to-end pipeline verification:
```bash
npx tsx scripts/run_e2e_test.ts
```
