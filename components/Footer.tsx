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
              <BookOpen className="w-5 h-5 text-teal" />
              <span className="footer-brand-title">PaperMD</span>
            </div>
            <p className="footer-desc">
              Academic Question Paper Repository for medical students. Simple, free, and community-driven.
            </p>
            <div className="college-pill">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
              <span>Medical Academic Repository</span>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/browse">Browse Archive</Link></li>
              <li><Link href="/upload">Upload Question Paper</Link></li>
              <li><Link href="/coverage">Repository Coverage</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Medical Subjects</h4>
            <ul className="footer-links">
              <li><Link href="/browse?subjectId=sub-anat-01">Anatomy</Link></li>
              <li><Link href="/browse?subjectId=sub-phys-02">Physiology</Link></li>
              <li><Link href="/browse?subjectId=sub-bioc-03">Biochemistry</Link></li>
              <li><Link href="/browse?subjectId=sub-path-04">Pathology & Pharmacology</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Administration</h4>
            <ul className="footer-links">
              <li>
                <Link href="/admin" className="admin-footer-link">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Admin Quality Portal</span>
                </Link>
              </li>
            </ul>
            <div className="notice-box mt-4">
              <ShieldAlert className="w-4 h-4 text-amber" />
              <span>For academic reference & exam preparation only.</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-line">
          <p>© 2026 PaperMD — Medical Academic Question Paper Repository.</p>
        </div>
      </div>

      <style jsx>{`
        .editorial-footer {
          background-color: #111827;
          color: #9CA3AF;
          padding-top: 4rem;
          padding-bottom: 2.5rem;
          border-top: 1px solid #1F2937;
        }

        .footer-top-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }

        @media (min-width: 768px) {
          .footer-top-grid {
            grid-template-columns: 2fr 1fr 1fr 1.5fr;
          }
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.875rem;
        }

        .footer-brand-title {
          font-family: var(--font-mono);
          font-size: 1.25rem;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: 0.02em;
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
          padding: 0.375rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.78125rem;
          color: #E5E7EB;
          font-weight: 600;
        }

        .footer-heading {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 700;
          color: #FFFFFF;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .footer-links a {
          font-size: 0.875rem;
          color: #9CA3AF;
          transition: color 0.15s ease;
        }

        .footer-links a:hover {
          color: #2DD4BF;
        }

        .admin-footer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #38BDF8 !important;
          font-weight: 600;
        }

        .notice-box {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #D1D5DB;
          background-color: rgba(217, 119, 6, 0.1);
          padding: 0.625rem;
          border-radius: var(--radius-sm);
        }

        .footer-bottom-line {
          margin-top: 3.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #1F2937;
          text-align: center;
          font-size: 0.8125rem;
          color: #6B7280;
        }

        :global(.text-teal) {
          color: #2DD4BF;
        }
        :global(.text-emerald) {
          color: #34D399;
        }
        :global(.text-amber) {
          color: #FBBF24;
        }
      `}</style>
    </footer>
  );
}
