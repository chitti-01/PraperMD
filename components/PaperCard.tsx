'use client';

import Link from 'next/link';
import { QuestionPaper } from '@/lib/types';
import { Eye, Download } from 'lucide-react';

interface PaperCardProps {
  paper: QuestionPaper;
  index?: number;
}

export default function PaperCard({ paper, index }: PaperCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="archive-paper-entry">
      {index !== undefined && (
        <div className="archive-number">
          {index.toString().padStart(2, '0')}
        </div>
      )}

      <div className="archive-main-info">
        <div className="archive-eyebrow-row">
          <span className="badge badge-teal">{paper.subject_name || 'Subject'}</span>
          <span className="archive-exam-type">{paper.exam_type_name || 'Exam'}</span>
          <span className="archive-year">Year: {paper.exam_year}</span>
        </div>

        <h3 className="archive-title">
          <Link href={`/papers/${paper.id}`}>{paper.title}</Link>
        </h3>

        {paper.description && (
          <p className="archive-desc">{paper.description}</p>
        )}

        <div className="archive-metadata-line">
          <span>{paper.mbbs_year}</span>
          <span>·</span>
          <span>{paper.file_type === 'pdf' ? 'PDF Document' : 'Scanned Images'}</span>
          <span>·</span>
          <span>{formatFileSize(paper.file_size)}</span>
          <span>·</span>
          <span className="stats-inline">
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            {paper.view_count} views
          </span>
          <span>·</span>
          <span className="stats-inline">
            <Download className="w-3.5 h-3.5 inline mr-1" />
            {paper.download_count} downloads
          </span>
        </div>
      </div>

      <div className="archive-actions-column">
        <Link href={`/papers/${paper.id}`} className="btn btn-secondary btn-sm">
          View Paper
        </Link>
        <a
          href={`/api/papers/${paper.id}/download`}
          download
          className="btn btn-primary btn-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
      </div>

      <style jsx>{`
        .archive-paper-entry {
          background-color: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: var(--shadow-sm);
        }

        .archive-paper-entry:hover {
          border-color: var(--border-medium);
          box-shadow: var(--shadow-soft);
        }

        .archive-number {
          font-family: var(--font-mono);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-light);
          min-width: 32px;
        }

        .archive-main-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .archive-eyebrow-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .archive-exam-type {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .archive-year {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .archive-title {
          font-size: 1.25rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
        }

        .archive-title a:hover {
          color: var(--primary-teal);
        }

        .archive-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 0.625rem;
        }

        .archive-metadata-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .stats-inline {
          font-weight: 600;
        }

        .archive-actions-column {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 130px;
        }

        @media (max-width: 640px) {
          .archive-paper-entry {
            flex-direction: column;
            align-items: flex-start;
            padding: 1.125rem;
            gap: 1rem;
          }
          .archive-number {
            display: none;
          }
          .archive-title {
            font-size: 1.0625rem;
          }
          .archive-eyebrow-row {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .archive-metadata-line {
            gap: 0.35rem;
            font-size: 0.78125rem;
          }
          .archive-actions-column {
            flex-direction: row;
            width: 100%;
            gap: 0.625rem;
          }
          .archive-actions-column a {
            flex: 1;
            justify-content: center;
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
