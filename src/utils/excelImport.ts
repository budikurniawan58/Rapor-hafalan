import * as XLSX from 'xlsx';
import { Student } from '../types';

export interface ParsedStudentRow {
  name: string;
  nis: string;
  nisn: string;
  kelas: string;
  tahunPelajaran: string;
}

/**
 * Downloads a pre-formatted Excel template for student data.
 */
export function downloadStudentExcelTemplate(
  defaultKelas = '2.1',
  defaultTahunPelajaran = '2026/2027'
) {
  // Sample rows to guide the teacher
  const templateData = [
    {
      'No': 1,
      'Nama Lengkap Siswa': 'ADIA NURAINA ZALFA',
      'NIS': '111236740052251026',
      'NISN': '3177671391',
      'Kelas': defaultKelas,
      'Tahun Pelajaran': defaultTahunPelajaran,
    },
    {
      'No': 2,
      'Nama Lengkap Siswa': 'AHMAD RAYYAN AL-FATIH',
      'NIS': '111236740052251027',
      'NISN': '3177671392',
      'Kelas': defaultKelas,
      'Tahun Pelajaran': defaultTahunPelajaran,
    },
    {
      'No': 3,
      'Nama Lengkap Siswa': 'AISYAH AQILAH PUTRI',
      'NIS': '111236740052251028',
      'NISN': '3177671393',
      'Kelas': defaultKelas,
      'Tahun Pelajaran': defaultTahunPelajaran,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set explicit column widths for beautiful readability
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Nama Lengkap Siswa
    { wch: 24 }, // NIS
    { wch: 18 }, // NISN
    { wch: 12 }, // Kelas
    { wch: 18 }, // Tahun Pelajaran
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

  // Trigger browser download
  XLSX.writeFile(workbook, 'Template_Data_Siswa_MI_Raudlatul_Hikmah.xlsx');
}

/**
 * Parses an Excel (.xlsx, .xls, .csv) file into student rows.
 */
export async function parseStudentExcelFile(file: File): Promise<ParsedStudentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Get the first sheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Parse into raw JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('File Excel kosong atau tidak memiliki data baris.');
  }

  const parsedStudents: ParsedStudentRow[] = [];

  for (const row of rawRows) {
    // Helper to find value by possible header variants (case-insensitive & trimmed)
    const findField = (...aliases: string[]): string => {
      for (const key of Object.keys(row)) {
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const alias of aliases) {
          const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey === cleanAlias || cleanKey.includes(cleanAlias)) {
            return String(row[key] ?? '').trim();
          }
        }
      }
      return '';
    };

    const name = findField('namalengkap', 'namasiswa', 'nama', 'name', 'studentname');
    const nis = findField('nis', 'noinduk', 'nomorinduk', 'nomorinduksiswa');
    const nisn = findField('nisn', 'nomorinduksiswanasional');
    const kelas = findField('kelas', 'class', 'tingkat') || '2.1';
    const tahunPelajaran =
      findField('tahunpelajaran', 'tahunajaran', 'tp', 'academicyear') || '2026/2027';

    // Only add row if student name is present and valid
    if (name && name.length >= 2 && !name.toLowerCase().includes('contoh')) {
      parsedStudents.push({
        name: name.toUpperCase(),
        nis: nis || '-',
        nisn: nisn || '-',
        kelas,
        tahunPelajaran,
      });
    }
  }

  if (parsedStudents.length === 0) {
    throw new Error(
      'Tidak ada data siswa yang valid ditemukan. Pastikan file memiliki kolom "Nama Lengkap Siswa" atau "Nama".'
    );
  }

  return parsedStudents;
}
