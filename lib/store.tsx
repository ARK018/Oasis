'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Subject, LibraryFile } from './types';

interface StoreState {
  subjects: Subject[];
  loading: boolean;
  addSubject: (data: Pick<Subject, 'name' | 'code' | 'color'>) => Promise<void>;
  updateSubject: (s: Subject) => Promise<void>;
  refreshSubject: (id: string) => Promise<void>;
  library: LibraryFile[];
  usedMB: number;
}

const StoreCtx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subjects')
      .then(r => r.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addSubject = useCallback(async (data: Pick<Subject, 'name' | 'code' | 'color'>) => {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const { id } = await res.json();
    setSubjects(s => [
      {
        id,
        ...data,
        syllabusUploaded: false,
        modules: [],
        papers: [],
        questions: [],
      },
      ...s,
    ]);
  }, []);

  const updateSubject = useCallback(async (updated: Subject) => {
    await fetch(`/api/subjects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSubjects(s => s.map(x => x.id === updated.id ? updated : x));
  }, []);

  const refreshSubject = useCallback(async (id: string) => {
    const res = await fetch(`/api/subjects/${id}`);
    if (!res.ok) return;
    const updated: Subject = await res.json();
    setSubjects(s => s.map(x => x.id === id ? updated : x));
  }, []);

  const library: LibraryFile[] = subjects.flatMap(s => {
    const files: LibraryFile[] = [];
    if (s.syllabusUploaded && s.syllabusFilename) {
      files.push({
        id: `syl_${s.id}`,
        subjectId: s.id,
        subjectName: s.name,
        subjectColor: s.color,
        type: 'syllabus',
        filename: s.syllabusFilename,
        uploadedAt: s.syllabusUploadedAt || '',
        sizeMB: s.syllabusSizeMB || 0,
      });
    }
    s.papers.forEach(p =>
      files.push({
        id: `pap_${p.id}`,
        subjectId: s.id,
        subjectName: s.name,
        subjectColor: s.color,
        type: 'paper',
        filename: p.filename,
        uploadedAt: p.uploadedAt,
        year: p.year,
        sizeMB: p.sizeMB,
      })
    );
    return files;
  });

  const usedMB = library.reduce((sum, f) => sum + (f.sizeMB || 0), 0);

  return (
    <StoreCtx.Provider value={{ subjects, loading, addSubject, updateSubject, refreshSubject, library, usedMB }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
