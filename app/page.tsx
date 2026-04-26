'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { SubjectCard } from '@/components/subject-card';
import { NewSubjectDrawer } from '@/components/drawers/new-subject-drawer';
import { Btn } from '@/components/btn';
import { Icon } from '@/components/icons';
import { C } from '@/lib/theme';

export default function SubjectsPage() {
  const router = useRouter();
  const { subjects, addSubject } = useStore();
  const [showNew, setShowNew] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 28px', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px' }}>Subjects</h1>
          <p style={{ fontSize: 12, color: C.textSec, marginTop: 3 }}>
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Btn icon="plus" onClick={() => setShowNew(true)}>New Subject</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {subjects.map(s => (
          <SubjectCard
            key={s.id}
            subject={s}
            onClick={() => router.push(`/subjects/${s.id}`)}
          />
        ))}

        <button
          onClick={() => setShowNew(true)}
          style={{
            background: 'transparent', border: `1.5px dashed ${C.border}`,
            borderRadius: 10, padding: '24px 16px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 7, transition: 'all 0.15s', minHeight: 140,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.background = C.orangeDim; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" size={16} color={C.textSec} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>Add Subject</span>
        </button>
      </div>

      {showNew && (
        <NewSubjectDrawer
          onClose={() => setShowNew(false)}
          onCreate={addSubject}
        />
      )}
    </div>
  );
}
