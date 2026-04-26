'use client';

import { useState } from 'react';
import { C } from '@/lib/theme';
import type { Subject } from '@/lib/types';

export function SubjectCard({ subject, onClick }: { subject: Subject; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.surfaceHover : C.surface, border: `1px solid ${hov ? C.borderStrong : C.border}`, borderRadius: 10, padding: '18px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: hov ? '0 4px 16px rgba(28,25,22,0.06)' : 'none' }}>
      <div style={{ height: 3, background: subject.color, borderRadius: 99, marginBottom: 14, width: 28 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{subject.name}</div>
          {subject.code && <div style={{ fontSize: 11, color: C.textSec, marginTop: 2, fontWeight: 500 }}>{subject.code}</div>}
        </div>
        {!subject.syllabusUploaded && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FEF9C3', color: '#92400E', whiteSpace: 'nowrap', marginLeft: 8 }}>No Syllabus</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        {[{ val: subject.modules.length, label: 'modules' }, { val: subject.questions.length, label: 'questions' }, { val: subject.papers.length, label: 'papers' }].map(({ val, label }) => (
          <div key={label}>
            <div style={{ fontSize: 19, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{val}</div>
            <div style={{ fontSize: 10, color: C.textSec, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
