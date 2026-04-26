'use client';

import { C } from '@/lib/theme';
import { Icon } from './icons';
import type { MouseEventHandler } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

const vars: Record<Variant, { bg: string; color: string; border: string; shadow: string }> = {
  primary: { bg: C.orange, color: '#fff', border: 'none', shadow: '0 2px 8px #D9775530' },
  secondary: { bg: C.surfaceHover, color: C.text, border: `1px solid ${C.border}`, shadow: 'none' },
  ghost: { bg: 'transparent', color: C.textSec, border: `1px solid ${C.border}`, shadow: 'none' },
  danger: { bg: '#FFF1F0', color: '#DC2626', border: '1px solid #FECACA', shadow: 'none' },
};

interface BtnProps {
  children?: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
  size?: Size;
  icon?: Parameters<typeof Icon>[0]['name'];
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', icon, disabled, type = 'button' }: BtnProps) {
  const sm = size === 'sm';
  const v = vars[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        border: v.border, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', fontWeight: 600, transition: 'opacity 0.15s',
        borderRadius: 7, whiteSpace: 'nowrap', opacity: disabled ? 0.4 : 1,
        background: v.bg, color: v.color, boxShadow: v.shadow,
        fontSize: sm ? 12 : 13, padding: sm ? '6px 12px' : '8px 16px',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.8'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
    >
      {icon && <Icon name={icon} size={sm ? 12 : 13} color={v.color} />}
      {children}
    </button>
  );
}
