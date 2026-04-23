import React from 'react';

interface LogoProps {
  size?: number;
  /** Rounded square background behind the logo (disabled by default — the logo is already circular). */
  framed?: boolean;
  /** Drop shadow under the logo. */
  shadow?: boolean;
  /** Extra inline style overrides (e.g. margin). */
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
}

export default function Logo({
  size = 40,
  framed = false,
  shadow = true,
  style,
  className,
  alt = 'SOS VIE — Guinée',
}: LogoProps) {
  const img = (
    <img
      src={`${process.env.PUBLIC_URL || ''}/logo.png`}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        filter: shadow ? 'drop-shadow(0 6px 14px rgba(0,119,182,0.28))' : 'none',
      }}
    />
  );

  if (!framed) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }}>
        {img}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size + 8,
        height: size + 8,
        borderRadius: Math.round((size + 8) * 0.28),
        background: '#fff',
        border: '1px solid rgba(0,119,182,0.12)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: shadow ? '0 6px 18px rgba(0,119,182,0.18)' : 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {img}
    </div>
  );
}
