'use client';

import Link from 'next/link';
import { BookOpen, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="editorial-footer">
      <div className="container footer-container">
        <div className="footer-top-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-symbol">
                <BookOpen className="w-4 h-4 text-dark" />
              </div>
              <span className="footer-brand-title">PAPERMD</span>
            </div>
            <p className="footer-desc">
              Academic Question Paper Repository for medical students. Simple, free, data-driven, and community-archived.
            </p>
            <div className="college-pill font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-yellow" />
              <span>OFFICIAL MEDICAL REPOSITORY</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Archive Routes</h4>
            <ul className="footer-links font-mono">
              <li><Link href="/">[01] Home</Link></li>
              <li><Link href="/browse">[02] Browse Archive</Link></li>
              <li><Link href="/scan">[03] Mobile Scanner</Link></li>
              <li><Link href="/upload">[04] Upload Paper</Link></li>
              <li><Link href="/coverage">[05] Subject Matrix</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Medical Core</h4>
            <ul className="footer-links font-mono">
              <li><Link href="/browse?subjectId=sub-anat-01">Anatomy</Link></li>
              <li><Link href="/browse?subjectId=sub-phys-02">Physiology</Link></li>
              <li><Link href="/browse?subjectId=sub-bioc-03">Biochemistry</Link></li>
              <li><Link href="/browse?subjectId=sub-path-04">Pathology & Pharmacology</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Administration</h4>
            <ul className="footer-links font-mono">
              <li>
                <Link href="/admin" className="admin-footer-link">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Admin Quality Portal</span>
                </Link>
              </li>
            </ul>
            <div className="notice-box mt-4 font-mono">
              <ShieldAlert className="w-4 h-4 text-yellow" />
              <span>For medical academic reference & exam preparation only.</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-line font-mono">
          <p>© 2026 PAPERMD • MEDICAL ACADEMIC ARCHIVE SYSTEM</p>
        </div>
      </div>

      <style jsx>{`
        .editorial-footer {
          background-color: #111827;
          color: #9CA3AF;
          padding-top: 3rem;
          padding-bottom: 2.5rem;
          border-top: 3px solid #111827;
        }

        @media (max-width: 639px) {
          .editorial-footer {
            padding-top: 2rem;
            padding-bottom: calc(var(--mobile-bottom-nav-height, 60px) + 2rem);
          }
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }

        @media (min-width: 480px) and (max-width: 767px) {
          .footer-top-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .brand-col {
            grid-column: span 2;
          }
        }

        @media (min-width: 768px) {
          .editorial-footer {
            padding-top: 3.5rem;
          }
          .footer-top-grid {
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
            gap: 2.5rem;
          }
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 0.875rem;
        }

        .footer-symbol {
          width: 32px;
          height: 32px;
          background-color: var(--primary-yellow);
          border: 1.5px solid #FFFFFF;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-brand-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.04em;
        }

        .footer-desc {
          font-size: 0.875rem;
          line-height: 1.6;
          margin-bottom: 1.25rem;
          color: #9CA3AF;
          max-width: 320px;
        }

        .college-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #1F2937;
          border: 1px solid #374151;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: #F3F4F6;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .footer-heading {
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 800;
          color: #FFFFFF;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 1.25rem;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .footer-links a {
          font-size: 0.8125rem;
          color: #9CA3AF;
          transition: color 0.15s ease;
        }

        .footer-links a:hover {
          color: var(--primary-yellow);
        }

        .admin-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-yellow) !important;
          font-weight: 700;
        }

        .notice-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #F3F4F6;
          background-color: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.3);
          padding: 0.625rem;
          border-radius: var(--radius-sm);
        }

        .footer-bottom-line {
          margin-top: 3.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1F2937;
          text-align: center;
          font-size: 0.75rem;
          color: #6B7280;
          letter-spacing: 0.05em;
        }

        .text-dark {
          color: #111827;
        }
        .text-yellow {
          color: var(--primary-yellow);
        }
      `}</style>
    </footer>
  );
}

