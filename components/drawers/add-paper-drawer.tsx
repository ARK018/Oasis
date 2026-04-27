'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { DropZone } from '../drop-zone';
import { Spinner } from '../spinner';
import { Field } from '../field';
import { C, inputStyle } from '@/lib/theme';
import { filesToBase64, bytesToMB } from '@/lib/utils';
import type { Subject } from '@/lib/types';

interface Props {
  subject: Subject;
  onClose: () => void;
  onDone: () => void;
}

export function AddPaperDrawer({ subject, onClose, onDone }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!files.length || !year) return;
    setLoading(true);
    setError('');
    try {
      const images = await filesToBase64(files);
      const totalSizeMB = files.reduce((sum, f) => sum + bytesToMB(f.size), 0);
      const filename = files.map(f => f.name).join(', ');
      const res = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
          year,
          subjectId: subject.id,
          filename,
          sizeMB: Math.round(totalSizeMB * 100) / 100,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Extraction failed. Please try again.');
      }
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Extraction failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Drawer title={`Add Question Paper — ${subject.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
          Upload one or more screenshots of the question paper (one per page). CrackIt will extract and classify questions using the full syllabus.
        </p>
        <DropZone
          multiple
          label="Drop question paper pages here or click to browse"
          onFiles={setFiles}
          files={files}
        />
        <Field label="Exam Year">
          <input
            value={year}
            onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="e.g. 2024"
            maxLength={4}
            style={inputStyle}
          />
        </Field>
        {loading && <Spinner message={`Extracting questions from ${files.length} page${files.length > 1 ? 's' : ''} using syllabus…`} />}
        {error && (
          <div style={{ padding: '10px 14px', background: '#FFF1F0', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!files.length || !year || loading} onClick={handle} icon="upload">
            {loading ? 'Processing…' : `Extract Questions${files.length > 1 ? ` (${files.length} pages)` : ''}`}
          </Btn>
        </div>
      </div>
    </Drawer>
  );
}
