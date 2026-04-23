import React from 'react';
import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function PageLayout({ children, noPadding }: PageLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {/* Ambient gradient orbs */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -140,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,180,216,0.14), transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -140,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(72,202,228,0.10), transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <Navbar />
      <main
        style={{
          paddingTop: 64,
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {noPadding ? (
          <div className="page-enter">{children}</div>
        ) : (
          <div className="page-container page-enter">{children}</div>
        )}
      </main>
    </div>
  );
}
