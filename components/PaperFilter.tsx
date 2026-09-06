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
  const examYears = ['2026', '2025', '2024', '2023', '2022'];

  const hasActiveFilters =
    filters.query ||
    filters.subjectId ||
    filters.examTypeId ||
    filters.mbbsYear ||
    filters.examYear ||
    filters.sortBy !== 'latest';

  return (
    <div className="filter-bar-editorial mb-8">
      <div className="search-row mb-4">
        <div className="search-input-container">
          <Search className="search-icon w-5 h-5" />
          <input
            type="text"
            placeholder="Search Anatomy, Physiology, Semester 2025..."
            value={filters.query}
            onChange={(e) => onChange('query', e.target.value)}
            className="search-input-field"
          />
        </div>

        {hasActiveFilters && (
          <button onClick={onReset} className="btn btn-secondary btn-sm">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="filters-strip">
        <div className="filter-select-unit">
          <span className="select-label">Subject</span>
          <select
            value={filters.subjectId}
            onChange={(e) => onChange('subjectId', e.target.value)}
            className="select-field"
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
          <span className="select-label">Exam Type</span>
          <select
            value={filters.examTypeId}
            onChange={(e) => onChange('examTypeId', e.target.value)}
            className="select-field"
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
          <span className="select-label">MBBS Stage</span>
          <select
            value={filters.mbbsYear}
            onChange={(e) => onChange('mbbsYear', e.target.value)}
            className="select-field"
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
          <span className="select-label">Year</span>
          <select
            value={filters.examYear}
            onChange={(e) => onChange('examYear', e.target.value)}
            className="select-field"
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
          <span className="select-label">Sort</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="select-field"
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
          color: var(--text-muted);
        }

        .search-input-field {
          width: 100%;
          height: 48px;
          padding-left: 2.75rem;
          padding-right: 1rem;
          font-size: 1rem;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          background-color: #FFFFFF;
          color: var(--text-primary);
          outline: none;
        }

        .search-input-field:focus {
          border-color: var(--primary-teal);
        }

        .filters-strip {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .filter-select-unit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .select-label {
          font-size: 0.78125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .select-field {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background-color: #FFFFFF;
          color: var(--text-primary);
          outline: none;
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
            border-radius: 10px;
          }

          .search-row button {
            width: 100%;
            min-height: 44px;
            justify-content: center;
          }

          .filters-strip {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.625rem;
            padding-top: 0.75rem;
          }

          .filter-select-unit {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.2rem;
            width: 100%;
          }

          .select-field {
            width: 100%;
            min-height: 48px;
            border-radius: var(--radius-md);
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
