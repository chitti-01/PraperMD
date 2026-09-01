'use client';

import { useState } from 'react';
import { QuestionPaper } from '@/lib/types';
import { FileText, Image as ImageIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

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
          <div className="pdf-preview-box">
            <div className="pdf-placeholder">
              <FileText className="w-16 h-16 text-teal mb-4" />
              <h3>PDF Document Preview</h3>
              <p className="text-secondary mb-4">
                {paper.title} ({paper.page_count} pages)
              </p>
              <div className="pdf-actions">
                <a
                  href={`/api/papers/${paper.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  Open PDF Viewer / Download
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="image-preview-box" style={{ transform: `scale(${zoomLevel / 100})` }}>
            <div className="image-mock">
              <ImageIcon className="w-16 h-16 text-teal mb-2" />
              <p className="font-semibold">Question Paper Page {currentSlide} of {paper.page_count}</p>
              <p className="text-sm text-muted">Scanned Document Image Preview</p>
            </div>
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

        .pdf-placeholder,
        .image-mock {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem;
          background-color: #1e293b;
          border-radius: var(--radius-md);
          max-width: 600px;
          width: 100%;
          border: 1px dashed #334155;
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
      `}</style>
    </div>
  );
}
