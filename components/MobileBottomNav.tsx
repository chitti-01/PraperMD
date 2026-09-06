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
    { label: 'Browse', href: '/browse', icon: Search, isPrimary: false },
    { label: 'Scan', href: '/scan', icon: Camera, isPrimary: true },
    { label: 'Upload', href: '/upload', icon: Upload, isPrimary: false },
    { label: 'Coverage', href: '/coverage', icon: Grid, isPrimary: false },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-grid">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item-scan-primary"
                aria-label="Scan Paper with Phone Camera"
              >
                <div className="scan-icon-bubble">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="scan-label">Scan Paper</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-5 h-5 nav-icon" />
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
          background-color: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border-subtle);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          box-shadow: 0 -4px 16px rgba(17, 24, 39, 0.06);
        }

        @media (max-width: 639px) {
          .mobile-bottom-nav {
            display: block;
          }
        }

        .mobile-nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: 60px;
          align-items: center;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-decoration: none;
          gap: 2px;
          font-size: 0.725rem;
          font-weight: 600;
          transition: color 0.15s ease;
          min-height: 48px;
        }

        .nav-item-active {
          color: var(--primary-teal);
          font-weight: 700;
        }

        .nav-item-scan-primary {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          top: -8px;
          text-decoration: none;
          min-height: 48px;
        }

        .scan-icon-bubble {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-highlight) 0%, #2563EB 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .nav-item-scan-primary:active .scan-icon-bubble {
          transform: scale(0.94);
        }

        .scan-label {
          font-size: 0.6875rem;
          font-weight: 800;
          color: var(--accent-highlight);
          margin-top: 1px;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  );
}
