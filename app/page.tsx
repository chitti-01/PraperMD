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
  Upload,
  ArrowUpRight,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentPapers, setRecentPapers] = useState<QuestionPaper[]>([]);
  const [totalPapers, setTotalPapers] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function loadData() {
    setLoading(true);
    setHasError(false);
    try {
      const [papersRes, metaRes] = await Promise.all([
        fetch('/api/papers?limit=6'),
        fetch('/api/metadata'),
      ]);

      const papersData = await papersRes.json();
      const metaData = await metaRes.json();

      if (!papersRes.ok || papersData.success === false) {
        console.error('Database connection notice:', papersData.error || papersData.message);
        setHasError(true);
        setRecentPapers([]);
        setTotalPapers(0);
      } else {
        setRecentPapers(papersData.papers || []);
        setTotalPapers(papersData.total || (papersData.papers ? papersData.papers.length : 0));
        setHasError(false);
      }
      setSubjects(metaData.subjects || []);
    } catch (err) {
      console.error('Failed to load homepage data', err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const getSubjectIcon = (slug: string) => {
    switch (slug) {
      case 'anatomy':
        return <Activity className="w-4 h-4 text-dark" />;
      case 'physiology':
        return <HeartPulse className="w-4 h-4 text-dark" />;
      case 'biochemistry':
        return <Atom className="w-4 h-4 text-dark" />;
      case 'pathology':
        return <Microscope className="w-4 h-4 text-dark" />;
      case 'pharmacology':
        return <Pill className="w-4 h-4 text-dark" />;
      case 'microbiology':
        return <Biohazard className="w-4 h-4 text-dark" />;
      case 'general-medicine':
        return <Stethoscope className="w-4 h-4 text-dark" />;
      case 'general-surgery':
        return <Crosshair className="w-4 h-4 text-dark" />;
      default:
        return <FileText className="w-4 h-4 text-dark" />;
    }
  };

  // Top 6 subjects for compact discovery
  const topSubjects = subjects.slice(0, 6);

  return (
    <div className="home-container">
      {/* 1. Centered Hero Section */}
      <section className="hero-section text-center mb-10">
        <div className="eyebrow font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5 inline mr-1 text-dark" />
          <span>PAPERMD ARCHIVE</span>
        </div>

        <h1 className="h1-hero hero-title mb-3">
          MEDICAL QUESTION PAPER ARCHIVE
        </h1>

        <p className="hero-desc mx-auto mb-8">
          Find previous university, semester, internal assessment, and practical question papers from your medical college.
        </p>

        {/* DOMINANT Search Box */}
        <form onSubmit={handleSearchSubmit} className="search-box-wrap mx-auto mb-6">
          <div className="search-input-box">
            <Search className="search-icon w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search Anatomy, Physiology, 2025..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input font-display"
            />
            <button type="submit" className="btn btn-primary search-submit-btn font-display">
              <span>SEARCH</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>

        {/* 2 Supporting Actions */}
        <div className="hero-actions flex-center gap-3">
          <Link href="/browse" className="btn btn-secondary btn-md">
            <span>Browse Papers</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link href="/upload" className="btn btn-primary btn-md">
            <Upload className="w-4 h-4 mr-1" />
            <span>Upload Paper</span>
          </Link>
        </div>
      </section>

      {/* 2. Restrained Repository Summary Bar */}
      <section className="summary-bar mb-12">
        <div className="summary-strip font-mono text-center">
          <span>{loading ? '...' : totalPapers} INDEXED PAPERS</span>
          <span className="dot">•</span>
          <span>{loading ? '...' : subjects.length} MEDICAL SUBJECTS</span>
          <span className="dot">•</span>
          <span>4 EXAM CATEGORIES</span>
          <span className="dot">•</span>
          <span>FREE PUBLIC ARCHIVE</span>
        </div>
      </section>

      {/* 3. Compact Subject Discovery Section */}
      <section className="subject-section mb-12">
        <div className="section-header flex-between mb-4">
          <div>
            <h2 className="h2-title text-xl">Browse by Subject</h2>
          </div>
          <Link href="/browse" className="view-link font-mono">
            <span>View all subjects</span>
            <ArrowUpRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <div className="compact-subjects-grid">
          {topSubjects.map((sub) => (
            <Link key={sub.id} href={`/browse?subjectId=${sub.id}`} className="compact-subject-card">
              <div className="subject-icon-wrap">
                {getSubjectIcon(sub.slug)}
              </div>
              <span className="subject-name font-display">{sub.name}</span>
              <ArrowRight className="w-3.5 h-3.5 arrow-sub text-muted" />
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Compact Recent Papers Section */}
      <section className="recent-section mb-12">
        <div className="section-header flex-between mb-4">
          <div>
            <h2 className="h2-title text-xl">Recently Archived Papers</h2>
          </div>
          <Link href="/browse" className="view-link font-mono">
            <span>View complete archive →</span>
          </Link>
        </div>

        {loading ? (
          <div className="card p-6 text-center font-mono text-sm text-muted">
            <p>Loading recent papers...</p>
          </div>
        ) : hasError ? (
          <div className="card text-center p-6 bg-card border-dark">
            <p className="font-display font-bold text-dark mb-1">Unable to load recent papers right now.</p>
            <p className="text-xs text-muted mb-4 font-mono">Check server connectivity or try refreshing.</p>
            <button onClick={loadData} className="btn btn-secondary btn-sm inline-flex items-center">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Try again</span>
            </button>
          </div>
        ) : recentPapers.length === 0 ? (
          <div className="card text-center p-6">
            <p className="subtext mb-3">No papers available yet.</p>
            <Link href="/upload" className="btn btn-primary btn-sm">
              Upload the First Paper
            </Link>
          </div>
        ) : (
          <div className="recent-papers-grid">
            {recentPapers.map((paper, idx) => (
              <PaperCard key={paper.id} paper={paper} index={idx + 1} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Minimal "How PaperMD Works" Flow */}
      <section className="how-it-works-section mb-12">
        <div className="card p-6">
          <div className="text-center mb-6">
            <span className="eyebrow font-mono mb-1">ARCHIVE ECOSYSTEM</span>
            <h2 className="h2-title text-lg">How PaperMD Works</h2>
          </div>

          <div className="flow-steps-grid font-mono">
            <div className="flow-step">
              <span className="step-badge">01</span>
              <h4 className="step-heading">UPLOAD</h4>
              <p className="step-text">Student scans or uploads question paper PDF.</p>
            </div>
            <div className="flow-step">
              <span className="step-badge">02</span>
              <h4 className="step-heading">OPTIMIZE</h4>
              <p className="step-text">Engine compresses file keeping text sharp.</p>
            </div>
            <div className="flow-step">
              <span className="step-badge">03</span>
              <h4 className="step-heading">ARCHIVE</h4>
              <p className="step-text">Stored permanently in medical repository.</p>
            </div>
            <div className="flow-step">
              <span className="step-badge">04</span>
              <h4 className="step-heading">FIND</h4>
              <p className="step-text">Future batches search & download freely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Simplified Community Contribution Banner */}
      <section className="contribution-section mb-6">
        <div className="card contribution-banner p-6 text-center">
          <h2 className="h2-title text-xl mb-2">Have a Question Paper from Your College?</h2>
          <p className="subtext text-sm mb-4 max-w-lg mx-auto">
            Help the next batch by contributing previous year or internal assessment question papers.
          </p>
          <Link href="/upload" className="btn btn-primary btn-md">
            <Upload className="w-4 h-4 mr-1" />
            <span>Upload Paper</span>
          </Link>
        </div>
      </section>

      <style jsx>{`
        .home-container {
          max-width: 1040px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .hero-section {
          padding-top: 2rem;
          padding-bottom: 1rem;
        }

        .hero-title {
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .hero-desc {
          max-width: 620px;
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .search-box-wrap {
          max-width: 660px;
          width: 100%;
        }

        .search-input-box {
          position: relative;
          display: flex;
          align-items: center;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-brutalist);
          padding: 0.35rem;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 48px;
          padding-left: 3.25rem;
          padding-right: 130px;
          border: none;
          outline: none;
          font-size: 1rem;
          font-weight: 600;
          background: transparent;
          color: var(--text-primary);
        }

        .search-submit-btn {
          position: absolute;
          right: 0.35rem;
          height: 42px;
          padding: 0 1.25rem;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Summary Strip */
        .summary-bar {
          display: flex;
          justify-content: center;
        }

        .summary-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          background-color: #FFFFFF;
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          padding: 0.5rem 1.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          box-shadow: 2px 2px 0 var(--border-dark);
        }

        .dot {
          color: var(--primary-yellow-hover);
        }

        /* Compact Subject Grid */
        .compact-subjects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .compact-subject-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: #FFFFFF;
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          box-shadow: 2px 2px 0 var(--border-dark);
          transition: transform 0.15s ease, background-color 0.15s ease;
        }

        .compact-subject-card:hover {
          transform: translateY(-2px);
          background-color: var(--primary-yellow-light);
        }

        .subject-icon-wrap {
          width: 32px;
          height: 32px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-dark);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .subject-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          flex: 1;
        }

        /* Recent Papers Grid */
        .recent-papers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        /* How it works */
        .flow-steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .flow-step {
          background-color: var(--bg-main);
          border: 1px solid var(--border-dark);
          border-radius: var(--radius-sm);
          padding: 0.875rem;
          text-align: center;
        }

        .step-badge {
          display: inline-block;
          background-color: var(--primary-yellow);
          color: var(--text-primary);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border: 1px solid var(--border-dark);
          border-radius: 3px;
          margin-bottom: 0.5rem;
        }

        .step-heading {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .step-text {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .contribution-banner {
          background-color: #FFFFFF;
          border: 2px solid var(--border-dark);
          box-shadow: 3px 3px 0 var(--border-dark);
        }

        .view-link {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .view-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 767px) {
          .compact-subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .recent-papers-grid {
            grid-template-columns: 1fr;
          }
          .flow-steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .compact-subjects-grid {
            grid-template-columns: 1fr;
          }
          .flow-steps-grid {
            grid-template-columns: 1fr;
          }
          .search-input {
            padding-right: 100px;
            font-size: 0.9rem;
          }
          .search-submit-btn {
            padding: 0 0.875rem;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}
