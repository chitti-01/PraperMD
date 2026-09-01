'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CoverageGrid from '@/components/CoverageGrid';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function CoveragePage() {
  const [years, setYears] = useState<number[]>([2023, 2024, 2025, 2026]);
  const [matrix, setMatrix] = useState<any[]>([]);
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
    <div className="container">
      <div className="coverage-header mb-8">
        <div className="eyebrow">REPOSITORY MATRIX</div>
        <h1 className="h1-hero">Archive Coverage</h1>
        <p className="subtext">
          Where the archive is complete — and where a paper is still missing.
        </p>
      </div>

      <div className="editorial-banner mb-8">
        <CheckCircle2 className="w-5 h-5 text-emerald flex-shrink-0" />
        <span>
          Clicking any <strong>✓</strong> green checkmark opens the papers available for that year. Dash <strong>—</strong> indicates missing papers that students are encouraged to upload.
        </span>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <p className="subtext">Calculating subject coverage matrix...</p>
        </div>
      ) : (
        <CoverageGrid years={years} matrix={matrix} />
      )}

      <div className="callout-box card mt-10 text-center p-8">
        <Upload className="w-8 h-8 text-teal mx-auto mb-3" />
        <h3 className="h2-title text-xl mb-2">Have a Missing Paper?</h3>
        <p className="subtext mb-4">
          Help your fellow medical batchmates by uploading previous-year or internal assessment question papers.
        </p>
        <Link href="/upload" className="btn btn-primary btn-lg">
          Upload Question Paper
        </Link>
      </div>

      <style jsx>{`
        .coverage-header {
          margin-top: 1rem;
        }

        .editorial-banner {
          background-color: var(--bg-surface-subtle);
          border-left: 4px solid var(--accent-emerald);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .callout-box {
          background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%);
          border-color: #CCFBF1;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}
