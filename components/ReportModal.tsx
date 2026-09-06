'use client';

import { useState } from 'react';
import { ReportReason } from '@/lib/types';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  paperId: string;
  paperTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({
  paperId,
  paperTitle,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>('wrong_subject');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/papers/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paper_id: paperId, reason, description }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit report. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle className="w-5 h-5 text-amber" />
            <span>Report an Issue</span>
          </div>
          <button onClick={onClose} className="close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="success-state">
            <CheckCircle className="w-12 h-12 text-emerald mb-2" />
            <h3>Report Submitted</h3>
            <p className="text-secondary">
              Thank you. The medical paper review team will inspect this paper.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="target-paper-title mb-4">
              Target Paper: <strong>{paperTitle}</strong>
            </p>

            {error && <div className="error-box mb-4">{error}</div>}

            <div className="form-group">
              <label className="form-label">Select Issue Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="input-field"
                required
              >
                <option value="wrong_subject">Wrong Subject classification</option>
                <option value="wrong_year">Wrong Exam Year or Semester</option>
                <option value="duplicate">Duplicate question paper</option>
                <option value="unreadable">Unreadable text / blurry scanning</option>
                <option value="incomplete">Incomplete / missing pages</option>
                <option value="not_a_question_paper">Not a medical question paper</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is incorrect or missing..."
                rows={3}
                className="input-field"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
        }

        .target-paper-title {
          font-size: 0.875rem;
          color: var(--text-secondary);
          background-color: var(--bg-subtle);
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-sm);
        }

        .modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem 1rem;
        }

        .error-box {
          background-color: var(--accent-rose-light);
          color: #9f1239;
          padding: 0.625rem 0.875rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
