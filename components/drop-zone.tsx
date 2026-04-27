'use client';

import { useState, useRef } from 'react';
import { C } from '@/lib/theme';
import { Icon } from './icons';

interface SingleProps {
  label: string;
  multiple?: false;
  onFile: (file: File) => void;
  file: File | null;
}

interface MultiProps {
  label: string;
  multiple: true;
  onFiles: (files: File[]) => void;
  files: File[];
}

type DropZoneProps = SingleProps | MultiProps;

export function DropZone(props: DropZoneProps) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  if (props.multiple) {
    const { label, onFiles, files } = props;

    const addFiles = (incoming: FileList | null) => {
      if (!incoming) return;
      const next = [...files];
      Array.from(incoming).forEach(f => {
        if (!next.find(x => x.name === f.name && x.size === f.size)) next.push(f);
      });
      onFiles(next);
    };

    const remove = (i: number) => {
      const next = [...files];
      next.splice(i, 1);
      onFiles(next);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
          style={{ border: `1.5px dashed ${drag ? C.orange : C.border}`, borderRadius: 10, padding: '18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', background: drag ? C.orangeDim : '#FDFCFA', transition: 'all 0.15s' }}
        >
          <input
            ref={ref}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
          />
          <div style={{ width: 32, height: 32, borderRadius: 8, background: files.length ? C.orangeDim : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="upload" size={15} color={files.length ? C.orange : C.textSec} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
            {files.length ? 'Drop more pages or click to add' : label}
          </span>
          <span style={{ fontSize: 11, color: C.textSec }}>PNG or JPG, up to 10 MB each</span>
        </div>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7 }}>
                <Icon name="file" size={12} color={C.textSec} />
                <span style={{ fontSize: 12, color: C.text, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Page {i + 1} — {f.name}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); remove(i); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                >
                  <Icon name="close" size={11} color={C.textMuted} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Single mode
  const { label, onFile, file } = props;
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
