'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { Field } from '../field';
import { DropZone } from '../drop-zone';
import { C, inputStyle } from '@/lib/theme';
import { Icon } from '../icons';
import { fileToSmallDataUrl } from '@/lib/utils';
import type { Question, Module } from '@/lib/types';

interface Props {
  question: Question;
  modules: Module[];
  onClose: () => void;
  onSave: (updated: Question) => void;
  onDelete: (id: string) => void;
}

export function EditRowDrawer({ question, modules, onClose, onSave, onDelete }: Props) {
  const [q, setQ] = useState(question.question);
  const [marks, setMarks] = useState(question.marks);
  const [year, setYear] = useState(question.year);
  const [mod, setMod] = useState<string | null>(question.module);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [diagramUrl, setDiagramUrl] = useState(question.diagramDataUrl || '');

  const handleImgFile = async (file: File) => {
    setImgFile(file);
    const url = await fileToSmallDataUrl(file);
    setDiagramUrl(url);
  };

  return (
    <Drawer title="Edit Question" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <Field label="Question">
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Marks">
            <input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Year">
            <input value={year} onChange={e => setYear(e.target.value)} maxLength={4} style={inputStyle} />
          </Field>
        </div>
        <Field label="Module">
          <div style={{ position: 'relative' }}>
            <select value={mod || ''} onChange={e => setMod(e.target.value || null)} style={{ ...inputStyle, appearance: 'none', paddingRight: 32 }}>
              <option value="">Unknown Module</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="chevronDown" size={13} color={C.textSec} />
            </div>
          </div>
        </Field>
        <Field label="Attach Diagram / Image (optional)">
          {diagramUrl && !imgFile ? (
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={diagramUrl} alt="diagram" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', background: C.bg }} />
              <button onClick={() => { setDiagramUrl(''); setImgFile(null); }} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(28,25,22,0.6)', border: 'none', borderRadius: 5, cursor: 'pointer', color: '#fff', padding: '3px 5px', display: 'flex', alignItems: 'center' }}>
                <Icon name="close" size={11} color="#fff" />
              </button>
            </div>
          ) : (
            <DropZone label="Drop diagram image here" onFile={handleImgFile} file={imgFile} />
          )}
        </Field>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <Btn variant="danger" size="sm" icon="trash" onClick={() => { onDelete(question.id); onClose(); }}>Delete</Btn>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn onClick={() => { onSave({ ...question, question: q, marks, year, module: mod, diagramDataUrl: diagramUrl || undefined }); onClose(); }}>Save Changes</Btn>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
