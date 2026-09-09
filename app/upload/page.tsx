'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Subject, ExamType, QuestionPaper } from '@/lib/types';
import MultiFileUpload from '@/components/MultiFileUpload';
import { compressImageFile, calculateClientFileHash } from '@/lib/image-optimizer';
import { CheckCircle2, AlertTriangle, ArrowRight, Upload, FileText, Camera } from 'lucide-react';

export default function UploadPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);

  const [method, setMethod] = useState<'scan' | 'file'>('file');

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examTypeId, setExamTypeId] = useState('');
  const [mbbsYear, setMbbsYear] = useState('1st MBBS');
  const [examAttempt, setExamAttempt] = useState<'Main Examination' | 'Supplementary Examination'>('Main Examination');
  const [examYear, setExamYear] = useState('2026');
  const [academicYear] = useState('2025-2026');
  const [description, setDescription] = useState('');

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [duplicateAlert, setDuplicateAlert] = useState<{ message: string; existingPaperId?: string } | null>(null);
  const [publishedPaper, setPublishedPaper] = useState<QuestionPaper | null>(null);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/api/metadata');
        const data = await res.json();
        setSubjects(data.subjects || []);
        setExamTypes(data.examTypes || []);
        if (data.subjects && data.subjects.length > 0) {
          setSubjectId(data.subjects[0].id);
        }
        if (data.examTypes && data.examTypes.length > 0) {
          setExamTypeId(data.examTypes[0].id);
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }

    loadMetadata();
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setError('');
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDuplicateAlert(null);

    if (files.length === 0) {
      setError('Please select at least one PDF or image file.');
      return;
    }

    // Pre-upload file size validation (max 50MB per file)
    const MAX_MB = 50;
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    if (totalBytes > MAX_MB * 1024 * 1024) {
      setError(`Total upload size (${(totalBytes / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum ${MAX_MB}MB limit. Please compress your PDF or select fewer pages.`);
      return;
    }

    setSubmitting(true);
    setStatusMessage('Preparing & optimizing document...');

    try {
      // 1. Client-Side Image Compression & Hash Calculation
      const primaryFile = files[0];
      let processedFile = primaryFile;

      if (primaryFile.type.startsWith('image/')) {
        setStatusMessage('Compressing image for legibility...');
        processedFile = await compressImageFile(primaryFile, 2000, 0.82);
      }

      setStatusMessage('Checking for duplicate papers...');
      const fileHash = await calculateClientFileHash(processedFile);

      // 2. Initialize Direct Upload API Request
      setStatusMessage('Initializing secure upload...');
      const initRes = await fetch('/api/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject_id: subjectId,
          exam_type_id: examTypeId,
          mbbs_year: mbbsYear,
          exam_attempt: examAttempt,
          exam_year: Number(examYear),
          academic_year: academicYear,
          description,
          file_name: processedFile.name,
          file_size: processedFile.size,
          file_type: processedFile.type,
          file_hash: fileHash,
          page_count: files.length,
        }),
      });

      let initData;
      const contentType = initRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        initData = await initRes.json();
      } else {
        const errText = await initRes.text();
        throw new Error(`Server returned non-JSON response (${initRes.status}). ${errText.substring(0, 100)}`);
      }

      if (initRes.status === 409 || initData.isDuplicate) {
        setDuplicateAlert({
          message: initData.error?.message || 'Exact duplicate paper detected.',
          existingPaperId: initData.existingPaperId,
        });
        setSubmitting(false);
        return;
      }

      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error?.message || 'Failed to initialize paper upload.');
      }

      const { directUpload, signedUrl, storagePath, intentId, paperData } = initData;

      // 3. Perform Direct Storage Upload if signedUrl is provided (bypasses Vercel 4.5MB API payload limit!)
      if (directUpload && signedUrl) {
        setStatusMessage('Uploading document directly to storage archive...');
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': processedFile.type || 'application/pdf',
          },
          body: processedFile,
        });

        if (!uploadRes.ok) {
          throw new Error(`Direct storage upload failed with status ${uploadRes.status}. Please try again.`);
        }
      }

      // 4. Complete database insertion atomically
      setStatusMessage('Finalizing paper record in GMC repository...');
      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath,
          paperData,
          intentId,
          directUpload,
        }),
      });

      let completeData;
      const compContentType = completeRes.headers.get('content-type') || '';
      if (compContentType.includes('application/json')) {
        completeData = await completeRes.json();
      } else {
        const text = await completeRes.text();
        throw new Error(`Completion server error (${completeRes.status}): ${text.substring(0, 100)}`);
      }

      if (!completeRes.ok || !completeData.success) {
        throw new Error(completeData.error?.message || 'Failed to publish paper metadata.');
      }

      setPublishedPaper(completeData.paper);
    } catch (err: unknown) {
      console.error('Upload Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
      setStatusMessage('');
    }
  };

  if (publishedPaper) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="card text-center p-8 bg-success-card">
          <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-4" />
          <h1 className="h1-hero text-2xl mb-2">Question Paper Published!</h1>
          <p className="subtext mb-6">
            Your paper <strong>&quot;{publishedPaper.title}&quot;</strong> is now live in the GMC archive.
          </p>

          <div className="published-summary-box mb-6 text-left">
            <p><strong>Subject:</strong> {publishedPaper.subject_name}</p>
            <p><strong>Exam:</strong> {publishedPaper.exam_type_name} ({publishedPaper.exam_year})</p>
            <p><strong>MBBS Stage:</strong> {publishedPaper.mbbs_year}</p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href={`/papers/${publishedPaper.id}`} className="btn btn-primary btn-lg">
              <FileText className="w-5 h-5" />
              View Published Paper
            </Link>
            <button
              onClick={() => {
                setPublishedPaper(null);
                setFiles([]);
                setTitle('');
                setDescription('');
              }}
              className="btn btn-secondary btn-lg"
            >
              Upload Another Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl">
      <div className="upload-header mb-6">
        <div className="eyebrow">CONTRIBUTE PAPER</div>
        <h1 className="h1-hero">Add a Question Paper</h1>
        <p className="subtext">
          How would you like to contribute your question paper to the PaperMD archive?
        </p>
      </div>

      {/* Dual Contribution Method Selection */}
      <div className="contribution-method-grid mb-8">
        <Link href="/scan" className="method-card primary-method-card">
          <div className="method-icon-bubble primary-bubble">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="method-content">
            <div className="flex-between-title">
              <h3 className="method-title text-primary-blue">Scan Paper</h3>
              <span className="badge badge-accent">RECOMMENDED FOR MOBILE</span>
            </div>
            <p className="method-desc">
              Use your phone camera to scan physical paper pages step-by-step.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent-blue method-arrow" />
        </Link>

        <div
          onClick={() => setMethod('file')}
          className={`method-card ${method === 'file' ? 'method-card-active' : ''}`}
        >
          <div className="method-icon-bubble secondary-bubble">
            <Upload className="w-5 h-5 text-teal" />
          </div>
          <div className="method-content">
            <h3 className="method-title">Upload Existing File</h3>
            <p className="method-desc">
              Select existing PDF documents or photo files already saved on your device.
            </p>
          </div>
        </div>
      </div>

      {duplicateAlert && (
        <div className="card duplicate-alert-card mb-6">
          <AlertTriangle className="w-6 h-6 text-amber flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900">Duplicate File Warning</h4>
            <p className="text-sm text-amber-800 mb-3">{duplicateAlert.message}</p>
            {duplicateAlert.existingPaperId && (
              <Link href={`/papers/${duplicateAlert.existingPaperId}`} className="btn btn-secondary btn-sm">
                View Existing Paper <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="error-box mb-6">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form-editorial">
        {/* Step 01 */}
        <div className="form-step-section mb-8">
          <div className="step-header">
            <span className="step-number">01</span>
            <span className="step-title">PAPER FILE</span>
          </div>
          <MultiFileUpload
            files={files}
            onFilesSelected={handleFilesSelected}
            onRemoveFile={handleRemoveFile}
          />
        </div>

        <div className="divider-rule mb-8"></div>

        {/* Step 02 */}
        <div className="form-step-section mb-8">
          <div className="step-header">
            <span className="step-number">02</span>
            <span className="step-title">PAPER DETAILS</span>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Paper Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anatomy Paper I — Upper Limb & Thorax"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid-form-2 mb-4">
            <div className="form-group">
              <label className="form-label">Medical Subject *</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="input-field"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Type *</label>
              <select
                required
                value={examTypeId}
                onChange={(e) => setExamTypeId(e.target.value)}
                className="input-field"
              >
                {examTypes.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-form-3 mb-4">
            <div className="form-group">
              <label className="form-label">MBBS Stage *</label>
              <select
                value={mbbsYear}
                onChange={(e) => setMbbsYear(e.target.value)}
                className="input-field"
              >
                <option value="1st MBBS">1st MBBS</option>
                <option value="2nd MBBS">2nd MBBS</option>
                <option value="3rd MBBS">3rd MBBS</option>
                <option value="Final MBBS">Final MBBS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Year *</label>
              <select
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="input-field"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Attempt *</label>
              <select
                value={examAttempt}
                onChange={(e) => setExamAttempt(e.target.value as 'Main Examination' | 'Supplementary Examination')}
                className="input-field"
              >
                <option value="Main Examination">Main Examination</option>
                <option value="Supplementary Examination">Supplementary Examination</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label">Description / Topics (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Long questions on Brachial Plexus injury..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="form-submit-row">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
          >
            <Upload className="w-5 h-5" />
            {submitting ? (statusMessage || 'Publishing Paper...') : 'Publish Question Paper'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .max-w-3xl {
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .upload-header {
          margin-top: 1rem;
        }

        .step-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .step-number {
          font-family: var(--font-mono);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--primary-teal);
        }

        .step-title {
          font-size: 0.9375rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }

        .grid-form-2 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .grid-form-3 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .grid-form-2 {
            grid-template-columns: repeat(2, 1fr);
          }
          .grid-form-3 {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .duplicate-alert-card {
          background-color: #FFFBEB;
          border: 1px solid #FDE68A;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
        }

        .error-box {
          background-color: var(--accent-rose-light);
          color: #9F1239;
          padding: 0.875rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          font-weight: 600;
        }

        .published-summary-box {
          background-color: var(--bg-surface-subtle);
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
        }

        .w-full {
          width: 100%;
        }

        /* Contribution Method Cards */
        .contribution-method-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .contribution-method-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .method-card {
          background-color: #FFFFFF;
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .method-card:hover {
          border-color: var(--border-medium);
          transform: translateY(-1px);
        }

        .primary-method-card {
          border-color: var(--accent-highlight);
          background-color: #F8FAFC;
        }

        .primary-method-card:hover {
          border-color: #2563EB;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
        }

        .method-card-active {
          border-color: var(--primary-teal);
          background-color: var(--primary-teal-light);
        }

        .method-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .primary-bubble {
          background-color: var(--accent-highlight);
        }

        .secondary-bubble {
          background-color: #F1F5F9;
        }

        .method-content {
          flex: 1;
        }

        .flex-between-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .method-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .text-primary-blue {
          color: #1D4ED8;
        }

        .method-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.35;
          margin-top: 0.15rem;
        }

        :global(.badge-accent) {
          background-color: #DBEAFE;
          color: #1E40AF;
          font-size: 0.6875rem;
          padding: 0.15rem 0.4rem;
        }

        @media (max-width: 639px) {
          .upload-header {
            margin-top: 0.5rem;
            margin-bottom: 1.25rem;
          }

          .method-card {
            padding: 1rem;
            gap: 0.75rem;
          }

          .method-icon-bubble {
            width: 40px;
            height: 40px;
          }

          .form-step-section {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
