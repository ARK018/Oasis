'use client';

import { useState } from 'react';
import { Drawer } from '../drawer';
import { Btn } from '../btn';
import { Field } from '../field';
import { C, inputStyle } from '@/lib/theme';

const COLORS = ['#D97757', '#7C6FF7', '#E8A528', '#3B82F6', '#F472B6', '#34D399'];

interface Props {
  onClose: () => void;
  onCreate: (data: { name: string; code: string; color: string }) => Promise<void>;
}

export function NewSubjectDrawer({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreate({ name: name.trim(), code: code.trim(), color });
    onClose();
  };

  return (
    <Drawer title="New Subject" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Subject Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Advanced Algorithms" style={inputStyle} />
        </Field>
        <Field label="Subject Code">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS601" style={inputStyle} />
        </Field>
        <Field label="Color">
          <div style={{ display: 'flex', gap: 7 }}>
            {COLORS.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{ width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer', outline: color === c ? `2.5px solid ${c}` : '2.5px solid transparent', outlineOffset: 2 }}
              />
            ))}
          </div>
        </Field>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!name.trim() || loading} onClick={handle}>
            {loading ? 'Creating…' : 'Create Subject'}
          </Btn>
        </div>
      </div>
    </Drawer>
  );
}
