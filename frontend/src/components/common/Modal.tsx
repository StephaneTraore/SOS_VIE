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
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: 12,
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          background: '#fff',
          borderRadius: 14,
          width: '100%',
          maxWidth: widths[size],
          margin: '0 auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s ease',
        }}
      >
        {title && (
          <div style={{
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            borderBottom: '1px solid #f1f5f9',
            background: '#fff',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}>
            <h2 style={{
              fontSize: 16,
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
        <div style={{ padding: 18 }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '12px 18px',
            borderTop: '1px solid #f1f5f9',
            background: '#fff',
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
