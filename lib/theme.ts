import type { CSSProperties } from 'react';

export const C = {
  bg: '#F7F4F0',
  surface: '#FFFFFF',
  surfaceHover: '#FAF8F5',
  border: '#EAE4DC',
  borderStrong: '#D4CCC3',
  text: '#1C1916',
  textSec: '#8A7F76',
  textMuted: '#C4BCB4',
  orange: '#D97757',
  orangeDim: '#D9775715',
  orangeText: '#B85E3C',
  nav: '#FFFFFF',
} as const;

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  border: `1.5px solid #EAE4DC`,
  borderRadius: 7,
  fontSize: 13,
  color: '#1C1916',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#FDFCFA',
  transition: 'border-color 0.15s',
};
