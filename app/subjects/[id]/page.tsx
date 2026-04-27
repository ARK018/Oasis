'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ModuleTable } from '@/components/module-table';
import { Btn } from '@/components/btn';
import { Icon } from '@/components/icons';
import { UploadSyllabusDrawer } from '@/components/drawers/upload-syllabus-drawer';
import { AddPaperDrawer } from '@/components/drawers/add-paper-drawer';
import { EditRowDrawer } from '@/components/drawers/edit-row-drawer';
import { C } from '@/lib/theme';
import type { Question } from '@/lib/types';

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { subjects, updateSubject } = useStore();
  const subjectId = parseInt(id, 10);
  const subject = subjects.find(s => s.id === subjectId);

  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showPaper, setShowPaper] = useState(false);
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [dlOpen, setDlOpen] = useState(false);

  if (!subject) {
    return (
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 28px' }}>
        <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, fontSize: 12, fontWeight: 500, padding: '0 0 18px', fontFamily: 'inherit' }}>
          <Icon name="chevronLeft" size={13} /> Subjects
        </button>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Subject not found</p>
        </div>
      </div>
    );
  }

  const handleSyllabusDone = (moduleNames: string[], filename: string, sizeMB: number) => {
    const modules = moduleNames.map((n, i) => ({ id: `m${i + 1}`, name: n }));
    updateSubject({ ...subject, syllabusUploaded: true, modules, syllabusFilename: filename, syllabusUploadedAt: new Date().toISOString().slice(0, 10), syllabusSizeMB: sizeMB });
    setShowSyllabus(false);
  };

  const handlePaperDone = (filename: string, year: string, sizeMB: number, newQs: Omit<Question, 'id' | 'sr'>[]) => {
    const papers = [...subject.papers, { id: `p${Date.now()}`, year, filename, uploadedAt: new Date().toISOString().slice(0, 10), sizeMB }];
    const existing = [...subject.questions];
    const perMod: Record<string, number> = {};
    existing.forEach(q => { const k = q.module || '__'; perMod[k] = (perMod[k] || 0) + 1; });
    const added: Question[] = newQs.map(q => {
      const k = q.module || '__';
      perMod[k] = (perMod[k] || 0) + 1;
      return { id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`, ...q, sr: perMod[k] };
    });
    updateSubject({ ...subject, papers, questions: [...existing, ...added] });
    setShowPaper(false);
  };

  const handleSaveQ = (updated: Question) => {
    updateSubject({ ...subject, questions: subject.questions.map(q => q.id === updated.id ? updated : q) });
  };

  const handleDeleteQ = (qId: string) => {
    updateSubject({ ...subject, questions: subject.questions.filter(q => q.id !== qId) });
  };

  const grouped: Record<string, Question[]> = {};
  subject.modules.forEach(m => { grouped[m.id] = []; });
  grouped['__unknown'] = [];
  subject.questions.forEach(q => {
    if (q.module && grouped[q.module]) grouped[q.module].push(q);
    else grouped['__unknown'].push(q);
  });

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '36px 28px', animation: 'fadeIn 0.2s ease-out' }}>
      <button
        onClick={() => router.push('/')}
        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: C.textSec, fontSize: 12, fontWeight: 500, padding: '0 0 18px', fontFamily: 'inherit' }}
      >
        <Icon name="chevronLeft" size={13} /> Subjects
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: subject.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${subject.color}28` }}>
            <Icon name="book" size={20} color={subject.color} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>{subject.name}</h1>
            <div style={{ fontSize: 11, color: C.textSec, marginTop: 3 }}>
              {subject.code && <span>{subject.code} · </span>}
              <span>{subject.modules.length} modules · {subject.questions.length} questions · {subject.papers.length} papers</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <Btn variant="ghost" size="sm" icon="upload" onClick={() => setShowSyllabus(true)}>
            {subject.syllabusUploaded ? 'Update Syllabus' : 'Upload Syllabus'}
          </Btn>
          <Btn size="sm" icon="plus" onClick={() => setShowPaper(true)} disabled={!subject.syllabusUploaded}>
            Add Question Paper
          </Btn>
          <div style={{ position: 'relative' }}>
            <Btn variant="ghost" size="sm" icon="download" onClick={() => setDlOpen(v => !v)}>Download</Btn>
            {dlOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setDlOpen(false)} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 5px)', right: 0, zIndex: 60,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9,
                  boxShadow: '0 8px 24px rgba(28,25,22,0.12)', minWidth: 150, overflow: 'hidden',
                }}>
                  {['PDF', 'Word (.docx)'].map(label => (
                    <button
                      key={label}
                      onClick={() => { alert(`Downloading as ${label}…`); setDlOpen(false); }}
                      style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12, fontWeight: 500, color: C.text, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <Icon name="download" size={12} color={C.textSec} /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!subject.syllabusUploaded && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9, padding: '11px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="warning" size={14} color="#D97706" />
          <span style={{ fontSize: 12, color: '#92400E' }}>
            <strong>Syllabus not uploaded.</strong> Upload the syllabus first to detect modules before adding question papers.
          </span>
        </div>
      )}

      {subject.papers.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {subject.papers.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: C.textSec }}>
              <Icon name="file" size={11} color={C.textMuted} />
              {p.year} Paper
            </div>
          ))}
        </div>
      )}

      {subject.syllabusUploaded && subject.modules.length > 0 ? (
        <>
          {subject.modules.map(m => (
            <ModuleTable key={m.id} module={m} questions={grouped[m.id] || []} onEdit={setEditQ} />
          ))}
          {grouped['__unknown'].length > 0 && (
            <ModuleTable module={null} questions={grouped['__unknown']} onEdit={setEditQ} />
          )}
        </>
      ) : subject.syllabusUploaded ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
          <Icon name="book" size={30} color={C.textMuted} />
          <p style={{ marginTop: 10, fontWeight: 600, fontSize: 13 }}>No modules detected</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Try re-uploading the syllabus</p>
        </div>
      ) : null}

      {showSyllabus && <UploadSyllabusDrawer subject={subject} onClose={() => setShowSyllabus(false)} onDone={handleSyllabusDone} />}
      {showPaper && <AddPaperDrawer subject={subject} onClose={() => setShowPaper(false)} onDone={handlePaperDone} />}
      {editQ && <EditRowDrawer question={editQ} modules={subject.modules} onClose={() => setEditQ(null)} onSave={handleSaveQ} onDelete={handleDeleteQ} />}
    </div>
  );
}
