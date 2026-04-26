'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Subject, LibraryFile } from './types';

const SEED: Subject[] = [
  {
    id: 1, name: 'Advanced Algorithms', code: 'CS601', color: '#D97757',
    syllabusUploaded: true, syllabusFilename: 'syllabus_AA.jpg',
    syllabusUploadedAt: '2024-01-05', syllabusSizeMB: 0.8,
    modules: [
      { id: 'm1', name: 'Module 1 – Divide & Conquer' },
      { id: 'm2', name: 'Module 2 – Dynamic Programming' },
      { id: 'm3', name: 'Module 3 – Graph Algorithms' },
    ],
    papers: [
      { id: 'p1', year: '2023', filename: 'AA_2023.png', uploadedAt: '2024-01-10', sizeMB: 1.2 },
      { id: 'p2', year: '2022', filename: 'AA_2022.png', uploadedAt: '2024-01-08', sizeMB: 0.9 },
    ],
    questions: [
      { id: 'q1', module: 'm1', sr: 1, question: 'Explain the merge sort algorithm with a suitable example and derive its time complexity.', marks: 8, year: '2023' },
      { id: 'q2', module: 'm1', sr: 2, question: "Apply Strassen's matrix multiplication to solve a 2×2 matrix problem. Compare with the naive approach.", marks: 6, year: '2022' },
      { id: 'q3', module: 'm2', sr: 1, question: 'State and prove the principle of optimality in dynamic programming.', marks: 10, year: '2023' },
      { id: 'q4', module: 'm2', sr: 2, question: 'Solve the 0/1 knapsack problem using dynamic programming for the given weights and values.', marks: 8, year: '2022' },
      { id: 'q5', module: 'm2', sr: 3, question: "Find the longest common subsequence of 'ABCBDAB' and 'BDCAB'.", marks: 6, year: '2023' },
      { id: 'q6', module: 'm3', sr: 1, question: "Apply Dijkstra's algorithm to find shortest paths from a given source vertex in the weighted graph.", marks: 10, year: '2022' },
      { id: 'q7', module: 'm3', sr: 2, question: 'Explain Bellman-Ford algorithm and discuss its time complexity. When does it fail?', marks: 6, year: '2023' },
      { id: 'q8', module: null, sr: 1, question: 'Write short notes on any two: (a) NP-completeness (b) Approximation algorithms', marks: 4, year: '2022' },
    ],
  },
  {
    id: 2, name: 'Database Management', code: 'CS602', color: '#7C6FF7',
    syllabusUploaded: true, syllabusFilename: 'syllabus_DBMS.jpg',
    syllabusUploadedAt: '2024-01-11', syllabusSizeMB: 0.6,
    modules: [
      { id: 'm1', name: 'Module 1 – Relational Model' },
      { id: 'm2', name: 'Module 2 – SQL & Normalization' },
    ],
    papers: [
      { id: 'p1', year: '2023', filename: 'DBMS_2023.png', uploadedAt: '2024-01-12', sizeMB: 1.1 },
    ],
    questions: [
      { id: 'q1', module: 'm1', sr: 1, question: 'Explain entity-relationship diagram with a real-world example.', marks: 8, year: '2023' },
      { id: 'q2', module: 'm1', sr: 2, question: 'Define relational algebra. Write expressions for selection, projection, and join operations.', marks: 10, year: '2023' },
      { id: 'q3', module: 'm2', sr: 1, question: 'Explain 1NF, 2NF, and 3NF with examples. Why is normalization important?', marks: 10, year: '2023' },
      { id: 'q4', module: 'm2', sr: 2, question: 'Write an SQL query to find the second highest salary from an Employee table.', marks: 4, year: '2023' },
    ],
  },
  {
    id: 3, name: 'Machine Learning', code: 'CS701', color: '#E8A528',
    syllabusUploaded: false, modules: [], papers: [], questions: [],
  },
];

interface StoreState {
  subjects: Subject[];
  addSubject: (data: Pick<Subject, 'name' | 'code' | 'color'>) => void;
  updateSubject: (s: Subject) => void;
  library: LibraryFile[];
  usedMB: number;
}

const StoreCtx = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crackit_subjects');
      if (saved) setSubjects(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem('crackit_subjects', JSON.stringify(subjects));
  }, [subjects, hydrated]);

  const addSubject = useCallback((data: Pick<Subject, 'name' | 'code' | 'color'>) => {
    setSubjects(s => [...s, {
      id: Date.now(), ...data,
      syllabusUploaded: false, modules: [], papers: [], questions: [],
    }]);
  }, []);

  const updateSubject = useCallback((updated: Subject) => {
    setSubjects(s => s.map(x => x.id === updated.id ? updated : x));
  }, []);

  const library: LibraryFile[] = subjects.flatMap(s => {
    const files: LibraryFile[] = [];
    if (s.syllabusUploaded && s.syllabusFilename) {
      files.push({
        id: `syl_${s.id}`, subjectId: s.id, subjectName: s.name, subjectColor: s.color,
        type: 'syllabus', filename: s.syllabusFilename,
        uploadedAt: s.syllabusUploadedAt || '', sizeMB: s.syllabusSizeMB || 0,
      });
    }
    s.papers.forEach(p => files.push({
      id: `pap_${p.id}`, subjectId: s.id, subjectName: s.name, subjectColor: s.color,
      type: 'paper', filename: p.filename, uploadedAt: p.uploadedAt, year: p.year, sizeMB: p.sizeMB,
    }));
    return files;
  });

  const usedMB = library.reduce((sum, f) => sum + (f.sizeMB || 0), 0);

  return (
    <StoreCtx.Provider value={{ subjects, addSubject, updateSubject, library, usedMB }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
