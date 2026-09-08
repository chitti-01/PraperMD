'use client';

import { useState } from 'react';
import { QuestionPaper } from '@/lib/types';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface PaperViewerProps {
  paper: QuestionPaper;
}

export default function PaperViewer({ paper }: PaperViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  const isPdf = paper.file_type === 'pdf';

  return (
    <div className="viewer-card card">
      <div className="viewer-toolbar">
        <div className="toolbar-info">
          <FileText className="w-5 h-5 text-teal" />
          <span className="toolbar-filename">{paper.original_file_name}</span>
          <span className="badge badge-slate">{paper.file_type.toUpperCase()}</span>
        </div>

        <div className="toolbar-controls">
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
            className="btn btn-secondary btn-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="zoom-indicator">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
            className="btn btn-secondary btn-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <a
            href={`/api/papers/${paper.id}/download`}
            download
            className="btn btn-primary btn-sm ml-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </a>
        </div>
      </div>

      <div className="viewer-stage">
        {isPdf ? (
          <div className="pdf-embed-box" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
            <iframe
              src={`/api/papers/${paper.id}/download#toolbar=0`}
              title={`Document Preview - ${paper.title}`}
              className="pdf-iframe"
            />
          </div>
        ) : (
          <div className="image-preview-box" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/papers/${paper.id}/download`}
              alt={`${paper.title} Page ${currentSlide}`}
              className="scanned-doc-img"
              onError={(e) => {
                // Fallback to placeholder if file stream is missing or mock
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {!isPdf && paper.page_count > 1 && (
        <div className="carousel-nav">
          <button
            disabled={currentSlide <= 1}
            onClick={() => setCurrentSlide((s) => Math.max(1, s - 1))}
            className="btn btn-secondary btn-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Page
          </button>
          <span className="page-indicator">
            Page {currentSlide} of {paper.page_count}
          </span>
          <button
            disabled={currentSlide >= paper.page_count}
            onClick={() => setCurrentSlide((s) => Math.min(paper.page_count, s + 1))}
            className="btn btn-secondary btn-sm"
          >
            Next Page
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <style jsx>{`
        .viewer-card {
          padding: 0;
          overflow: hidden;
          background-color: #0f172a;
          color: #ffffff;
          border: 1px solid #1e293b;
        }

        .viewer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          background-color: #1e293b;
          border-bottom: 1px solid #334155;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .toolbar-info {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .toolbar-filename {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .toolbar-controls {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .zoom-indicator {
          font-size: 0.8125rem;
          color: #94a3b8;
          min-width: 48px;
          text-align: center;
        }

        .viewer-stage {
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: #090d16;
          overflow: auto;
        }

        .pdf-embed-box {
          width: 100%;
          max-width: 900px;
          height: 650px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #ffffff;
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .image-preview-box {
          max-width: 900px;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .scanned-doc-img {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .carousel-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background-color: #1e293b;
          border-top: 1px solid #334155;
        }

        .page-indicator {
          font-size: 0.875rem;
          color: #cbd5e1;
          font-weight: 600;
        }

        @media (max-width: 639px) {
          .viewer-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .toolbar-filename {
            font-size: 0.8125rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
          }

          .toolbar-controls {
            width: 100%;
            justify-content: space-between;
          }

          .viewer-stage {
            min-height: 300px;
            padding: 0.75rem;
          }

          .pdf-placeholder, .image-mock {
            padding: 1.25rem 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
