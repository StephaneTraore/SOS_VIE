import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
    color: '#fff',
    boxShadow: '0 8px 22px rgba(0,150,199,0.40), inset 0 1px 0 rgba(255,255,255,0.18)',
  },
  secondary: {
    background: '#0f172a',
    color: '#fff',
    boxShadow: '0 6px 18px rgba(15,23,42,0.25)',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#fff',
    boxShadow: '0 8px 22px rgba(239,68,68,0.40), inset 0 1px 0 rgba(255,255,255,0.18)',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    boxShadow: '0 8px 22px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
  },
  ghost: {
    background: 'transparent',
    color: '#334155',
  },
  outline: {
    background: 'transparent',
    border: '1.5px solid #0096C7',
    color: '#0077B6',
  },
};

const sizes: Record<string, React.CSSProperties> = {
  sm: { padding: '7px 14px', fontSize: 12, borderRadius: 10, gap: 6 },
  md: { padding: '11px 20px', fontSize: 13.5, borderRadius: 12, gap: 8 },
  lg: { padding: '14px 28px', fontSize: 15, borderRadius: 14, gap: 10 },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  fullWidth,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={className}
      style={{
        fontFamily: 'Inter, sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        letterSpacing: 0.1,
        border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        transition: 'transform 0.2s var(--ease-spring), box-shadow 0.2s var(--ease), filter 0.2s var(--ease)',
        whiteSpace: 'nowrap',
        ...variants[variant],
        ...sizes[size],
        ...props.style,
      }}
      onMouseEnter={e => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.05)';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={e => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.filter = 'brightness(1)';
        }
        props.onMouseLeave?.(e);
      }}
      onMouseDown={e => {
        if (!isDisabled) e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
        props.onMouseDown?.(e);
      }}
      onMouseUp={e => {
        if (!isDisabled) e.currentTarget.style.transform = 'translateY(-1px)';
        props.onMouseUp?.(e);
      }}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
