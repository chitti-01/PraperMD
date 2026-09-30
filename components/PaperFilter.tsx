'use client';

import { Subject, ExamType } from '@/lib/types';
import { Search, RotateCcw } from 'lucide-react';

interface PaperFilterProps {
  subjects: Subject[];
  examTypes: ExamType[];
  filters: {
    query: string;
    subjectId: string;
    examTypeId: string;
    mbbsYear: string;
    examAttempt: string;
    examYear: string;
    sortBy: string;
  };
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function PaperFilter({
  subjects,
  examTypes,
  filters,
  onChange,
  onReset,
}: PaperFilterProps) {
  const mbbsYears = ['1st MBBS', '2nd MBBS', '3rd MBBS', 'Final MBBS'];
  const examAttempts = ['Main Examination', 'Supplementary Examination'];
  const examYears = ['2026', '2025', '2024', '2023', '2022'];

  const hasActiveFilters =
    filters.query ||
    filters.subjectId ||
    filters.examTypeId ||
    filters.mbbsYear ||
    filters.examAttempt ||
    filters.examYear ||
    filters.sortBy !== 'latest';

  return (
    <div className="filter-bar-editorial card mb-8">
      <div className="search-row mb-4">
        <div className="search-input-container">
          <Search className="search-icon w-5 h-5 text-dark" />
          <input
            type="text"
            placeholder="Filter by title, subject, college, year..."
            value={filters.query}
            onChange={(e) => onChange('query', e.target.value)}
            className="search-input-field font-display"
          />
        </div>

        {hasActiveFilters && (
          <button onClick={onReset} className="btn btn-primary btn-sm btn-reset-filter">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      <div className="filters-strip">
        <div className="filter-select-unit">
          <span className="select-label font-mono">SUBJECT</span>
          <select
            value={filters.subjectId}
            onChange={(e) => onChange('subjectId', e.target.value)}
            className="select-field font-mono"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-unit">
          <span className="select-label font-mono">EXAM TYPE</span>
          <select
            value={filters.examTypeId}
            onChange={(e) => onChange('examTypeId', e.target.value)}
            className="select-field font-mono"
          >
            <option value="">All Exam Types</option>
            {examTypes.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-unit">
          <span className="select-label font-mono">MBBS STAGE</span>
          <select
            value={filters.mbbsYear}
            onChange={(e) => onChange('mbbsYear', e.target.value)}
            className="select-field font-mono"
          >
            <option value="">All MBBS Years</option>
            {mbbsYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-unit">
          <span className="select-label font-mono">ATTEMPT</span>
          <select
            value={filters.examAttempt}
            onChange={(e) => onChange('examAttempt', e.target.value)}
            className="select-field font-mono"
          >
            <option value="">All Attempts</option>
            {examAttempts.map((att) => (
              <option key={att} value={att}>
                {att}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-unit">
          <span className="select-label font-mono">EXAM YEAR</span>
          <select
            value={filters.examYear}
            onChange={(e) => onChange('examYear', e.target.value)}
            className="select-field font-mono"
          >
            <option value="">All Years</option>
            {examYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-unit ml-auto">
          <span className="select-label font-mono">SORT BY</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="select-field font-mono"
          >
            <option value="latest">Latest Added</option>
            <option value="views">Most Viewed</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        .filter-bar-editorial {
          width: 100%;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          padding: 1.25rem;
          box-shadow: var(--shadow-brutalist);
        }

        .search-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-input-container {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-primary);
        }

        .search-input-field {
          width: 100%;
          height: 48px;
          padding-left: 2.75rem;
          padding-right: 1rem;
          font-size: 1rem;
          font-weight: 700;
          border: var(--border-width-bold) solid var(--border-dark);
          border-radius: var(--radius-sm);
          background-color: #FFFFFF;
          color: var(--text-primary);
          outline: none;
          box-shadow: 2px 2px 0 rgba(17, 24, 39, 0.12);
        }

        .search-input-field:focus {
          border-color: var(--border-dark);
          background-color: #FFFDF5;
          box-shadow: 3px 3px 0 var(--border-dark);
        }

        .btn-reset-filter {
          white-space: nowrap;
          height: 48px;
        }

        .filters-strip {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          padding-top: 1rem;
          border-top: 1.5px solid var(--border-dark);
        }

        .filter-select-unit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .select-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
        }

        .select-field {
          padding: 0.4rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 700;
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          background-color: #FFFFFF;
          color: var(--text-primary);
          outline: none;
          box-shadow: 1.5px 1.5px 0 var(--border-dark);
        }

        .select-field:focus {
          background-color: var(--primary-yellow-light);
        }

        .ml-auto {
          margin-left: auto;
        }

        @media (max-width: 639px) {
          .search-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .search-input-field {
            height: 48px;
          }

          .btn-reset-filter {
            width: 100%;
            min-height: 44px;
            justify-content: center;
          }

          .filters-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            padding-top: 0.75rem;
          }

          .filter-select-unit {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
            width: 100%;
          }

          .select-field {
            width: 100%;
            min-height: 44px;
            font-size: 0.8125rem;
          }

          .ml-auto {
            margin-left: 0;
          }
        }

        @media (max-width: 360px) {
          .filters-strip {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

