'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionPaper, Subject, ExamType } from '@/lib/types';
import PaperCard from '@/components/PaperCard';
import PaperFilter from '@/components/PaperFilter';
import { SearchX, Archive, RefreshCw } from 'lucide-react';

function BrowseContent() {
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    subjectId: searchParams.get('subjectId') || '',
    examTypeId: searchParams.get('examTypeId') || '',
    mbbsYear: searchParams.get('mbbsYear') || '',
    examAttempt: searchParams.get('examAttempt') || '',
    examYear: searchParams.get('examYear') || '',
    sortBy: searchParams.get('sortBy') || 'latest',
  });

  useEffect(() => {
    async function loadMetadata() {
      try {
        const res = await fetch('/api/metadata');
        const data = await res.json();
        setSubjects(data.subjects || []);
        setExamTypes(data.examTypes || []);
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }
    loadMetadata();
  }, []);

  const fetchPapers = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('query', filters.query);
      if (filters.subjectId) params.set('subjectId', filters.subjectId);
      if (filters.examTypeId) params.set('examTypeId', filters.examTypeId);
      if (filters.mbbsYear) params.set('mbbsYear', filters.mbbsYear);
      if (filters.examAttempt) params.set('examAttempt', filters.examAttempt);
      if (filters.examYear) params.set('examYear', filters.examYear);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/papers?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.success === false) {
        console.error('Papers query error:', data.error);
        setHasError(true);
        setPapers([]);
        setTotal(0);
      } else {
        setPapers(data.papers || []);
        setTotal(data.total || 0);
        setHasError(false);
      }
    } catch (err) {
      console.error('Failed to fetch papers', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      subjectId: '',
      examTypeId: '',
      mbbsYear: '',
      examAttempt: '',
      examYear: '',
      sortBy: 'latest',
    });
  };

  return (
    <div className="container">
      <div className="browse-header mb-6">
        <div className="eyebrow font-mono">
          <Archive className="w-3.5 h-3.5 inline mr-1 text-dark" />
          <span>BROWSE REPOSITORY ARCHIVE</span>
        </div>
        <h1 className="h1-hero">QUESTION PAPERS</h1>
        <p className="subtext font-mono mt-1">
          SHOWING <strong>{total}</strong> INDEXED PAPER{total === 1 ? '' : 'S'} IN THE PAPERMD ARCHIVE
        </p>
      </div>

      <PaperFilter
        subjects={subjects}
        examTypes={examTypes}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {loading ? (
        <div className="loading-box card p-12 text-center font-mono">
          <p className="subtext">Loading repository papers...</p>
        </div>
      ) : hasError ? (
        <div className="card text-center p-8 bg-card border-dark">
          <h3 className="h2-title mb-2">Unable to load question papers</h3>
          <p className="subtext mb-4 max-w-md mx-auto font-mono text-xs">
            We couldn&apos;t reach the repository database. Please try refreshing or checking your connection.
          </p>
          <button onClick={fetchPapers} className="btn btn-secondary btn-sm inline-flex items-center">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Try again</span>
          </button>
        </div>
      ) : papers.length === 0 ? (
        <div className="empty-state card p-12 text-center">
          <SearchX className="w-12 h-12 text-dark mx-auto mb-4" />
          <h3 className="h2-title mb-2">No Matching Question Papers</h3>
          <p className="subtext mb-6 max-w-md mx-auto">
            We couldn&apos;t find any question papers matching your specific filter parameters. Try clearing your search query or subject filters.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-lg">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="papers-grid">
          {papers.map((paper, idx) => (
            <PaperCard key={paper.id} paper={paper} index={idx + 1} />
          ))}
        </div>
      )}

      <style jsx>{`
        .browse-header {
          padding-top: 0.5rem;
        }

        .papers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        @media (max-width: 767px) {
          .papers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="container py-12 text-center font-mono">
        <p>Loading paper archive...</p>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
