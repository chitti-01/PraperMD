'use client';

import Link from 'next/link';
import { QuestionPaper } from '@/lib/types';
import { Eye, Download, FileText, ArrowUpRight } from 'lucide-react';

interface PaperCardProps {
  paper: QuestionPaper;
  index?: number;
}

export default function PaperCard({ paper, index }: PaperCardProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="archive-paper-card">
      {index !== undefined && (
        <div className="archive-index-badge font-mono">
          #{index.toString().padStart(2, '0')}
        </div>
      )}

      <div className="archive-main-content">
        <div className="archive-tags-strip font-mono">
          <span className="badge badge-yellow">{paper.subject_name || 'Medical Subject'}</span>
          <span className="badge badge-teal">{paper.exam_type_name || 'Exam'}</span>
          <span className="badge badge-slate">{paper.mbbs_year || 'MBBS'}</span>
          <span className="badge badge-emerald">YEAR: {paper.exam_year}</span>
          {paper.academic_year && <span className="archive-academic-year font-mono">• {paper.academic_year}</span>}
        </div>

        <h3 className="archive-paper-title font-display">
          <Link href={`/papers/${paper.id}`} className="paper-title-link">
            <span>{paper.title}</span>
            <ArrowUpRight className="w-4 h-4 title-arrow inline-block" />
          </Link>
        </h3>

        {paper.description && (
          <p className="archive-paper-desc">{paper.description}</p>
        )}

        <div className="archive-tech-meta font-mono">
          <span>{paper.exam_attempt || 'Main Exam'}</span>
          <span className="dot">•</span>
          <span>{paper.college_name || 'GMC Archive'}</span>
          <span className="dot">•</span>
          <span>{paper.file_type === 'pdf' ? 'PDF Doc' : 'Scanned Document'}</span>
          <span className="dot">•</span>
          <span>{formatFileSize(paper.file_size)}</span>
          <span className="dot">•</span>
          <span className="stat-pill">
            <Eye className="w-3.5 h-3.5 inline mr-1 text-muted" />
            {paper.view_count} views
          </span>
          <span className="dot">•</span>
          <span className="stat-pill">
            <Download className="w-3.5 h-3.5 inline mr-1 text-muted" />
            {paper.download_count} downloads
          </span>
        </div>
      </div>

      <div className="archive-actions-group">
        <Link href={`/papers/${paper.id}`} className="btn btn-secondary btn-sm card-btn-view">
          <FileText className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>
        <a
          href={`/api/papers/${paper.id}/download`}
          download
          className="btn btn-primary btn-sm card-btn-dl"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </a>
      </div>

      <style jsx>{`
        .archive-paper-card {
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          border-radius: var(--radius-md);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-brutalist);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          position: relative;
        }

        .archive-paper-card:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0 var(--border-dark);
        }

        .archive-index-badge {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-muted);
          min-width: 38px;
          height: 38px;
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background-color: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .archive-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 0;
        }

        .archive-tags-strip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .archive-academic-year {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .archive-paper-title {
          font-size: 1.25rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-primary);
          margin-top: 0.15rem;
        }

        .paper-title-link {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .paper-title-link:hover {
          color: var(--primary-teal);
          text-decoration: underline;
        }

        .archive-paper-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .archive-tech-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          margin-top: 0.15rem;
        }

        .dot {
          color: var(--border-medium);
        }

        .stat-pill {
          font-weight: 700;
          color: var(--text-secondary);
        }

        .archive-actions-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 120px;
          flex-shrink: 0;
        }

        .card-btn-view, .card-btn-dl {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 639px) {
          .archive-paper-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 1.125rem;
            gap: 0.875rem;
          }
          .archive-index-badge {
            display: none;
          }
          .archive-paper-title {
            font-size: 1.0625rem;
          }
          .archive-actions-group {
            flex-direction: row;
            width: 100%;
            gap: 0.5rem;
          }
          .card-btn-view, .card-btn-dl {
            flex: 1;
            min-height: 48px;
          }
        }
      `}</style>
    </div>
  );
}

