'use client';

import { useStore } from '@/lib/store';
import { Icon } from '@/components/icons';
import { C } from '@/lib/theme';
import { formatMB } from '@/lib/utils';

export default function LibraryPage() {
  const { library } = useStore();

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '36px 28px', animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.4px' }}>Library</h1>
        <p style={{ fontSize: 12, color: C.textSec, marginTop: 3 }}>{library.length} files</p>
      </div>

      {library.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMuted }}>
          <Icon name="folder" size={30} color={C.textMuted} />
          <p style={{ marginTop: 10, fontWeight: 600, fontSize: 13 }}>No files yet</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Upload a syllabus or question paper to a subject to see it here.</p>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {['File', 'Subject', 'Type', 'Year', 'Size', 'Uploaded'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 10, fontWeight: 700, color: C.textMuted,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {library.map((f, idx) => (
                <tr
                  key={f.id}
                  style={{ borderBottom: idx < library.length - 1 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={f.type === 'syllabus' ? 'book' : 'file'} size={13} color={C.textSec} />
                      </div>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{f.filename}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: f.subjectColor }} />
                      <span style={{ fontSize: 12, color: C.textSec }}>{f.subjectName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                      background: f.type === 'syllabus' ? '#EFF6FF' : C.orangeDim,
                      color: f.type === 'syllabus' ? '#3B82F6' : C.orangeText,
                    }}>
                      {f.type === 'syllabus' ? 'Syllabus' : 'Question Paper'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.textSec }}>{f.year || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.textSec }}>{formatMB(f.sizeMB)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: C.textMuted }}>{f.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
