'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { QuestionPaper } from '@/lib/types';
import PaperViewer from '@/components/PaperViewer';
import ReportModal from '@/components/ReportModal';
import { Download, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPaper() {
      try {
        const res = await fetch(`/api/papers/${id}`);
        if (!res.ok) {
          setPaper(null);
          return;
        }
        const data = await res.json();
        setPaper(data);
      } catch (err) {
        console.error('Failed to fetch paper detail', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPaper();
  }, [id]);

  if (loading) {
    return (
      <div className="container p-12 text-center font-mono">
        <p className="subtext">LOADING PAPER ENTRY FROM REPOSITORY...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container p-12 text-center">
        <h2 className="h2-title mb-4 font-display">Paper Entry Not Found</h2>
        <p className="subtext mb-6">The requested paper may have been removed or does not exist.</p>
        <Link href="/browse" className="btn btn-primary btn-lg">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/browse" className="back-link font-mono">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO ARCHIVE</span>
        </Link>
      </div>

      {/* Main Detail Header Section */}
      <div className="paper-entry-header card mb-8">
        <div className="eyebrow-line font-mono">
          <span className="badge badge-yellow">{paper.subject_name?.toUpperCase() || 'SUBJECT'}</span>
          <span className="badge badge-teal">{paper.exam_type_name?.toUpperCase() || 'EXAM'}</span>
          <span className="badge badge-emerald">YEAR: {paper.exam_year}</span>
          {paper.academic_year && <span className="badge badge-slate">{paper.academic_year}</span>}
        </div>

        <h1 className="h1-hero entry-title mb-3 font-display">{paper.title}</h1>

        <div className="entry-meta-strip mb-4 font-mono">
          <span className="meta-badge">{paper.mbbs_year}</span>
          {paper.exam_attempt && <span className="meta-badge">{paper.exam_attempt}</span>}
          <span className="meta-text">{paper.college_name || 'Government Medical College'}</span>
          <span className="meta-dot">•</span>
          <span className="meta-text">
            <Eye className="w-3.5 h-3.5 inline mr-1 text-muted" />
            {paper.view_count} views
          </span>
          <span className="meta-dot">•</span>
          <span className="meta-text">
            <Download className="w-3.5 h-3.5 inline mr-1 text-muted" />
            {paper.download_count} downloads
          </span>
        </div>

        {paper.description && (
          <p className="entry-description mb-6">{paper.description}</p>
        )}

        <div className="entry-actions-row">
          <a
            href={`/api/papers/${paper.id}/download`}
            download
            className="btn btn-primary btn-lg"
          >
            <Download className="w-5 h-5" />
            Download Question Paper
          </a>

          <button
            onClick={() => setReportModalOpen(true)}
            className="btn btn-secondary btn-lg text-amber-btn"
          >
            <AlertTriangle className="w-4 h-4 text-amber" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="mb-10">
        <div className="eyebrow font-mono mb-3">
          <span>DOCUMENT PREVIEW • {paper.file_type.toUpperCase()}</span>
        </div>
        <PaperViewer paper={paper} />
      </div>

      {/* Report Modal */}
      <ReportModal
        paperId={paper.id}
        paperTitle={paper.title}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      <style jsx>{`
        .max-w-5xl {
          max-width: 1040px;
          margin-left: auto;
          margin-right: auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-primary);
          padding: 0.35rem 0.65rem;
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          background-color: #FFFFFF;
          box-shadow: 1.5px 1.5px 0 var(--border-dark);
        }

        .back-link:hover {
          background-color: var(--primary-yellow);
        }

        .paper-entry-header {
          padding: 2rem 2.25rem;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: var(--shadow-brutalist);
        }

        .eyebrow-line {
          margin-bottom: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .entry-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          line-height: 1.15;
        }

        .entry-meta-strip {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
          font-size: 0.8125rem;
        }

        .meta-badge {
          background-color: var(--bg-surface-subtle);
          color: var(--text-primary);
          border: 1px solid var(--border-dark);
          padding: 0.2rem 0.625rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .meta-text {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .meta-dot {
          color: var(--border-medium);
        }

        .entry-description {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .entry-actions-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 639px) {
          .paper-entry-header {
            padding: 1.25rem;
          }
          .eyebrow-line {
            gap: 0.35rem;
          }
          .entry-actions-row {
            flex-direction: column;
            width: 100%;
          }
          .entry-actions-row a,
          .entry-actions-row button {
            width: 100%;
            justify-content: center;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}

