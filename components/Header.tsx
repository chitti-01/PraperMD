'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Upload } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Papers', href: '/browse' },
    { label: 'Subjects', href: '/browse' },
    { label: 'Upload', href: '/upload' },
    { label: 'Coverage', href: '/coverage' },
    { label: 'Admin', href: '/admin', isSubtle: true },
  ];

  return (
    <header className="editorial-header">
      <div className="container header-container">
        <Link href="/" className="brand-group">
          <div className="brand-symbol">
            <BookOpen className="w-5 h-5 text-dark" />
          </div>
          <div className="brand-meta">
            <span className="brand-name">PAPERMD</span>
            <span className="brand-sub font-mono">MEDICAL ARCHIVE</span>
          </div>
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link ${isActive ? 'nav-link-active' : ''} ${
                  item.isSubtle ? 'nav-link-subtle' : ''
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="header-cta">
          <Link href="/upload" className="btn btn-primary btn-sm header-upload-btn">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Paper</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .editorial-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: rgba(247, 246, 240, 0.96);
          backdrop-filter: blur(8px);
          border-bottom: 2px solid var(--border-dark);
          height: 64px;
          display: flex;
          align-items: center;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-symbol {
          width: 36px;
          height: 36px;
          background-color: var(--primary-yellow);
          border: 2px solid var(--border-dark);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 0 var(--border-dark);
        }

        .brand-meta {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.04em;
          line-height: 1;
        }

        .brand-sub {
          font-family: var(--font-mono);
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-top: 0.15rem;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .nav-link {
          font-family: var(--font-display);
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1.5px solid transparent;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background-color: #FFFFFF;
          border-color: var(--border-dark);
        }

        .nav-link-active {
          color: var(--text-primary);
          background-color: var(--primary-yellow);
          border-color: var(--border-dark);
          box-shadow: 2px 2px 0 var(--border-dark);
        }

        .nav-link-subtle {
          color: var(--text-muted);
          font-weight: 600;
        }

        .header-cta {
          display: flex;
          align-items: center;
        }

        .text-dark {
          color: var(--text-primary);
        }

        @media (max-width: 639px) {
          .editorial-header {
            height: var(--mobile-header-height, 56px);
          }
          .nav-menu {
            display: none;
          }
          .brand-group {
            gap: 0.5rem;
          }
          .brand-symbol {
            width: 32px;
            height: 32px;
            box-shadow: 1.5px 1.5px 0 var(--border-dark);
          }
          .brand-name {
            font-size: 1rem;
          }
          .brand-sub {
            font-size: 0.55rem;
          }
        }
      `}</style>
    </header>
  );
}
