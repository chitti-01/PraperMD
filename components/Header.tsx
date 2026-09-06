'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Upload, Grid, Shield, Search, Camera } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Browse', href: '/browse', icon: Search },
    { label: 'Scan', href: '/scan', icon: Camera },
    { label: 'Upload', href: '/upload', icon: Upload },
    { label: 'Coverage', href: '/coverage', icon: Grid },
    { label: 'Admin', href: '/admin', icon: Shield },
  ];

  return (
    <header className="editorial-header">
      <div className="container header-container">
        <Link href="/" className="brand-group">
          <div className="brand-symbol">
            <BookOpen className="w-5 h-5 text-teal" />
          </div>
          <div className="brand-meta">
            <span className="brand-name">PaperMD</span>
            <span className="brand-sub">Academic Repository</span>
          </div>
        </Link>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="header-cta">
          <Link href="/scan" className="btn btn-primary btn-sm btn-header-scan">
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Paper</span>
          </Link>
          <Link href="/upload" className="btn btn-secondary btn-sm header-upload-btn">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .editorial-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: rgba(246, 247, 244, 0.92);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border-subtle);
          height: 72px;
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
          width: 38px;
          height: 38px;
          background-color: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .brand-meta {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-family: var(--font-mono);
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .brand-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 0.15rem;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .nav-link {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-secondary);
          position: relative;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }

        .nav-link:hover {
          color: var(--primary-teal);
        }

        .nav-link-active {
          color: var(--text-primary);
          font-weight: 700;
        }

        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--primary-teal);
        }

        .header-cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-header-scan {
          background-color: var(--accent-highlight);
          border-color: var(--accent-highlight);
        }

        @media (max-width: 640px) {
          .editorial-header {
            height: 60px;
          }
          .nav-menu {
            display: none;
          }
          .header-upload-btn {
            display: none;
          }
          .brand-group {
            gap: 0.5rem;
          }
          .brand-symbol {
            width: 34px;
            height: 34px;
          }
          .brand-name {
            font-size: 1rem;
          }
          .brand-sub {
            font-size: 0.6875rem;
            white-space: nowrap;
          }
          .btn-header-scan {
            padding: 0.35rem 0.75rem;
            font-size: 0.8125rem;
            min-height: 38px;
          }
        }

        :global(.text-teal) {
          color: var(--primary-teal);
        }
      `}</style>
    </header>
  );
}
