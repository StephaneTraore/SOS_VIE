import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

const baseField: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  fontSize: 14,
  color: '#0f172a',
  background: '#fff',
  transition: 'border-color 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.2s var(--ease)',
  boxSizing: 'border-box',
};

export default function Input({ label, error, icon, hint, className = '', ...props }: InputProps) {
  const borderColor = error ? '#ef4444' : '#e2e8f0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', letterSpacing: 0.1 }}>
          {label}
          {props.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
              pointerEvents: 'none',
              fontSize: 15,
            }}
          >
            {icon}
          </span>
        )}
        <input
          {...props}
          className={className}
          style={{
            ...baseField,
            padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            borderColor,
            ...props.style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? '#ef4444' : '#0096C7';
            e.target.style.boxShadow = `0 0 0 4px ${error ? 'rgba(239,68,68,0.15)' : 'rgba(0,150,199,0.15)'}`;
            e.target.style.background = '#fff';
            props.onFocus?.(e);
          }}
          onBlur={e => {
            e.target.style.borderColor = borderColor;
            e.target.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
        />
      </div>
      {hint && !error && (
        <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{hint}</p>
      )}
      {error && (
        <p
          style={{
            fontSize: 12,
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
          }}
        >
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

export function Select({ label, error, options, icon, className = '', ...props }: SelectProps) {
  const borderColor = error ? '#ef4444' : '#e2e8f0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', letterSpacing: 0.1 }}>
          {label}
          {props.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <select
          {...props}
          className={className}
          style={{
            ...baseField,
            padding: icon ? '12px 40px 12px 42px' : '12px 40px 12px 14px',
            borderColor,
            appearance: 'none',
            cursor: 'pointer',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            ...props.style,
          }}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠ {error}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, ...props }: TextAreaProps) {
  const borderColor = error ? '#ef4444' : '#e2e8f0';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155', letterSpacing: 0.1 }}>
          {label}
          {props.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        rows={props.rows || 4}
        style={{
          ...baseField,
          resize: 'vertical',
          lineHeight: 1.55,
          borderColor,
          ...props.style,
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? '#ef4444' : '#0096C7';
          e.target.style.boxShadow = `0 0 0 4px ${error ? 'rgba(239,68,68,0.15)' : 'rgba(0,150,199,0.15)'}`;
          props.onFocus?.(e);
        }}
        onBlur={e => {
          e.target.style.borderColor = borderColor;
          e.target.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚠ {error}</p>
      )}
    </div>
  );
}
