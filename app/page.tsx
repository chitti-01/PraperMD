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
  Upload,
  Database,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentPapers, setRecentPapers] = useState<QuestionPaper[]>([]);
  const [totalPapers, setTotalPapers] = useState<number>(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [papersRes, metaRes] = await Promise.all([
          fetch('/api/papers?limit=6'),
          fetch('/api/metadata'),
        ]);

        const papersData = await papersRes.json();
        const metaData = await metaRes.json();

        if (!papersRes.ok || papersData.success === false) {
          setDbError(papersData.error || papersData.message || 'Database query error.');
          setRecentPapers([]);
          setTotalPapers(0);
        } else {
          setRecentPapers(papersData.papers || []);
          setTotalPapers(papersData.total || (papersData.papers ? papersData.papers.length : 0));
          setDbError(null);
        }
        setSubjects(metaData.subjects || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
        setDbError('Failed to connect to production database server.');
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

  const getSubjectIcon = (slug: string) => {
    switch (slug) {
      case 'anatomy':
        return <Activity className="w-5 h-5 text-dark" />;
      case 'physiology':
        return <HeartPulse className="w-5 h-5 text-dark" />;
      case 'biochemistry':
        return <Atom className="w-5 h-5 text-dark" />;
      case 'pathology':
        return <Microscope className="w-5 h-5 text-dark" />;
      case 'pharmacology':
        return <Pill className="w-5 h-5 text-dark" />;
      case 'microbiology':
        return <Biohazard className="w-5 h-5 text-dark" />;
      case 'general-medicine':
        return <Stethoscope className="w-5 h-5 text-dark" />;
      case 'general-surgery':
        return <Crosshair className="w-5 h-5 text-dark" />;
      default:
        return <FileText className="w-5 h-5 text-dark" />;
    }
  };

  return (
    <div className="container">
      {/* 1. Brutalist Editorial Hero Section */}
      <section className="hero-brutalist-section mb-12">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="eyebrow font-mono mb-3">
              <Database className="w-3.5 h-3.5 inline mr-1 text-yellow-dark" />
              <span>MEDICAL QUESTION-PAPER ARCHIVE</span>
            </div>

            <h1 className="h1-hero hero-title mb-4">
              PAPERMD <br />
              <span className="hero-highlight">ACADEMIC ARCHIVE</span>
            </h1>

            <p className="subtext hero-desc mb-6">
              Access previous university, semester, internal assessment, and practical question papers for medical students. Find previous papers from your college.
            </p>

            {/* Prominent Search Bar */}
            <form onSubmit={handleSearchSubmit} className="search-box-brutalist mb-6">
              <div className="search-input-wrap">
                <Search className="search-icon w-5 h-5 text-dark" />
                <input
                  type="text"
                  placeholder="Search by subject (e.g. Anatomy, Physiology, 2025)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input font-display"
                />
                <button type="submit" className="btn btn-primary search-btn font-display">
                  <span>SEARCH</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>

            {/* Quick Action CTAs */}
            <div className="hero-cta-row">
              <Link href="/browse" className="btn btn-primary btn-lg hero-cta-btn">
                <FileText className="w-5 h-5" />
                <span>Browse Archive</span>
              </Link>
              <Link href="/scan" className="btn btn-secondary btn-lg hero-cta-btn">
                <Camera className="w-5 h-5" />
                <span>Scan Paper</span>
              </Link>
              <Link href="/upload" className="btn btn-secondary btn-lg hero-cta-btn">
                <Upload className="w-5 h-5 text-teal" />
                <span>Upload PDF</span>
              </Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-brutalist-badge-card card">
              <div className="badge-card-header font-mono">
                <span className="badge badge-yellow">SYS_STATUS: ACTIVE</span>
                <span className="badge badge-emerald">RLS SECURED</span>
              </div>
              <div className="hero-card-illustration">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-illustration.png"
                  alt="PaperMD Question Paper Stack Illustration"
                  className="hero-artwork-img"
                />
              </div>
              <div className="badge-card-footer font-mono">
                <span>DATABASE VERSION 2.0</span>
                <span>• NO LOGIN REQUIRED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Database Statistics Counter Strip */}
      <section className="stats-brutalist-strip mb-12">
        <div className="stat-card card font-mono">
          <span className="stat-label">TOTAL PAPERS</span>
          <span className="stat-value">{loading ? '...' : totalPapers}</span>
          <span className="stat-sub">Indexed in GMC database</span>
        </div>
        <div className="stat-card card font-mono">
          <span className="stat-label">MEDICAL SUBJECTS</span>
          <span className="stat-value">{loading ? '...' : subjects.length}</span>
          <span className="stat-sub">Pre-clinical & Clinical</span>
        </div>
        <div className="stat-card card font-mono">
          <span className="stat-label">EXAM CATEGORIES</span>
          <span className="stat-value">4</span>
          <span className="stat-sub">Main, Supple, Prelim, Internal</span>
        </div>
        <div className="stat-card card card-yellow font-mono">
          <span className="stat-label">PUBLIC ACCESS</span>
          <span className="stat-value">FREE</span>
          <span className="stat-sub">Zero Paywalls & No Accounts</span>
        </div>
      </section>

      {/* 3. Subject Discovery Section */}
      <section className="subject-discovery-section mb-14">
        <div className="section-header-editorial flex-between mb-6">
          <div>
            <div className="eyebrow font-mono">REPOSITORY TAXONOMY</div>
            <h2 className="h2-title">Browse by Subject</h2>
          </div>
          <Link href="/browse" className="view-all-link font-mono">
            <span>Explore All Subjects</span>
            <ArrowUpRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <div className="subjects-grid">
          {subjects.map((sub) => (
            <Link key={sub.id} href={`/browse?subjectId=${sub.id}`} className="subject-card card">
              <div className="subject-icon-box">
                {getSubjectIcon(sub.slug)}
              </div>
              <div className="subject-card-body">
                <span className="subject-code font-mono">#{sub.slug.toUpperCase().substring(0, 4)}</span>
                <h3 className="subject-title font-display">{sub.name}</h3>
                <p className="subject-desc">{sub.description}</p>
              </div>
              <div className="subject-arrow-box">
                <ArrowRight className="w-4 h-4 arrow-icon" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Recent Question Papers Archive Section */}
      <section className="recent-archive-section mb-14">
        <div className="section-header-editorial flex-between mb-6">
          <div>
            <div className="eyebrow font-mono">LATEST REPOSITORY ENTRIES</div>
            <h2 className="h2-title">Recently Archived Papers</h2>
          </div>
          <Link href="/browse" className="view-all-link font-mono">
            <span>Complete Archive →</span>
          </Link>
        </div>

        {loading ? (
          <div className="loading-box card p-8 text-center font-mono">
            <p className="subtext">Connecting to production database...</p>
          </div>
        ) : dbError ? (
          <div className="card text-center p-8 bg-rose-card border-dark">
            <h3 className="font-display text-xl font-bold text-rose-900 mb-2">Database Connection Warning</h3>
            <p className="text-sm text-rose-800 mb-4">{dbError}</p>
            <p className="text-xs font-mono text-muted">Run migrations in Supabase SQL Editor (`00001_initial_schema.sql` & `00002_upload_intents.sql`).</p>
          </div>
        ) : recentPapers.length === 0 ? (
          <div className="empty-box card text-center p-8">
            <p className="subtext mb-4">No papers match your repository search. Upload the first paper!</p>
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

      {/* 5. Paper Lifecycle Informational Flowchart */}
      <section className="paper-lifecycle-section mb-14">
        <div className="card lifecycle-card">
          <div className="lifecycle-header mb-6">
            <div className="eyebrow font-mono">ARCHIVE ECOSYSTEM</div>
            <h2 className="h2-title">How PaperMD Repository Works</h2>
            <p className="subtext">From physical medical examination to permanent digital academic archive.</p>
          </div>

          <div className="lifecycle-flow-grid font-mono">
            <div className="flow-step-unit">
              <span className="step-num">01</span>
              <h4 className="step-title">EXAM TAKEN</h4>
              <p className="step-desc">Medical college holds term or university exam.</p>
            </div>
            <div className="flow-connector">→</div>

            <div className="flow-step-unit">
              <span className="step-num">02</span>
              <h4 className="step-title">STUDENT SCANS</h4>
              <p className="step-desc">Student captures pages via mobile camera or PDF.</p>
            </div>
            <div className="flow-connector">→</div>

            <div className="flow-step-unit">
              <span className="step-num">03</span>
              <h4 className="step-title">OPTIMIZE</h4>
              <p className="step-desc">Engine compresses file size while keeping text sharp.</p>
            </div>
            <div className="flow-connector">→</div>

            <div className="flow-step-unit">
              <span className="step-num">04</span>
              <h4 className="step-title">ARCHIVED</h4>
              <p className="step-desc">Stored permanently in Supabase storage archive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contribution Callout Banner */}
      <section className="contribution-banner-section mb-8">
        <div className="card contribution-card">
          <div className="contribution-content">
            <div className="eyebrow font-mono">COMMUNITY CONTRIBUTION</div>
            <h2 className="h2-title text-2xl mb-2">Have a Question Paper from Your College?</h2>
            <p className="subtext mb-6 max-w-xl">
              Help medical batchmates by adding previous year or internal assessment question papers to the archive.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/scan" className="btn btn-primary btn-lg">
                <Camera className="w-5 h-5" />
                <span>Scan Mobile Paper</span>
              </Link>
              <Link href="/upload" className="btn btn-secondary btn-lg">
                <Upload className="w-5 h-5 text-teal" />
                <span>Upload PDF Document</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-brutalist-section {
          padding-top: 1rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 56% 44%;
          gap: 2rem;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
        }

        .hero-title {
          font-size: clamp(2.25rem, 5.5vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .hero-highlight {
          background-color: var(--primary-yellow);
          color: #111827;
          padding: 0 0.5rem;
          border: 2px solid var(--border-dark);
          box-shadow: 2px 2px 0 var(--border-dark);
          display: inline-block;
        }

        .hero-desc {
          max-width: 580px;
          color: var(--text-secondary);
        }

        .search-box-brutalist {
          width: 100%;
          max-width: 580px;
        }

        .search-input-wrap {
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
          left: 1.125rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 48px;
          padding-left: 3rem;
          padding-right: 140px;
          border: none;
          outline: none;
          font-size: 0.9375rem;
          font-weight: 700;
          background: transparent;
          color: var(--text-primary);
        }

        .search-btn {
          position: absolute;
          right: 0.35rem;
          height: 42px;
          padding: 0 1.25rem;
        }

        .hero-cta-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .hero-brutalist-badge-card {
          padding: 1rem;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: 5px 5px 0 var(--border-dark);
        }

        .badge-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1.5px solid var(--border-dark);
          font-size: 0.75rem;
        }

        .hero-card-illustration {
          padding: 1.5rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-artwork-img {
          width: 100%;
          max-height: 280px;
          object-fit: contain;
        }

        .badge-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1.5px solid var(--border-dark);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        /* Stats Strip */
        .stats-brutalist-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: var(--shadow-brutalist);
        }

        .card-yellow {
          background-color: var(--primary-yellow-light);
          border-color: #EAB308;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.1;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .stat-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Subject Discovery */
        .flex-between {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .view-all-link {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 2px solid var(--border-dark);
        }

        .view-all-link:hover {
          color: var(--primary-teal);
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .subject-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background-color: #FFFFFF;
          border: var(--border-width-bold) solid var(--border-dark);
          box-shadow: var(--shadow-brutalist);
          text-decoration: none;
        }

        .subject-card:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0 var(--border-dark);
          background-color: #FFFDF5;
        }

        .subject-icon-box {
          width: 44px;
          height: 44px;
          background-color: var(--primary-yellow);
          border: 1.5px solid var(--border-dark);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 1.5px 1.5px 0 var(--border-dark);
        }

        .subject-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .subject-code {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.15rem;
        }

        .subject-title {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }

        .subject-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .subject-arrow-box {
          align-self: center;
        }

        .arrow-icon {
          transition: transform 0.15s ease;
        }

        .subject-card:hover .arrow-icon {
          transform: translateX(3px);
        }

        /* Archive list */
        .archive-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Flowchart */
        .lifecycle-card {
          padding: 2rem;
          background-color: #FFFFFF;
        }

        .lifecycle-flow-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .flow-step-unit {
          flex: 1;
          min-width: 140px;
          background-color: var(--bg-surface-subtle);
          border: 1.5px solid var(--border-dark);
          padding: 1rem;
          border-radius: var(--radius-sm);
        }

        .step-num {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary-teal);
        }

        .step-title {
          font-size: 0.875rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .step-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        .flow-connector {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        /* Contribution */
        .contribution-card {
          background-color: var(--primary-yellow-light);
          border: var(--border-width-bold) solid var(--border-dark);
          padding: 2.25rem;
          box-shadow: var(--shadow-brutalist-lg);
        }

        .text-dark {
          color: #111827;
        }

        .text-yellow-dark {
          color: #854D0E;
        }

        @media (max-width: 1023px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }
          .hero-right {
            display: none;
          }
          .stats-brutalist-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lifecycle-flow-grid {
            flex-direction: column;
            align-items: stretch;
          }
          .flow-connector {
            display: none;
          }
        }

        @media (max-width: 639px) {
          .stats-brutalist-strip {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .subjects-grid {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: clamp(1.75rem, 7.5vw, 2.5rem);
          }
          .search-input {
            padding-right: 1rem;
          }
          .search-input-wrap {
            flex-direction: column;
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            gap: 0.5rem;
          }
          .search-input {
            background-color: #FFFFFF;
            border: var(--border-width-bold) solid var(--border-dark);
            border-radius: var(--radius-sm);
            height: 48px;
            box-shadow: 2px 2px 0 var(--border-dark);
          }
          .search-btn {
            position: static;
            width: 100%;
            height: 48px;
          }
          .hero-cta-row {
            flex-direction: column;
          }
          .hero-cta-btn {
            width: 100%;
            justify-content: center;
          }
          .contribution-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

