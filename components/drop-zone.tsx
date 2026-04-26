'use client';

import { useState, useRef } from 'react';
import { C } from '@/lib/theme';
import { Icon } from './icons';

interface DropZoneProps {
  label: string;
  onFile: (file: File) => void;
  file: File | null;
}

export function DropZone({ label, onFile, file }: DropZoneProps) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      style={{ border: `1.5px dashed ${drag ? C.orange : C.border}`, borderRadius: 10, padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', background: drag ? C.orangeDim : '#FDFCFA', transition: 'all 0.15s' }}
    >
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      {file ? (
        <>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.orangeDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={15} color={C.orange} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.orangeText }}>{file.name}</span>
          <span style={{ fontSize: 11, color: C.textSec }}>Click to replace</span>
        </>
      ) : (
        <>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="upload" size={15} color={C.textSec} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</span>
          <span style={{ fontSize: 11, color: C.textSec }}>PNG or JPG, up to 10 MB</span>
        </>
      )}
    </div>
  );
}
