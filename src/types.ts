export type PrintFilterMode = 'class' | 'passed_only' | 'filled_only' | 'all';

export interface HafalanItem {
  id: string;
  nama: string;
  targetClasses?: string[]; // e.g., ['2.1'] or ['Semua Kelas']
}

export interface HafalanCategory {
  id: string;
  code: string; // e.g., 'A', 'B', 'C', 'D', 'E', 'F'
  name: string; // e.g., 'HAFALAN UMUM', 'DOA SEHARI-HARI'
  targetClasses?: string[]; // optionally for whole category
  items: HafalanItem[];
}

export interface HafalanRecord {
  tanggal: string; // e.g. "1", "16/10/2026", etc.
  penguji: string; // e.g. "q", paraf, or initials
  keterangan: string; // e.g. "Lulus", "Belum Lulus", "Mutqin"
  catatan?: string;
  excludeFromPrint?: boolean; // when true, item is omitted from printed card
}

export interface Student {
  id: string;
  name: string;
  nis: string;
  nisn: string;
  kelas: string;
  tahunPelajaran: string;
  records: Record<string, HafalanRecord>; // key: itemId
}

export interface SchoolConfig {
  schoolName: string;
  title: string;
  academicYear: string;
  city: string;
  date: string;
  examinerTitle: string;
  examinerName: string;
  parentTitle: string;
  parentName: string;
  customLogoUrl: string | null;
  examiners?: string[];
  printFilterMode?: PrintFilterMode;
}
