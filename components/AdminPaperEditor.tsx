'use client';

import { useState } from 'react';
import { QuestionPaper, Subject, ExamType } from '@/lib/types';
import { X, Save, Trash2 } from 'lucide-react';

interface AdminPaperEditorProps {
  paper: QuestionPaper;
  subjects: Subject[];
  examTypes: ExamType[];
  adminPasskey: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdminPaperEditor({
  paper,
  subjects,
  examTypes,
  adminPasskey,
  isOpen,
  onClose,
  onSaved,
}: AdminPaperEditorProps) {
  const [title, setTitle] = useState(paper.title);
  const [subjectId, setSubjectId] = useState(paper.subject_id);
  const [examTypeId, setExamTypeId] = useState(paper.exam_type_id);
  const [mbbsYear, setMbbsYear] = useState(paper.mbbs_year);
  const [examYear, setExamYear] = useState(paper.exam_year.toString());
  const [description, setDescription] = useState(paper.description || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/papers/${paper.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminPasskey,
        },
        body: JSON.stringify({
          title,
          subject_id: subjectId,
          exam_type_id: examTypeId,
          mbbs_year: mbbsYear,
          exam_year: Number(examYear),
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update metadata.');
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${paper.title}" from the public repository?`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/papers/${paper.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminPasskey,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete paper');
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card max-w-2xl">
        <div className="modal-header">
          <h3 className="text-lg font-bold">Admin Edit Paper Metadata</h3>
          <button onClick={onClose} className="close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="error-box mb-4">{error}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group mb-3">
            <label className="form-label">Paper Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
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
              <label className="form-label">Exam Type</label>
              <select
                value={examTypeId}
                onChange={(e) => setExamTypeId(e.target.value)}
                className="input-field"
              >
                {examTypes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="form-group">
              <label className="form-label">MBBS Year</label>
              <select
                value={mbbsYear}
                onChange={(e) => setMbbsYear(e.target.value as QuestionPaper['mbbs_year'])}
                className="input-field"
              >
                <option value="1st MBBS">1st MBBS</option>
                <option value="2nd MBBS">2nd MBBS</option>
                <option value="3rd MBBS">3rd MBBS</option>
                <option value="Final MBBS">Final MBBS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Exam Year</label>
              <input
                type="number"
                value={examYear}
                onChange={(e) => setExamYear(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-field"
            />
          </div>

          <div className="modal-actions justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger btn-sm"
              disabled={saving}
            >
              <Trash2 className="w-4 h-4" />
              Remove Paper
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
        }
        .grid {
          display: grid;
        }
        .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }
        .gap-3 {
          gap: 0.75rem;
        }
        .justify-between {
          justify-content: space-between;
        }
        .flex {
          display: flex;
        }
        .gap-2 {
          gap: 0.5rem;
        }
        .error-box {
          background-color: var(--accent-rose-light);
          color: #9f1239;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
