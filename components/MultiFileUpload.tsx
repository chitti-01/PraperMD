'use client';

import { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  error?: string;
}

export default function MultiFileUpload({
  onFilesSelected,
  files,
  onRemoveFile,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndPass(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      validateAndPass(selected);
    }
  };

  const validateAndPass = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
    });
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="upload-dropzone-editorial">
      <div
        className={`dropzone-surface ${isDragging ? 'dropzone-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden-file-input"
        />

        <div className="upload-icon-circle">
          <UploadCloud className="w-7 h-7 text-dark" />
        </div>

        <h3 className="dropzone-title font-display">DROP YOUR PDF OR SCANNED PAGES HERE</h3>
        <p className="dropzone-sub">
          Supports single <strong>PDF</strong> document or <strong>Multiple Image scans</strong> (JPG, PNG, WEBP).
        </p>

        <button type="button" className="btn btn-secondary btn-sm mt-3">
          Select Files from Device
        </button>
      </div>

      {error && (
        <div className="error-banner mt-3 font-mono">
          <AlertCircle className="w-4 h-4 text-rose" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Files List Preview */}
      {files.length > 0 && (
        <div className="files-preview-section mt-4">
          <div className="preview-heading-row mb-2">
            <span className="eyebrow font-mono">ATTACHED FILES ({files.length})</span>
          </div>
          <div className="files-list">
            {files.map((file, idx) => {
              const isPdf = file.name.endsWith('.pdf');
              return (
                <div key={`${file.name}-${idx}`} className="file-row-item">
                  <div className="file-type-icon">
                    {isPdf ? (
                      <FileText className="w-4 h-4 text-dark" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-dark" />
                    )}
                  </div>
                  <div className="file-info font-mono">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">PAGE {idx + 1} · {formatSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(idx);
                    }}
                    className="remove-btn"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4 text-rose" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .upload-dropzone-editorial {
          width: 100%;
        }

        .dropzone-surface {
          background-color: #FFFFFF;
          border: 2px dashed var(--border-dark);
          border-radius: var(--radius-md);
          padding: 2.25rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 2px 2px 0 rgba(17, 24, 39, 0.08);
        }

        .dropzone-surface:hover,
        .dropzone-active {
          background-color: var(--primary-yellow-light);
          border-color: var(--border-dark);
          box-shadow: var(--shadow-brutalist);
        }

        .hidden-file-input {
          display: none;
        }

        .upload-icon-circle {
          width: 52px;
          height: 52px;
          background-color: var(--primary-yellow);
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0 var(--border-dark);
          margin-bottom: 0.875rem;
        }

        .dropzone-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.02em;
          margin-bottom: 0.375rem;
        }

        .dropzone-sub {
          font-size: 0.875rem;
          color: var(--text-muted);
          max-width: 440px;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--accent-rose-light);
          color: #9F1239;
          border: 1.5px solid var(--accent-rose);
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-row-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          background-color: #FFFFFF;
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          box-shadow: 1.5px 1.5px 0 var(--border-dark);
        }

        .file-type-icon {
          width: 32px;
          height: 32px;
          background-color: var(--primary-yellow-light);
          border: 1px solid #EAB308;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .remove-btn {
          background: none;
          border: 1px solid var(--border-dark);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background-color: var(--accent-rose-light);
        }

        .text-dark {
          color: #111827;
        }

        @media (max-width: 639px) {
          .dropzone-surface {
            padding: 1.75rem 1rem;
          }

          .dropzone-title {
            font-size: 1rem;
          }

          .dropzone-sub {
            font-size: 0.8125rem;
          }

          .dropzone-surface button {
            width: 100%;
            min-height: 48px;
            margin-top: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

