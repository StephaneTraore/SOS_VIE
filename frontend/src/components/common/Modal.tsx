import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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

  const widths = { sm: 400, md: 560, lg: 720, xl: 900 };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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
          }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
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
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  whileHover={{ scale: 1.08, background: '#edf2f7' }}
                  whileTap={{ scale: 0.92 }}
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
                </motion.button>
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
