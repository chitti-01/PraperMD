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
                <span className="scan-label">Scan</span>
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
          background-color: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border-subtle);
          padding-bottom: env(safe-area-inset-bottom, 4px);
          box-shadow: 0 -4px 16px rgba(17, 24, 39, 0.05);
        }

        @media (max-width: 639px) {
          .mobile-bottom-nav {
            display: block;
          }
        }

        .mobile-nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: 62px;
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
          gap: 3px;
          font-size: 0.6875rem;
          font-weight: 600;
          transition: color 0.15s ease;
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
          top: -6px;
          text-decoration: none;
        }

        .scan-icon-bubble {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-highlight) 0%, #2563EB 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
