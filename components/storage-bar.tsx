'use client';

import { useState } from 'react';
import { C } from '@/lib/theme';
import { formatMB } from '@/lib/utils';

const TOTAL_MB = 1024;
const SEGMENTS = 12;

export function StorageBar({ usedMB }: { usedMB: number }) {
  const [hov, setHov] = useState(false);
  const pct = Math.min(usedMB / TOTAL_MB, 1);
  const filledCount = Math.round(pct * SEGMENTS);
  const usedLabel = formatMB(usedMB);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const filled = i < filledCount;
          const intensity = filled ? 1 - (i / filledCount) * 0.45 : 0;
          const bg = filled ? `rgba(217, 119, 87, ${0.35 + intensity * 0.65})` : C.border;
          return <div key={i} style={{ width: 4, height: 14, borderRadius: 2, background: bg, transition: 'background 0.2s' }} />;
        })}
      </div>
      <span style={{ fontSize: 11, color: C.textSec, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {usedLabel} <span style={{ color: C.textMuted }}>/ 1 GB</span>
      </span>
      {hov && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: '10px 14px', boxShadow: '0 8px 24px rgba(28,25,22,0.12)', minWidth: 180, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, color: C.textSec, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storage</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            {usedLabel} <span style={{ fontWeight: 500, color: C.textSec }}>of 1 GB used</span>
          </div>
          <div style={{ height: 5, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: `linear-gradient(90deg, ${C.orange}, #E8A070)`, borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 5 }}>{Math.round(pct * 100)}% used · {formatMB(TOTAL_MB - usedMB)} free</div>
        </div>
      )}
    </div>
  );
}
