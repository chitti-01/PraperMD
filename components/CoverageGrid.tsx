'use client';

import Link from 'next/link';
import { CoverageMatrixItem } from '@/lib/types';
import { CheckCircle2, Minus, Camera } from 'lucide-react';

interface CoverageGridProps {
  years: number[];
  matrix: CoverageMatrixItem[];
}

export default function CoverageGrid({ years, matrix }: CoverageGridProps) {
  return (
    <div className="coverage-matrix-wrapper">
      {/* Desktop Table View */}
      <div className="desktop-matrix-table card">
        <div className="table-responsive">
          <table className="coverage-matrix-table">
            <thead>
              <tr>
                <th>Medical Subject</th>
                {years.map((yr) => (
                  <th key={yr}>{yr}</th>
                ))}
                <th>Coverage</th>
                <th>Contribute</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.subjectId}>
                  <td className="subject-cell">
                    <span>{row.subjectName}</span>
                  </td>

                  {years.map((yr) => {
                    const hasPaper = row.yearCoverage[yr];
                    return (
                      <td key={yr} className="status-cell">
                        {hasPaper ? (
                          <Link
                            href={`/browse?subjectId=${row.subjectId}&examYear=${yr}`}
                            className="check-link touch-target"
                            title={`View ${row.subjectName} ${yr} papers`}
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald inline" />
                          </Link>
                        ) : (
                          <Link
                            href={`/scan?subjectId=${row.subjectId}&examYear=${yr}`}
                            className="dash-missing touch-target"
                            title={`Scan paper for ${row.subjectName} (${yr})`}
                          >
                            <Minus className="w-4 h-4 text-light inline" />
                          </Link>
                        )}
                      </td>
                    );
                  })}

                  <td className="count-cell">
                    <span className="badge badge-teal">{row.paperCount} / {years.length} Years</span>
                  </td>

                  <td>
                    <div className="flex justify-center gap-1">
                      <Link
                        href={`/scan?subjectId=${row.subjectId}`}
                        className="btn btn-primary btn-sm"
                        title="Scan Paper with Phone Camera"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Stack View */}
      <div className="mobile-coverage-cards">
        {matrix.map((row) => (
          <div key={row.subjectId} className="card mobile-coverage-card">
            <div className="card-head">
              <h3 className="mobile-subject-title">{row.subjectName}</h3>
              <span className="badge badge-teal">{row.paperCount} / {years.length} Years</span>
            </div>

            <div className="mobile-years-grid">
              {years.map((yr) => {
                const hasPaper = row.yearCoverage[yr];
                return (
                  <div key={yr} className={`year-status-box ${hasPaper ? 'year-box-found' : 'year-box-missing'}`}>
                    <span className="year-label">{yr}</span>
                    {hasPaper ? (
                      <Link
                        href={`/browse?subjectId=${row.subjectId}&examYear=${yr}`}
                        className="status-icon-link"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald" />
                      </Link>
                    ) : (
                      <Link
                        href={`/scan?subjectId=${row.subjectId}&examYear=${yr}`}
                        className="status-icon-link"
                      >
                        <Minus className="w-4 h-4 text-light" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mobile-card-action mt-3">
              <Link
                href={`/scan?subjectId=${row.subjectId}`}
                className="btn btn-primary btn-sm w-full touch-target"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Paper for {row.subjectName}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .desktop-matrix-table {
          padding: 0;
          overflow: hidden;
        }

        .mobile-coverage-cards {
          display: none;
          flex-direction: column;
          gap: 0.875rem;
        }

        @media (max-width: 639px) {
          .desktop-matrix-table {
            display: none;
          }
          .mobile-coverage-cards {
            display: flex;
          }
        }

        .mobile-coverage-card {
          padding: 1.125rem;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .mobile-subject-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mobile-years-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .year-status-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.25rem;
          border-radius: var(--radius-sm);
          gap: 0.25rem;
          border: 1px solid var(--border-subtle);
        }

        .year-box-found {
          background-color: #F0FDF4;
          border-color: #DCFCE7;
        }

        .year-box-missing {
          background-color: var(--bg-surface-subtle);
          border-color: var(--border-subtle);
        }

        .year-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .coverage-matrix-table {
          width: 100%;
          border-collapse: collapse;
        }

        .coverage-matrix-table th,
        .coverage-matrix-table td {
          padding: 1rem 1.25rem;
          text-align: center;
          border-bottom: 1px solid var(--border-subtle);
        }

        .coverage-matrix-table th:first-child,
        .coverage-matrix-table td:first-child {
          text-align: left;
        }

        .coverage-matrix-table th {
          background-color: var(--bg-surface-subtle);
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .subject-cell {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .check-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .check-link:hover {
          transform: scale(1.2);
        }

        .dash-missing {
          color: var(--text-light);
        }

        .count-cell {
          font-size: 0.875rem;
        }

        .w-full {
          width: 100%;
        }

        :global(.text-emerald) {
          color: var(--accent-emerald);
        }

        :global(.text-light) {
          color: var(--text-light);
        }
      `}</style>
    </div>
  );
}
