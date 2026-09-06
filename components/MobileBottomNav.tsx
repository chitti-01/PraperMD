'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Camera, Upload, Grid } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation inside active camera scanner screen to maximize viewfinder area
  if (pathname === '/scan') {
    return null;
  }

  const items = [
    { label: 'Browse', href: '/browse', icon: Search },
    { label: 'Scan', href: '/scan', icon: Camera, isScan: true },
    { label: 'Upload', href: '/upload', icon: Upload },
    { label: 'Coverage', href: '/coverage', icon: Grid },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
      <div className="mobile-nav-grid">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-cell ${isActive ? 'nav-cell-active' : ''} ${item.isScan ? 'nav-cell-scan' : ''}`}
            >
              <div className={`icon-container ${isActive ? 'icon-container-active' : ''} ${item.isScan ? 'icon-scan-bg' : ''}`}>
                <Icon className="w-5 h-5 nav-icon" />
              </div>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 900;
          background-color: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border-subtle);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -2px 10px rgba(17, 24, 39, 0.04);
        }

        @media (max-width: 639px) {
          .mobile-bottom-nav {
            display: block;
          }
        }

        .mobile-nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: var(--mobile-bottom-nav-height, 60px);
          align-items: center;
        }

        .nav-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-decoration: none;
          gap: 2px;
          transition: color 0.15s ease;
          user-select: none;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 26px;
          border-radius: var(--radius-pill);
          transition: background-color 0.15s ease;
        }

        .nav-cell-active {
          color: var(--primary-teal);
        }

        .nav-cell-active .icon-container-active {
          background-color: var(--primary-teal-light);
          color: var(--primary-teal);
        }

        .nav-cell-scan {
          color: var(--accent-highlight);
        }

        .nav-cell-scan .icon-scan-bg {
          background-color: var(--accent-highlight-bg);
          color: var(--accent-highlight);
        }

        .nav-cell-scan.nav-cell-active .icon-scan-bg {
          background-color: var(--accent-highlight);
          color: #FFFFFF;
        }

        .nav-label {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .nav-cell-active .nav-label {
          font-weight: 700;
        }
      `}</style>
    </nav>
  );
}

