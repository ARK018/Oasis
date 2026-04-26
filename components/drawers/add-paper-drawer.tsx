'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { DropZone } from '../drop-zone';
import { Spinner } from '../spinner';
import { Field } from '../field';
import { C, inputStyle } from '@/lib/theme';
import { fileToBase64, bytesToMB } from '@/lib/utils';
import type { Subject, Question } from '@/lib/types';

interface ExtractedQuestion {
  moduleId: string | null;
  question: string;
  marks: number;
}

interface Props {
  subject: Subject;
  onClose: () => void;
  onDone: (filename: string, year: string, sizeMB: number, questions: Omit<Question, 'id' | 'sr'>[]) => void;
}

export function AddPaperDrawer({ subject, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!file || !year) return;
    setLoading(true);
    setError('');
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, year, modules: subject.modules }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { questions } = await res.json() as { questions: ExtractedQuestion[] };
      const validModuleIds = new Set(subject.modules.map(m => m.id));
      const mapped: Omit<Question, 'id' | 'sr'>[] = questions.map(q => ({
        module: q.moduleId && validModuleIds.has(q.moduleId) ? q.moduleId : null,
        question: q.question,
        marks: q.marks || 0,
        year,
      }));
      onDone(file.name, year, bytesToMB(file.size), mapped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Extraction failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Drawer title={`Add Question Paper — ${subject.name}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>
          Upload a screenshot of the question paper. CrackIt will extract questions and distribute them module-wise using AI.
        </p>
        <DropZone label="Drop question paper image here or click to browse" onFile={setFile} file={file} />
        <Field label="Exam Year">
          <input value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="e.g. 2024" maxLength={4} style={inputStyle} />
        </Field>
        {loading && <Spinner message="Extracting & classifying questions…" />}
        {error && <div style={{ padding: '10px 14px', background: '#FFF1F0', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, color: '#DC2626' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!file || !year || loading} onClick={handle} icon="upload">{loading ? 'Processing…' : 'Extract Questions'}</Btn>
        </div>
      </div>
    </Drawer>
  );
}
