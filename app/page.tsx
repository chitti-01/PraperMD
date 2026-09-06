'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuestionPaper, Subject } from '@/lib/types';
import PaperCard from '@/components/PaperCard';
import {
  Search,
  ArrowRight,
  Activity,
  HeartPulse,
  Atom,
  Microscope,
  Pill,
  Biohazard,
  Stethoscope,
  Crosshair,
  FileText,
  Camera,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentPapers, setRecentPapers] = useState<QuestionPaper[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [papersRes, metaRes] = await Promise.all([
          fetch('/api/papers?limit=6'),
          fetch('/api/metadata'),
        ]);

        const papersData = await papersRes.json();
        const metaData = await metaRes.json();

        setRecentPapers(papersData.papers || []);
        setSubjects(metaData.subjects || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?query=${encodeURIComponent(query.trim())}`);
    }
  };

  // Helper to assign icons matching Reference 1 subject card design
  const getSubjectIcon = (slug: string) => {
    switch (slug) {
      case 'anatomy':
        return <Activity className="w-5 h-5 text-accent-blue" />;
      case 'physiology':
        return <HeartPulse className="w-5 h-5 text-accent-blue" />;
      case 'biochemistry':
        return <Atom className="w-5 h-5 text-accent-blue" />;
      case 'pathology':
        return <Microscope className="w-5 h-5 text-accent-blue" />;
      case 'pharmacology':
        return <Pill className="w-5 h-5 text-accent-blue" />;
      case 'microbiology':
        return <Biohazard className="w-5 h-5 text-accent-blue" />;
      case 'general-medicine':
        return <Stethoscope className="w-5 h-5 text-accent-blue" />;
      case 'general-surgery':
        return <Crosshair className="w-5 h-5 text-accent-blue" />;
      default:
        return <FileText className="w-5 h-5 text-accent-blue" />;
    }
  };

  return (
    <div className="container">
      {/* Reference 1 Recomposed Hero Section */}
      <section className="ref1-hero-section">
        <div className="hero-ref1-grid">
          {/* Left Column (44%): Compact Editorial Typography & Controls */}
          <div className="hero-left-col">
            <h1 className="h1-hero ref1-headline">
              Every question <br />
              has a history. <br />
              <span className="text-highlight">Start there.</span>
            </h1>

            <p className="subtext ref1-subtext mb-6">
              Access past question papers, explore previous exams and build your preparation on what truly matters.
            </p>

            {/* Integrated Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="ref1-search-form mb-5">
              <div className="search-box-ref1">
                <Search className="search-icon-ref1 w-5 h-5 text-muted" />
                <input
                  type="text"
                  placeholder="Search by subject, exam type, year..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input-ref1"
                />
                <button type="submit" className="btn btn-primary search-submit-ref1">
                  Search
                </button>
              </div>
            </form>

            {/* Mobile-First Priority CTAs */}
            <div className="ref1-cta-row">
              <Link href="/scan" className="btn btn-primary btn-lg ref1-btn-scan">
                <Camera className="w-5 h-5" />
                <span>Scan Paper</span>
              </Link>

              <Link href="/browse" className="btn btn-secondary btn-lg ref1-btn-browse">
                <FileText className="w-4 h-4 text-accent-blue" />
                <span>Browse Archive</span>
              </Link>
            </div>

            <div className="mt-3 text-sm text-muted">
              Have a PDF or scanned images? <Link href="/upload" className="font-semibold underline hover:text-teal">Upload File</Link>
            </div>
          </div>

          {/* Right Column (56%): Large Prominent Hero Artwork (1.5-2x scale) */}
          <div className="hero-right-col">
            <div className="hero-artwork-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-illustration.png"
                alt="PaperMD Question Paper Stack and Hourglass Illustration"
                className="hero-artwork-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reference 1 "Browse by Subject" Card Grid Section */}
      <section className="ref1-subjects-section">
        <div className="ref1-section-header mb-6">
          <h2 className="ref1-section-title">Browse by Subject</h2>
          <p className="ref1-section-sub">Explore question papers by subject.</p>
        </div>

        <div className="ref1-subjects-grid">
          {subjects.map((sub) => (
            <Link key={sub.id} href={`/browse?subjectId=${sub.id}`} className="ref1-subject-card">
              <div className="subject-icon-badge">
                {getSubjectIcon(sub.slug)}
              </div>

              <div className="subject-card-body">
                <h3 className="subject-card-title">{sub.name}</h3>
                <p className="subject-card-desc">{sub.description}</p>
              </div>

              <div className="subject-card-arrow">
                <ArrowRight className="w-4 h-4 text-muted arrow-icon" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Question Papers Archive */}
      <section className="section-recent mt-12">
        <div className="section-header-editorial flex-between mb-6">
          <div>
            <div className="eyebrow">LATEST ADDITIONS</div>
            <h2 className="h2-title">Recently Archived Papers</h2>
          </div>
          <Link href="/browse" className="view-all-link">
            <span>View Complete Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="loading-box card p-8 text-center">
            <p className="subtext">Loading repository entries...</p>
          </div>
        ) : recentPapers.length === 0 ? (
          <div className="empty-box card text-center p-8">
            <p className="subtext mb-4">No papers currently found. Upload the first paper!</p>
            <Link href="/upload" className="btn btn-primary">
              Upload Paper
            </Link>
          </div>
        ) : (
          <div className="archive-list">
            {recentPapers.map((paper, idx) => (
              <PaperCard key={paper.id} paper={paper} index={idx + 1} />
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .ref1-hero-section {
          padding-top: 1.5rem;
          padding-bottom: 3.5rem;
        }

        .hero-ref1-grid {
          display: grid;
          grid-template-columns: 44% 56%;
          gap: 2rem;
          align-items: center;
        }

        .hero-left-col {
          display: flex;
          flex-direction: column;
          max-width: 560px;
        }

        .ref1-headline {
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.08;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }

        .text-highlight {
          color: var(--accent-highlight);
        }

        .ref1-subtext {
          font-size: 1.0625rem;
          color: var(--text-muted);
          line-height: 1.55;
          margin-bottom: 1.75rem;
        }

        /* Search Input Box */
        .ref1-search-form {
          width: 100%;
          max-width: 520px;
        }

        .search-box-ref1 {
          position: relative;
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border: 1px solid var(--border-medium);
          border-radius: 10px;
          box-shadow: 0 4px 16px rgba(17, 24, 39, 0.04);
          padding: 0.35rem;
        }

        .search-icon-ref1 {
          position: absolute;
          left: 1.125rem;
          pointer-events: none;
        }

        .search-input-ref1 {
          width: 100%;
          height: 48px;
          padding-left: 3rem;
          padding-right: 110px;
          border: none;
          outline: none;
          font-size: 0.9375rem;
          background: transparent;
          color: var(--text-primary);
        }

        .search-submit-ref1 {
          position: absolute;
          right: 0.35rem;
          height: 42px;
          padding: 0 1.25rem;
          border-radius: 8px;
          font-weight: 700;
        }

        /* Dual Action CTAs */
        .ref1-cta-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ref1-btn-scan {
          background-color: var(--accent-highlight);
          border-color: var(--accent-highlight);
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
        }

        .ref1-btn-browse {
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
        }

        /* Right Column: Large Artwork (Enlarged additional 50% and shifted left) */
        .hero-right-col {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        .hero-artwork-frame {
          width: 185%;
          max-width: 1450px;
          margin-left: -190px;
          display: flex;
          justify-content: center;
          align-items: center;
          mix-blend-mode: multiply;
          opacity: 0;
          animation:
            ref1Entrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards,
            ref1FloatLoop 7s ease-in-out 1s infinite;
          transition: transform 0.25s ease;
        }

        .hero-artwork-frame:hover {
          transform: scale(1.02);
        }

        .hero-artwork-img {
          width: 100%;
          height: auto;
          max-height: 1100px;
          object-fit: contain;
          user-select: none;
        }

        /* Keyframes */
        @keyframes ref1Entrance {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ref1FloatLoop {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-artwork-frame {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* Reference 1 "Browse by Subject" Cards Section */
        .ref1-subjects-section {
          margin-top: 3.5rem;
          margin-bottom: 3.5rem;
        }

        .ref1-section-title {
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .ref1-section-sub {
          font-size: 0.9375rem;
          color: var(--text-muted);
        }

        .ref1-subjects-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        @media (max-width: 1023px) {
          .ref1-subjects-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 639px) {
          .ref1-subjects-grid {
            grid-template-columns: 1fr;
          }
        }

        .ref1-subject-card {
          background-color: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(17, 24, 39, 0.03);
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }

        .ref1-subject-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 8px 20px -4px rgba(17, 24, 39, 0.07);
          transform: translateY(-2px);
        }

        .subject-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: var(--accent-highlight-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .subject-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .subject-card-title {
          font-size: 1.0625rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.25;
          margin-bottom: 0.25rem;
        }

        .subject-card-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .subject-card-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .arrow-icon {
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .ref1-subject-card:hover .arrow-icon {
          color: var(--accent-highlight);
          transform: translateX(3px);
        }

        .flex-between {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .archive-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--primary-teal);
        }

        :global(.text-accent-blue) {
          color: var(--accent-highlight);
        }

        /* Responsive Breakpoints for Hero */
        @media (max-width: 1023px) {
          .hero-ref1-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .hero-left-col {
            max-width: 100%;
          }

          .ref1-headline {
            font-size: 2.75rem;
          }

          .hero-artwork-frame {
            width: 100%;
            max-width: 100%;
            margin-left: 0;
          }

          .hero-artwork-img {
            max-height: 480px;
          }
        }
      `}</style>
    </div>
  );
}
