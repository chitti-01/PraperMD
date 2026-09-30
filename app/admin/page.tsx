'use client';

import { useState } from 'react';
import { QuestionPaper, PaperReport, Subject, ExamType } from '@/lib/types';
import AdminPaperEditor from '@/components/AdminPaperEditor';
import { Shield, Lock, FileText, AlertTriangle, Edit3 } from 'lucide-react';

export default function AdminPage() {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'papers' | 'reports'>('papers');

  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [reports, setReports] = useState<PaperReport[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingPaper, setEditingPaper] = useState<QuestionPaper | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey }),
      });

      if (!res.ok) {
        throw new Error('Invalid passkey credentials');
      }

      setIsAuthenticated(true);
      fetchAdminData(passkey);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Auth failed');
    }
  };

  const fetchAdminData = async (key: string) => {
    setLoading(true);
    try {
      const [papersRes, reportsRes, metaRes] = await Promise.all([
        fetch('/api/papers?limit=100'),
        fetch('/api/admin/reports', {
          headers: { 'x-admin-key': key },
        }),
        fetch('/api/metadata'),
      ]);

      const papersData = papersRes.ok ? await papersRes.json() : { papers: [] };
      const reportsData = reportsRes.ok ? await reportsRes.json() : { reports: [] };
      const metaData = metaRes.ok ? await metaRes.json() : { subjects: [], examTypes: [] };

      setPapers(papersData.papers || []);
      setReports(reportsData.reports || []);
      setSubjects(metaData.subjects || []);
      setExamTypes(metaData.examTypes || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': passkey,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchAdminData(passkey);
      }
    } catch (err) {
      console.error('Error resolving report', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md py-16">
        <div className="card text-center p-8 border-dark">
          <div className="icon-shield mx-auto mb-4">
            <Lock className="w-6 h-6 text-dark" />
          </div>
          <h1 className="h2-title text-2xl mb-2 font-display">ADMIN QUALITY PORTAL</h1>
          <p className="subtext mb-6 font-mono text-sm">
            Enter the admin authorization passkey to access repository controls.
          </p>

          {authError && <div className="error-box mb-4 font-mono">{authError}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group mb-4">
              <input
                type="password"
                placeholder="Enter Admin Passkey..."
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="input-field text-center font-mono"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg">
              Authenticate Admin
            </button>
          </form>
        </div>

        <style jsx>{`
          .max-w-md {
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
          }
          .icon-shield {
            width: 54px;
            height: 54px;
            background-color: var(--primary-yellow);
            border: 2px solid var(--border-dark);
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 2px 2px 0 var(--border-dark);
          }
          .mx-auto {
            margin-left: auto;
            margin-right: auto;
          }
          .w-full {
            width: 100%;
          }
          .error-box {
            background-color: var(--accent-rose-light);
            color: #9F1239;
            border: 1.5px solid var(--accent-rose);
            padding: 0.625rem;
            border-radius: var(--radius-sm);
            font-size: 0.875rem;
            font-weight: 600;
          }
          .text-dark {
            color: #111827;
          }
        `}</style>
      </div>
    );
  }

  const activePapers = papers.filter((p) => p.status === 'active');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const totalDownloads = papers.reduce((acc, p) => acc + p.download_count, 0);

  return (
    <div className="container">
      <div className="admin-header mb-8">
        <div className="eyebrow font-mono">
          <Shield className="w-3.5 h-3.5 inline mr-1 text-dark" />
          <span>PAPERMD CONTROL CENTER</span>
        </div>
        <h1 className="h1-hero">REPOSITORY HEALTH & QUALITY</h1>
        <p className="subtext font-mono mt-1">
          Inspect uploaded papers, edit metadata, handle duplicate reports, and monitor repository health.
        </p>
      </div>

      {/* Repository Health Stats Strip */}
      <section className="editorial-stats-strip mb-8 font-mono">
        <div className="stat-unit">
          <span className="stat-number">{activePapers.length}</span>
          <span className="stat-label">ACTIVE PAPERS</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-unit">
          <span className="stat-number text-amber-val">{pendingReports.length}</span>
          <span className="stat-label">PENDING REPORTS</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-unit">
          <span className="stat-number">{totalDownloads}</span>
          <span className="stat-label">TOTAL DOWNLOADS</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-unit">
          <span className="stat-number">{subjects.length}</span>
          <span className="stat-label">SUBJECTS INDEXED</span>
        </div>
      </section>

      {/* Tabs */}
      {loading && <div className="subtext text-xs mb-4 font-mono">Refreshing data from database...</div>}
      <div className="tabs-header mb-6 font-mono">
        <button
          onClick={() => setActiveTab('papers')}
          className={`tab-btn ${activeTab === 'papers' ? 'tab-active' : ''}`}
        >
          <FileText className="w-4 h-4" />
          <span>REPOSITORY PAPERS ({papers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`tab-btn ${activeTab === 'reports' ? 'tab-active' : ''}`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>ISSUE REPORTS ({reports.length})</span>
        </button>
      </div>

      {/* Tab 1: Repository Quality Manager */}
      {activeTab === 'papers' && (
        <div className="card card-table">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Paper Title</th>
                  <th>Subject</th>
                  <th>Exam & Year</th>
                  <th>MBBS Stage</th>
                  <th>Downloads</th>
                  <th>SHA-256 Hash</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id} className={p.status === 'removed' ? 'row-removed' : ''}>
                    <td>
                      <span className="font-bold block font-display">{p.title}</span>
                      <span className="text-xs text-muted font-mono">{p.original_file_name}</span>
                    </td>
                    <td>
                      <span className="badge badge-yellow">{p.subject_name}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{p.exam_type_name}</span>
                      <span className="text-xs text-muted block font-mono">YEAR: {p.exam_year}</span>
                    </td>
                    <td className="font-mono text-xs">{p.mbbs_year}</td>
                    <td className="font-mono text-xs font-bold">{p.download_count}</td>
                    <td>
                      <code className="text-xs font-mono text-muted" title={p.file_hash}>
                        {p.file_hash.substring(0, 10)}...
                      </code>
                    </td>
                    <td>
                      <button
                        onClick={() => setEditingPaper(p)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reports Manager */}
      {activeTab === 'reports' && (
        <div className="card card-table">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-muted font-mono">
              No student reports submitted yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Paper Title</th>
                    <th>Reason</th>
                    <th>Report Details</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr key={rep.id}>
                      <td>
                        <span className="font-bold font-display">{rep.paper_title}</span>
                        <span className="text-xs text-muted block font-mono">{rep.subject_name}</span>
                      </td>
                      <td>
                        <span className="badge badge-amber">{rep.reason}</span>
                      </td>
                      <td className="max-w-xs text-sm">
                        {rep.description || 'No additional description'}
                      </td>
                      <td className="text-xs text-muted font-mono">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            rep.status === 'resolved'
                              ? 'badge-emerald'
                              : rep.status === 'dismissed'
                              ? 'badge-slate'
                              : 'badge-rose'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td>
                        {rep.status === 'pending' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleResolveReport(rep.id, 'resolved')}
                              className="btn btn-primary btn-sm"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleResolveReport(rep.id, 'dismissed')}
                              className="btn btn-secondary btn-sm"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Paper Editor Modal */}
      {editingPaper && (
        <AdminPaperEditor
          paper={editingPaper}
          subjects={subjects}
          examTypes={examTypes}
          adminPasskey={passkey}
          isOpen={!!editingPaper}
          onClose={() => setEditingPaper(null)}
          onSaved={() => fetchAdminData(passkey)}
        />
      )}

      <style jsx>{`
        .admin-header {
          margin-top: 0.75rem;
        }

        .editorial-stats-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          border-radius: var(--radius-md);
          padding: 1.25rem 2rem;
          box-shadow: var(--shadow-brutalist);
        }

        .stat-unit {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .text-amber-val {
          color: var(--accent-amber);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .stat-divider {
          width: 1.5px;
          height: 36px;
          background-color: var(--border-dark);
        }

        .tabs-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 2px solid var(--border-dark);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-muted);
          background: none;
          border: 1.5px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.12s;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-active {
          color: var(--text-primary);
          background-color: var(--primary-yellow);
          border-color: var(--border-dark);
          box-shadow: 2px 2px 0 var(--border-dark);
        }

        .card-table {
          padding: 0;
          overflow: hidden;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: var(--shadow-brutalist);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th,
        .admin-table td {
          padding: 0.875rem 1rem;
          text-align: left;
          border-bottom: 1.5px solid var(--border-dark);
        }

        .admin-table th {
          background-color: var(--bg-surface-subtle);
          font-family: var(--font-mono);
          font-size: 0.78125rem;
          text-transform: uppercase;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          border-bottom: 2px solid var(--border-dark);
        }

        .row-removed {
          opacity: 0.5;
          background-color: #FEF2F2;
        }

        .flex {
          display: flex;
        }
        .gap-1 {
          gap: 0.25rem;
        }
        .max-w-xs {
          max-width: 280px;
        }

        .text-dark {
          color: #111827;
        }

        @media (max-width: 639px) {
          .editorial-stats-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1rem;
          }
          .stat-divider {
            display: none;
          }
          .tabs-header {
            flex-direction: column;
            align-items: stretch;
          }
          .tab-btn {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

