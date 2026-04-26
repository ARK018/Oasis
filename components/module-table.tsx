'use client';

import { C } from '@/lib/theme';
import { Icon } from './icons';
import type { Module, Question } from '@/lib/types';

interface ModuleTableProps {
  module: Module | null;
  questions: Question[];
  onEdit: (q: Question) => void;
}

export function ModuleTable({ module, questions, onEdit }: ModuleTableProps) {
  const isUnknown = !module;
  return (
    <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 10, animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ padding: '11px 18px', background: isUnknown ? C.bg : C.orangeDim, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: isUnknown ? C.textMuted : C.orange, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: isUnknown ? C.textSec : C.orangeText }}>
          {isUnknown ? 'Unknown Module' : module.name}
        </span>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>
          {questions.length} {questions.length === 1 ? 'question' : 'questions'}
        </span>
      </div>
      {questions.length === 0 ? (
        <div style={{ padding: '18px', color: C.textMuted, fontSize: 12, textAlign: 'center' }}>No questions yet</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['Sr.', 'Question', 'Marks', 'Year', ''].map((h, i) => (
                <th key={i} style={{ padding: '9px 16px', textAlign: i < 2 ? 'left' : 'center', fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, width: i === 0 ? 44 : i === 2 ? 68 : i === 3 ? 68 : i === 4 ? 46 : 'auto' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: idx < questions.length - 1 ? `1px solid ${C.border}` : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <td style={{ padding: '11px 16px', color: C.textMuted, fontSize: 12, fontWeight: 600 }}>{row.sr}</td>
                <td style={{ padding: '11px 16px', color: '#3C3530', fontSize: 13, lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span>{row.question}</span>
                    {row.diagramDataUrl && <div style={{ flexShrink: 0, marginTop: 2 }}><Icon name="image" size={13} color={C.textMuted} /></div>}
                  </div>
                </td>
                <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', background: C.orangeDim, color: C.orangeText, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>{row.marks}</span>
                </td>
                <td style={{ padding: '11px 16px', textAlign: 'center', color: C.textSec, fontSize: 12, fontWeight: 600 }}>{row.year}</td>
                <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                  <button onClick={() => onEdit(row)} title="Edit"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4, borderRadius: 5, display: 'inline-flex', alignItems: 'center', transition: 'color 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.textSec)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>
                    <Icon name="edit" size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
