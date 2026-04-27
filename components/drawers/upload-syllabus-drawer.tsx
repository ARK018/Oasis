'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { DropZone } from '../drop-zone';
import { Spinner } from '../spinner';
import { C } from '@/lib/theme';
import { filesToBase64, bytesToMB } from '@/lib/utils';
import type { Subject } from '@/lib/types';

interface Props {
  subject: Subject;
  onClose: () => void;
  onDone: () => void;
}

export function UploadSyllabusDrawer({ subject, onClose, onDone }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');
    try {
      const images = await filesToBase64(files);
      const totalSizeMB = files.reduce((sum, f) => sum + bytesToMB(f.size), 0);
      const filename = files.map(f => f.name).join(', ');
      const res = await fetch('/api/extract-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images,
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
    <Drawer title={`Upload Syllabus — ${subject.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
          Upload one or more images of the syllabus (one per page). CrackIt will extract modules, topics, and structure using AI.
        </p>
        <DropZone
          multiple
          label="Drop syllabus pages here or click to browse"
          onFiles={setFiles}
          files={files}
        />
        {loading && <Spinner message={`Processing ${files.length} page${files.length > 1 ? 's' : ''}…`} />}
        {error && (
          <div style={{ padding: '10px 14px', background: '#FFF1F0', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!files.length || loading} onClick={handle} icon="upload">
            {loading ? 'Processing…' : `Upload & Extract${files.length > 1 ? ` (${files.length} pages)` : ''}`}
          </Btn>
        </div>
      </div>
    </Drawer>
  );
}
