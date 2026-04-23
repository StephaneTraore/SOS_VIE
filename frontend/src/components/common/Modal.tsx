import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(env(safe-area-inset-top), clamp(8px, 3vw, 20px)) max(env(safe-area-inset-right), clamp(8px, 3vw, 20px)) max(env(safe-area-inset-bottom), clamp(8px, 3vw, 20px)) max(env(safe-area-inset-left), clamp(8px, 3vw, 20px))',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="app-modal"
        style={{
          background: '#fff',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          width: '100%',
          maxWidth: widths[size],
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'scaleIn 0.25s ease',
          overflow: 'hidden',
        }}
      >
        {title && (
          <div style={{
            padding: 'clamp(12px, 3vw, 20px) clamp(14px, 3vw, 24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            borderBottom: '1px solid #f1f5f9',
            flexShrink: 0,
          }}>
            <h2 style={{
              fontSize: 'clamp(14px, 2.2vw, 18px)',
              fontWeight: 700,
              color: '#1a202c',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                background: '#f7fafc',
                border: 'none',
                width: 32,
                height: 32,
                borderRadius: 8,
                fontSize: 18,
                color: '#718096',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{
          padding: 'clamp(12px, 3vw, 24px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          flex: 1,
          minHeight: 0,
        }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: 'clamp(10px, 2.5vw, 16px) clamp(14px, 3vw, 24px)',
            borderTop: '1px solid #f1f5f9',
            background: '#fff',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
