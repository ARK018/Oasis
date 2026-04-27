export interface Module {
  id: string;
  name: string;
  topics?: string[];
}

export interface Paper {
  id: string;
  year: string;
  filename: string;
  uploadedAt: string;
  sizeMB: number;
}

export interface Question {
  id: string;
  module: string | null;
  sr: number;
  question: string;
  marks: number;
  year: string;
  diagramDataUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  syllabusUploaded: boolean;
  syllabusFilename?: string;
  syllabusUploadedAt?: string;
  syllabusSizeMB?: number;
  modules: Module[];
  papers: Paper[];
  questions: Question[];
}

export interface LibraryFile {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  type: 'syllabus' | 'paper';
  filename: string;
  uploadedAt: string;
  year?: string;
  sizeMB: number;
}
