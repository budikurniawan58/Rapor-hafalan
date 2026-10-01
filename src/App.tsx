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
import { SchoolLogo } from './components/SchoolLogo';

const STORAGE_KEY_STUDENTS = 'kartu_hafalan_students_v1';
const STORAGE_KEY_CATEGORIES = 'kartu_hafalan_categories_v1';
const STORAGE_KEY_CONFIG = 'kartu_hafalan_config_v1';

export default function App() {
  // Initialize state from localStorage or defaults
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

  // UI state
  const [activeView, setActiveView] = useState<'split' | 'input' | 'preview'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isMateriModalOpen, setIsMateriModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [batchPrintStudentIds, setBatchPrintStudentIds] = useState<string[]>([]);

  // Sync to localStorage
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find active student
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Update a single evaluation cell
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

  // Bulk update evaluation cells for active student
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

  // Print handlers
  const handlePrintActiveStudent = () => {
    setBatchPrintStudentIds([]);
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const handleTriggerBatchPrint = (selectedIds: string[]) => {
    setBatchPrintStudentIds(selectedIds);
    // Allow React state to update the DOM before printing
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
    showToast('Cadangan data berhasil diekspor!');
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
        alert('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  // Students to render during print
  const studentsToPrint =
    batchPrintStudentIds.length > 0
      ? students.filter((s) => batchPrintStudentIds.includes(s.id))
      : activeStudent ? [activeStudent] : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION NAVBAR (HIDDEN IN PRINT) */}
      <header className="no-print bg-emerald-900 text-white border-b border-emerald-950 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & School Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg p-1 flex items-center justify-center border border-white/20">
              <SchoolLogo customLogoUrl={config.customLogoUrl} size={28} />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-tight tracking-wide flex items-center gap-2">
                <span>MI RAUDLATUL HIKMAH</span>
                <span className="text-[10px] font-normal px-2 py-0.5 bg-emerald-800 text-emerald-200 rounded-full border border-emerald-700/60 hidden sm:inline">
                  T.P {config.academicYear}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                Sistem Input & Cetak Kartu Hafalan Siswa Resmi
              </p>
            </div>
          </div>

          {/* Nav Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-xs font-semibold rounded-lg border border-emerald-700/80 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Siswa ({students.length})</span>
            </button>

            <button
              onClick={() => setIsMateriModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-xs font-semibold rounded-lg border border-emerald-700/80 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Materi Hafalan</span>
            </button>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-xs font-semibold rounded-lg border border-emerald-700/80 transition-colors cursor-pointer"
              title="Pengaturan Kop Madrasah & Penguji"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kop & TTD</span>
            </button>

            <button
              onClick={() => setIsBatchPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 text-xs font-semibold rounded-lg border border-emerald-700/80 transition-colors cursor-pointer"
              title="Cetak beberapa siswa sekaligus"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Massal</span>
            </button>

            {/* Primary Print Button */}
            <button
              onClick={handlePrintActiveStudent}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Kartu Siswa Ini</span>
            </button>
          </div>
        </div>
      </header>

      {/* STUDENT SELECTION & VIEW SWITCHER BAR */}
      <section className="no-print bg-white border-b border-slate-200 sticky top-[57px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Active Student Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Siswa Terpilih:
            </span>
            <div className="relative">
              <select
                value={activeStudentId}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Kelas {s.kelas})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline underline-offset-2"
            >
              + Tambah / Edit Biodata
            </button>
          </div>

          {/* View mode segmented switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveView('split')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeView === 'split'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split View (Input & Preview)
            </button>
            <button
              onClick={() => setActiveView('input')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeView === 'input'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hanya Input Nilai
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                activeView === 'preview'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pratinjau Cetak Penuh
            </button>
          </div>
        </div>
      </section>

      {/* STUDENT PROFILE STRIP (NO-PRINT) */}
      <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2 w-full">
        <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
            <div>
              <span className="text-slate-400 font-semibold mr-1.5">NAMA:</span>
              <span className="font-bold text-slate-900 text-sm">{activeStudent.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold mr-1.5">NIS / NISN:</span>
              <span className="font-semibold text-slate-700">
                {activeStudent.nis && activeStudent.nisn
                  ? `${activeStudent.nis} / ${activeStudent.nisn}`
                  : activeStudent.nis || activeStudent.nisn || '-'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold mr-1.5">KELAS:</span>
              <span className="font-semibold text-slate-700">{activeStudent.kelas}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold mr-1.5">TAHUN PELAJARAN:</span>
              <span className="font-semibold text-slate-700">{activeStudent.tahunPelajaran}</span>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Penilai: <strong className="text-slate-800">{config.examinerName}</strong>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT AREA (NO-PRINT) */}
      <main className="no-print flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
        {/* VIEW: SPLIT (DEFAULT FOR DESKTOP) */}
        {activeView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Hafalan Input & Scoring (7 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">
                  Formulir Pengujian Hafalan Siswa
                </h3>
                <span className="text-xs text-slate-500">
                  Data otomatis terhubung ke kartu cetak di sebelah kanan
                </span>
              </div>

              <HafalanInputTable
                student={activeStudent}
                categories={categories}
                onUpdateRecord={handleUpdateRecord}
                onBatchUpdateRecords={handleBatchUpdateRecords}
                onOpenMateriManager={() => setIsMateriModalOpen(true)}
              />
            </div>

            {/* Right: Live A4 Printable Preview (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Pratinjau Hasil Cetak (1:1 Sesuai Dokumen)
                  </h3>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    A4 Portrait
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-500 font-mono w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handlePrintActiveStudent}
                    className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak
                  </button>
                </div>
              </div>

              {/* Scrollable sheet container */}
              <div className="bg-slate-200/80 rounded-xl p-4 overflow-auto max-h-[820px] flex justify-center border border-slate-300">
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

        {/* VIEW: FULL INPUT ONLY */}
        {activeView === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Form Pengisian Nilai & Ujian Hafalan: {activeStudent.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Isi tanggal lulus ujian, inisial/nama penguji, dan keterangan kelulusan
                </p>
              </div>
              <button
                onClick={handlePrintActiveStudent}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Cetak Kartu Siswa Ini
              </button>
            </div>

            <HafalanInputTable
              student={activeStudent}
              categories={categories}
              onUpdateRecord={handleUpdateRecord}
              onBatchUpdateRecords={handleBatchUpdateRecords}
              onOpenMateriManager={() => setIsMateriModalOpen(true)}
            />
          </div>
        )}

        {/* VIEW: FULL PREVIEW ONLY */}
        {activeView === 'preview' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pratinjau Ukuran Penuh Kartu Hafalan (Format A4)
                </h2>
                <p className="text-xs text-slate-500">
                  Format cetak ini telah disesuaikan persis dengan dokumen resmi MI Raudlatul Hikmah
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handlePrintActiveStudent}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Simpan PDF
                </button>
              </div>
            </div>

            <div className="bg-slate-300/80 rounded-2xl p-6 overflow-auto min-h-[600px] flex justify-center border border-slate-400/40">
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
      </main>

      {/* FOOTER (NO-PRINT) */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            Aplikasi Kartu Hafalan Siswa · <strong>{config.schoolName}</strong>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExportAllData}
              className="text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Backup Data JSON
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 cursor-pointer"
            >
              Pengaturan Lembaga
            </button>
          </div>
        </div>
      </footer>

      {/* PRINT-ONLY DOM SECTION (Shown ONLY when window.print() is executed) */}
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
      />

      <MateriManagerModal
        isOpen={isMateriModalOpen}
        onClose={() => setIsMateriModalOpen(false)}
        categories={categories}
        onSaveCategories={(newCats) => {
          setCategories(newCats);
          showToast('Kategori dan materi hafalan berhasil diperbarui!');
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
      />

      <BatchPrintModal
        isOpen={isBatchPrintModalOpen}
        onClose={() => setIsBatchPrintModalOpen(false)}
        students={students}
        onTriggerBatchPrint={handleTriggerBatchPrint}
      />
    </div>
  );
}
