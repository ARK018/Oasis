'use client';

import { useState, useEffect } from 'react';
import { C } from '@/lib/theme';
import { Icon } from './icons';

interface DrawerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Drawer({ title, onClose, children }: DrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => { setOpen(false); setTimeout(onClose, 300); };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: open ? 'rgba(28,25,22,0.38)' : 'rgba(28,25,22,0)', backdropFilter: open ? 'blur(5px)' : 'none', transition: 'background 0.3s, backdrop-filter 0.3s', display: 'flex', alignItems: 'flex-end' }}
    >
      <div style={{ width: '100%', height: '78vh', background: C.surface, borderRadius: '20px 20px 0 0', border: `1px solid ${C.border}`, borderBottom: 'none', boxShadow: '0 -16px 60px rgba(28,25,22,0.12)', transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: C.border }} />
        </div>
        <div style={{ flexShrink: 0, padding: '10px 28px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
          <button onClick={handleClose} style={{ background: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer', color: C.textSec, padding: '5px', borderRadius: 7, display: 'flex', alignItems: 'center' }}>
            <Icon name="close" size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 40px' }}>{children}</div>
      </div>
    </div>
  );
}
