import React, { useState, useEffect } from 'react';
import {
  Printer,
  Users,
  BookOpen,
  Settings,
  ChevronDown,
  Download,
  CheckCircle,
  Layers,
  ZoomIn,
  ZoomOut,
  Edit3,
  FileText,
  Eye,
  Columns,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';

import { HafalanCategory, SchoolConfig, Student } from './types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SCHOOL_CONFIG,
  DEFAULT_STUDENTS,
} from './constants/defaultData';
import { PrintCard } from './components/PrintCard';
import { HafalanInputTable } from './components/HafalanInputTable';
import { StudentManagerModal } from './components/StudentManagerModal';
import { MateriManagerModal } from './components/MateriManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { ExaminerManagerModal } from './components/ExaminerManagerModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { SchoolLogo } from './components/SchoolLogo';
import { downloadStudentExcelTemplate, ParsedStudentRow } from './utils/excelImport';

const STORAGE_KEY_STUDENTS = 'kartu_hafalan_students_v1';
const STORAGE_KEY_CATEGORIES = 'kartu_hafalan_categories_v1';
const STORAGE_KEY_CONFIG = 'kartu_hafalan_config_v1';

export default function App() {
  // State
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      return saved ? JSON.parse(saved) : DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  const [categories, setCategories] = useState<HafalanCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_CONFIG;
    } catch {
      return DEFAULT_SCHOOL_CONFIG;
    }
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(
    students[0]?.id || 'std_adia'
  );

  // Simplified views: 'input' (Input Nilai), 'preview' (Lihat & Cetak), 'split' (Berdampingan)
  const [activeTab, setActiveTab] = useState<'input' | 'preview' | 'split'>('input');
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isMateriModalOpen, setIsMateriModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [isExaminerModalOpen, setIsExaminerModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [batchPrintStudentIds, setBatchPrintStudentIds] = useState<string[]>([]);

  // Examiners list for dropdown
  const [examiners, setExaminers] = useState<string[]>(() => {
    if (config.examiners && config.examiners.length > 0) {
      return config.examiners;
    }
    return [
      'q',
      'FIKRA ABDILLAH ZAENAL, S.S, S.Pd',
      'Ustadzah Rahmawati, S.Pd.I',
      'Ustadz Muhammad Ilham, Lc',
    ];
  });
  const [defaultPenguji, setDefaultPenguji] = useState<string>('q');

  const handleUpdateExaminers = (updated: string[]) => {
    setExaminers(updated);
    setConfig((prev) => ({ ...prev, examiners: updated }));
    showToast('Daftar nama penguji berhasil diperbarui!');
  };

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  // Clean up batch print state after print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => {
      setBatchPrintStudentIds([]);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find active student safely
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Update a single evaluation record
  const handleUpdateRecord = (
    itemId: string,
    field: 'tanggal' | 'penguji' | 'keterangan',
    value: string
  ) => {
    if (!activeStudent) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudent.id) {
          const currentRecord = s.records[itemId] || {
            tanggal: '',
            penguji: '',
            keterangan: '',
          };
          return {
            ...s,
            records: {
              ...s.records,
              [itemId]: {
                ...currentRecord,
                [field]: value,
              },
            },
          };
        }
        return s;
      })
    );
  };

  // Bulk update
  const handleBatchUpdateRecords = (
    newRecords: Record<string, { tanggal: string; penguji: string; keterangan: string }>
  ) => {
    if (!activeStudent) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudent.id) {
          return {
            ...s,
            records: {
              ...s.records,
              ...newRecords,
            },
          };
        }
        return s;
      })
    );
    showToast('Nilai hafalan berhasil diperbarui!');
  };

  // Student actions
  const handleAddStudent = (data: Omit<Student, 'id' | 'records'>) => {
    const newStudent: Student = {
      ...data,
      id: `std_${Date.now()}`,
      records: {},
    };
    setStudents((prev) => [...prev, newStudent]);
    setActiveStudentId(newStudent.id);
    showToast(`Siswa "${data.name}" berhasil ditambahkan!`);
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
    showToast('Data siswa berhasil diperbarui!');
  };

  const handleDeleteStudent = (id: string) => {
    if (students.length <= 1) {
      alert('Minimal harus ada satu data siswa.');
      return;
    }
    const remaining = students.filter((s) => s.id !== id);
    setStudents(remaining);
    if (activeStudentId === id) {
      setActiveStudentId(remaining[0].id);
    }
    showToast('Data siswa telah dihapus.');
  };

  const handleBatchImportStudents = (
    importedRows: ParsedStudentRow[],
    replaceAll: boolean
  ) => {
    const newStudents: Student[] = importedRows.map((row, idx) => ({
      id: `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      name: row.name,
      nis: row.nis,
      nisn: row.nisn,
      kelas: row.kelas,
      tahunPelajaran: row.tahunPelajaran,
      records: {},
    }));

    if (replaceAll) {
      setStudents(newStudents);
      if (newStudents.length > 0) {
        setActiveStudentId(newStudents[0].id);
      }
      showToast(`Berhasil mengganti data dengan ${newStudents.length} siswa baru dari Excel!`);
    } else {
      setStudents((prev) => [...prev, ...newStudents]);
      if (newStudents.length > 0) {
        setActiveStudentId(newStudents[0].id);
      }
      showToast(`Berhasil menambahkan ${newStudents.length} siswa baru dari Excel!`);
    }
  };

  // Print handlers
  const handlePrintActiveStudent = () => {
    setBatchPrintStudentIds([]);
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const handleTriggerBatchPrint = (selectedIds: string[]) => {
    setBatchPrintStudentIds(selectedIds);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Export / Import
  const handleExportAllData = () => {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      schoolConfig: config,
      categories,
      students,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kartu_hafalan_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cadangan data berhasil diunduh!');
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.students && parsed.categories && parsed.schoolConfig) {
          setStudents(parsed.students);
          setCategories(parsed.categories);
          setConfig(parsed.schoolConfig);
          if (parsed.students.length > 0) {
            setActiveStudentId(parsed.students[0].id);
          }
          showToast('Data cadangan berhasil dipulihkan!');
        } else {
          alert('Format file JSON tidak sesuai.');
        }
      } catch {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const studentsToPrint =
    batchPrintStudentIds.length > 0
      ? students.filter((s) => batchPrintStudentIds.includes(s.id))
      : activeStudent ? [activeStudent] : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-60 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. SIMPLE TOP HEADER (NO-PRINT) */}
      <header className="no-print bg-emerald-900 text-white sticky top-0 z-40 shadow-sm border-b border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/15">
              <SchoolLogo customLogoUrl={config.customLogoUrl} size={30} />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight tracking-wide">
                MI RAUDLATUL HIKMAH
              </div>
              <div className="text-[11px] text-emerald-200">
                Kartu Hafalan Siswa · T.P {config.academicYear}
              </div>
            </div>
          </div>

          {/* Simple Navigation Tabs in Center */}
          <div className="hidden md:flex items-center bg-emerald-950/60 p-1 rounded-xl border border-emerald-800/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'input'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Input Nilai Hafalan</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2. Pratinjau & Cetak</span>
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'split'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-emerald-300/80 hover:text-white'
              }`}
              title="Tampilkan formulir dan kartu cetak berdampingan"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Berdampingan</span>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Primary Print Button */}
            <button
              onClick={handlePrintActiveStudent}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Kartu (A4)</span>
            </button>

            {/* Menu Lainnya Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl border border-emerald-700 transition-colors cursor-pointer"
              >
                <span>Menu Lainnya</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs">
                    <button
                      onClick={() => {
                        setIsStudentModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>Kelola Data Siswa ({students.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsExcelImportModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 text-emerald-800 flex items-center gap-2.5 font-bold cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Impor Siswa dari Excel</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMateriModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>Atur Materi & Kategori Hafalan</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsExaminerModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span>Daftar Nama Penguji ({examiners.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-600" />
                      <span>Pengaturan Kop & Penguji</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsBatchPrintModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Cetak Massal Semua Siswa</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        handleExportAllData();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-600 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Cadangkan Data (JSON)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex border-t border-emerald-800 text-xs">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === 'input'
                ? 'bg-emerald-800 text-white border-b-2 border-amber-400'
                : 'text-emerald-200'
            }`}
          >
            1. Input Nilai
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === 'preview'
                ? 'bg-emerald-800 text-white border-b-2 border-amber-400'
                : 'text-emerald-200'
            }`}
          >
            2. Pratinjau & Cetak
          </button>
          <button
            onClick={() => setActiveTab('split')}
            className={`flex-1 py-2 text-center font-semibold ${
              activeTab === 'split'
                ? 'bg-emerald-800 text-white border-b-2 border-amber-400'
                : 'text-emerald-200'
            }`}
          >
            Berdampingan
          </button>
        </div>
      </header>

      {/* 2. PROMINENT STUDENT SELECTOR HERO CARD (NO-PRINT) */}
      <section className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-1 w-full">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          {/* Student Dropdown & Switcher */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                Siswa yang Sedang Dinilai:
              </label>
              <div className="relative">
                <select
                  value={activeStudentId}
                  onChange={(e) => setActiveStudentId(e.target.value)}
                  className="w-full appearance-none pr-8 py-1 bg-transparent text-base sm:text-lg font-extrabold text-slate-900 border-none focus:outline-none cursor-pointer"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Kelas {s.kelas})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Student Metadata & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Kelas:</span> {activeStudent?.kelas || '-'} &nbsp;·&nbsp;
              <span className="font-semibold text-slate-700">NIS:</span> {activeStudent?.nis || '-'}
            </div>

            <button
              onClick={() => setIsExcelImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
              title="Unggah file Excel untuk memasukkan data siswa secara otomatis"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Impor Excel</span>
            </button>

            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
              title="Edit biodata siswa atau tambah siswa baru"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ganti / Edit Siswa</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE (NO-PRINT) */}
      <main className="no-print flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
        {/* TAB 1: INPUT NILAI ONLY (CLEAR, SIMPLE, USER-FRIENDLY) */}
        {activeTab === 'input' && (
          <div className="space-y-4">
            <HafalanInputTable
              student={activeStudent}
              categories={categories}
              examiners={examiners}
              defaultPenguji={defaultPenguji}
              onChangeDefaultPenguji={setDefaultPenguji}
              onUpdateRecord={handleUpdateRecord}
              onBatchUpdateRecords={handleBatchUpdateRecords}
              onOpenMateriManager={() => setIsMateriModalOpen(true)}
              onOpenExaminerManager={() => setIsExaminerModalOpen(true)}
            />

            {/* Bottom Next Step Callout */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Semua pengisian nilai tersimpan otomatis. Siap melihat atau mencetak hasil kartu?</span>
              </div>
              <button
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer ml-auto"
              >
                Lihat Pratinjau & Cetak Kartu →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PRATINJAU & CETAK ONLY (CLEAN A4 PAPER PREVIEW) */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {/* Top Toolbar for Preview */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-slate-800">
                  Pratinjau Kartu: <span className="text-emerald-800">{activeStudent.name}</span>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  Format Resmi A4
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Print button */}
                <button
                  onClick={handlePrintActiveStudent}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Siswa Ini</span>
                </button>

                <button
                  onClick={() => setIsBatchPrintModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Cetak Massal</span>
                </button>
              </div>
            </div>

            {/* A4 Sheet Container */}
            <div className="bg-slate-300/80 rounded-2xl p-6 sm:p-8 overflow-auto min-h-[650px] flex justify-center border border-slate-400/40">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="shadow-2xl mb-12"
              >
                <PrintCard
                  student={activeStudent}
                  categories={categories}
                  config={config}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPLIT VIEW (BOTH SIDE-BY-SIDE) */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Form (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Formulir Nilai
              </div>
              <HafalanInputTable
                student={activeStudent}
                categories={categories}
                examiners={examiners}
                defaultPenguji={defaultPenguji}
                onChangeDefaultPenguji={setDefaultPenguji}
                onUpdateRecord={handleUpdateRecord}
                onBatchUpdateRecords={handleBatchUpdateRecords}
                onOpenMateriManager={() => setIsMateriModalOpen(true)}
                onOpenExaminerManager={() => setIsExaminerModalOpen(true)}
              />
            </div>

            {/* Right: Live Preview (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Hasil Kartu Cetak Langsung
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono text-slate-500">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handlePrintActiveStudent}
                    className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak
                  </button>
                </div>
              </div>

              <div className="bg-slate-200/90 rounded-2xl p-4 overflow-auto max-h-[820px] flex justify-center border border-slate-300 shadow-inner">
                <div
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="shadow-xl"
                >
                  <PrintCard
                    student={activeStudent}
                    categories={categories}
                    config={config}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER (NO-PRINT) */}
      <footer className="no-print bg-white border-t border-slate-200 py-3 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            Aplikasi Cetak Kartu Hafalan Siswa · <strong>{config.schoolName}</strong>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportAllData}
              className="hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
            >
              Unduh Backup JSON
            </button>
            <span>·</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
            >
              Pengaturan Lembaga
            </button>
          </div>
        </div>
      </footer>

      {/* PRINT-ONLY ROOT (Triggers cleanly on window.print()) */}
      <div className="print-root hidden print:block">
        {studentsToPrint.map((studentToPrint) => (
          <PrintCard
            key={studentToPrint.id}
            student={studentToPrint}
            categories={categories}
            config={config}
            isPrinting={true}
          />
        ))}
      </div>

      {/* MODALS */}
      <StudentManagerModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        activeStudentId={activeStudentId}
        onSelectStudent={(id) => setActiveStudentId(id)}
        onAddStudent={handleAddStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        onOpenExcelImport={() => {
          setIsStudentModalOpen(false);
          setIsExcelImportModalOpen(true);
        }}
        onDownloadTemplate={() =>
          downloadStudentExcelTemplate(activeStudent?.kelas || '2.1', config.academicYear)
        }
      />

      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        defaultKelas={activeStudent?.kelas || '2.1'}
        defaultTahunPelajaran={config.academicYear}
        onImport={handleBatchImportStudents}
      />

      <MateriManagerModal
        isOpen={isMateriModalOpen}
        onClose={() => setIsMateriModalOpen(false)}
        categories={categories}
        onSaveCategories={(newCats) => {
          setCategories(newCats);
          showToast('Kategori dan butir hafalan berhasil diperbarui!');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onUpdateConfig={(newConf) => {
          setConfig(newConf);
          showToast('Pengaturan lembaga berhasil disimpan!');
        }}
        onExportAllData={handleExportAllData}
        onImportData={handleImportData}
        onOpenExaminerManager={() => setIsExaminerModalOpen(true)}
      />

      <BatchPrintModal
        isOpen={isBatchPrintModalOpen}
        onClose={() => setIsBatchPrintModalOpen(false)}
        students={students}
        onTriggerBatchPrint={handleTriggerBatchPrint}
      />

      <ExaminerManagerModal
        isOpen={isExaminerModalOpen}
        onClose={() => setIsExaminerModalOpen(false)}
        examiners={examiners}
        defaultExaminer={defaultPenguji}
        onUpdateExaminers={handleUpdateExaminers}
        onSetDefaultExaminer={setDefaultPenguji}
      />
    </div>
  );
}
