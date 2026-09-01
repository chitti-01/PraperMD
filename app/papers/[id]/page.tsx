'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { QuestionPaper } from '@/lib/types';
import PaperViewer from '@/components/PaperViewer';
import ReportModal from '@/components/ReportModal';
import { Download, AlertTriangle, ArrowLeft, Calendar, GraduationCap, Building2, Eye, FileText } from 'lucide-react';

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
      <div className="container p-12 text-center">
        <p className="subtext">Loading paper entry...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container p-12 text-center">
        <h2 className="h2-title mb-4">Paper Entry Not Found</h2>
        <p className="subtext mb-6">The requested paper may have been removed or does not exist.</p>
        <Link href="/browse" className="btn btn-primary">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/browse" className="back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </Link>
      </div>

      {/* Main Detail Header Section */}
      <div className="paper-entry-header card mb-8">
        <div className="eyebrow-line">
          <span>{paper.subject_name?.toUpperCase() || 'SUBJECT'}</span>
          <span>·</span>
          <span>{paper.exam_type_name?.toUpperCase() || 'EXAM'}</span>
          <span>·</span>
          <span>{paper.exam_year}</span>
        </div>

        <h1 className="h1-hero entry-title mb-3">{paper.title}</h1>

        <div className="entry-meta-strip mb-4">
          <span className="meta-badge">{paper.mbbs_year}</span>
          {paper.semester && <span className="meta-badge">{paper.semester}</span>}
          <span className="meta-text">{paper.college_name || 'Government Medical College'}</span>
          <span className="meta-text">·</span>
          <span className="meta-text">{paper.view_count} views</span>
          <span className="meta-text">·</span>
          <span className="meta-text">{paper.download_count} downloads</span>
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
            Download Paper
          </a>

          <button
            onClick={() => setReportModalOpen(true)}
            className="btn btn-secondary text-amber-btn"
          >
            <AlertTriangle className="w-4 h-4 text-amber" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="mb-10">
        <div className="eyebrow mb-2">DOCUMENT PREVIEW</div>
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
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .back-link:hover {
          color: var(--primary-teal);
        }

        .paper-entry-header {
          padding: 2.25rem;
          background-color: #FFFFFF;
        }

        .eyebrow-line {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--primary-teal);
          letter-spacing: 0.08em;
          margin-bottom: 0.625rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .entry-title {
          font-size: 2.25rem;
        }

        .entry-meta-strip {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        .meta-badge {
          background-color: var(--bg-surface-subtle);
          color: var(--text-secondary);
          padding: 0.2rem 0.625rem;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          font-weight: 700;
        }

        .meta-text {
          font-size: 0.875rem;
          color: var(--text-muted);
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

        :global(.text-amber-btn) {
          border-color: #FDE68A !important;
        }
      `}</style>
    </div>
  );
}
