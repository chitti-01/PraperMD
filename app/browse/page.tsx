'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionPaper, Subject, ExamType } from '@/lib/types';
import PaperCard from '@/components/PaperCard';
import PaperFilter from '@/components/PaperFilter';
import { SearchX } from 'lucide-react';

function BrowseContent() {
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    query: searchParams.get('query') || '',
    subjectId: searchParams.get('subjectId') || '',
    examTypeId: searchParams.get('examTypeId') || '',
    mbbsYear: searchParams.get('mbbsYear') || '',
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

  useEffect(() => {
    async function fetchPapers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.query) params.set('query', filters.query);
        if (filters.subjectId) params.set('subjectId', filters.subjectId);
        if (filters.examTypeId) params.set('examTypeId', filters.examTypeId);
        if (filters.mbbsYear) params.set('mbbsYear', filters.mbbsYear);
        if (filters.examYear) params.set('examYear', filters.examYear);
        if (filters.sortBy) params.set('sortBy', filters.sortBy);

        const res = await fetch(`/api/papers?${params.toString()}`);
        const data = await res.json();

        setPapers(data.papers || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('Failed to fetch papers', err);
      } finally {
        setLoading(false);
      }
    }

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
      examYear: '',
      sortBy: 'latest',
    });
  };

  return (
    <div className="container">
      <div className="browse-header mb-8">
        <div className="eyebrow">BROWSE ARCHIVE</div>
        <h1 className="h1-hero">Question Papers</h1>
        <p className="subtext">
          Showing {total} paper{total === 1 ? '' : 's'} in the PaperMD archive.
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
        <div className="loading-box card p-12 text-center">
          <p className="subtext">Loading repository archive...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="empty-state card p-12 text-center">
          <SearchX className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="h2-title mb-2">No Matching Question Papers</h3>
          <p className="subtext mb-6">
            We couldn't find any papers matching your specific filter criteria.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="archive-rows-list">
          {papers.map((paper, idx) => (
            <PaperCard key={paper.id} paper={paper} index={idx + 1} />
          ))}
        </div>
      )}

      <style jsx>{`
        .browse-header {
          margin-top: 1rem;
        }

        .archive-rows-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="container p-8 text-center">Loading page...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
