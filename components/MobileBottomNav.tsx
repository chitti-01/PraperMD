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
              <span className="nav-label font-mono">{item.label}</span>
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
          background-color: #FFFFFF;
          border-top: 2px solid var(--border-dark);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -2px 0 var(--border-dark);
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
          width: 34px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1.5px solid transparent;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }

        .nav-cell-active {
          color: var(--text-primary);
        }

        .nav-cell-active .icon-container-active {
          background-color: var(--primary-yellow);
          border-color: var(--border-dark);
          color: #111827;
        }

        .nav-cell-scan {
          color: var(--text-primary);
        }

        .nav-cell-scan .icon-scan-bg {
          background-color: var(--primary-yellow-light);
          border-color: #EAB308;
          color: #111827;
        }

        .nav-cell-scan.nav-cell-active .icon-scan-bg {
          background-color: var(--primary-yellow);
          border-color: var(--border-dark);
          color: #111827;
          box-shadow: 1.5px 1.5px 0 #111827;
        }

        .nav-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          line-height: 1;
        }

        .nav-cell-active .nav-label {
          font-weight: 700;
          color: var(--text-primary);
        }
      `}</style>
    </nav>
  );
}


