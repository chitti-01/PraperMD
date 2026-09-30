'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CoverageGrid from '@/components/CoverageGrid';
import { CoverageMatrixItem } from '@/lib/types';
import { Upload, CheckCircle2, Grid } from 'lucide-react';

export default function CoveragePage() {
  const [years, setYears] = useState<number[]>([2023, 2024, 2025, 2026]);
  const [matrix, setMatrix] = useState<CoverageMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCoverage() {
      try {
        const res = await fetch('/api/coverage');
        const data = await res.json();
        setYears(data.years || [2023, 2024, 2025, 2026]);
        setMatrix(data.matrix || []);
      } catch (err) {
        console.error('Failed to load coverage matrix', err);
      } finally {
        setLoading(false);
      }
    }

    loadCoverage();
  }, []);

  return (
    <div className="container max-w-5xl">
      <div className="coverage-header mb-6">
        <div className="eyebrow font-mono">
          <Grid className="w-3.5 h-3.5 inline mr-1 text-dark" />
          <span>REPOSITORY MATRIX</span>
        </div>
        <h1 className="h1-hero">ARCHIVE COVERAGE</h1>
        <p className="subtext font-mono mt-1">
          SUBJECT BY EXAM YEAR INDEX • VERIFIED COMPLETION MATRIX
        </p>
      </div>

      <div className="editorial-banner mb-8 card font-mono">
        <CheckCircle2 className="w-5 h-5 text-emerald flex-shrink-0" />
        <span>
          Clicking any <strong>✓</strong> green checkmark opens papers for that year. Dash <strong>—</strong> indicates missing papers that students are encouraged to upload.
        </span>
      </div>

      {loading ? (
        <div className="card p-12 text-center font-mono">
          <p className="subtext">Calculating real subject coverage matrix from database...</p>
        </div>
      ) : (
        <CoverageGrid years={years} matrix={matrix} />
      )}

      <div className="callout-box card mt-10 text-center p-8">
        <Upload className="w-8 h-8 text-dark mx-auto mb-3" />
        <h3 className="h2-title text-xl mb-2 font-display">HAVE A MISSING QUESTION PAPER?</h3>
        <p className="subtext mb-6 max-w-lg mx-auto font-mono">
          Help medical batchmates by scanning or uploading previous year or internal assessment papers.
        </p>
        <Link href="/upload" className="btn btn-primary btn-lg">
          <Upload className="w-5 h-5" />
          <span>Upload Question Paper</span>
        </Link>
      </div>

      <style jsx>{`
        .max-w-5xl {
          max-width: 1040px;
          margin-left: auto;
          margin-right: auto;
        }

        .coverage-header {
          margin-top: 0.75rem;
        }

        .editorial-banner {
          background-color: var(--primary-yellow-light);
          border: var(--border-width-bold) solid var(--border-dark);
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          box-shadow: var(--shadow-brutalist-sm);
        }

        .callout-box {
          background-color: var(--primary-yellow-light);
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: var(--shadow-brutalist-lg);
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .text-emerald {
          color: var(--accent-emerald);
        }

        .text-dark {
          color: #111827;
        }
      `}</style>
    </div>
  );
}

