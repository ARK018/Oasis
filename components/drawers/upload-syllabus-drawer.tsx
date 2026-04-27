'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { DropZone } from '../drop-zone';
import { Spinner } from '../spinner';
import { C } from '@/lib/theme';
import { fileToBase64, bytesToMB } from '@/lib/utils';
import type { Subject } from '@/lib/types';

interface Props {
  subject: Subject;
  onClose: () => void;
  onDone: () => void;
}

export function UploadSyllabusDrawer({ subject, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch('/api/extract-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          subjectId: subject.id,
          filename: file.name,
          sizeMB: bytesToMB(file.size),
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
          Upload an image of the syllabus. CrackIt will extract modules, topics, and structure automatically using AI.
        </p>
        <DropZone label="Drop syllabus image here or click to browse" onFile={setFile} file={file} />
        {loading && <Spinner message="Extracting syllabus structure…" />}
        {error && (
          <div style={{ padding: '10px 14px', background: '#FFF1F0', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!file || loading} onClick={handle} icon="upload">
            {loading ? 'Processing…' : 'Upload & Extract'}
          </Btn>
        </div>
      </div>
    </Drawer>
  );
}
