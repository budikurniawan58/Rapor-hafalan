import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  GraduationCap,
  Users,
} from 'lucide-react';
import { Student } from '../types';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddStudent: (student: Omit<Student, 'id' | 'records'>) => void;
  onUpdateStudent: (id: string, updated: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onOpenExcelImport?: () => void;
  onDownloadTemplate?: () => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  activeStudentId,
  onSelectStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenExcelImport,
  onDownloadTemplate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for new / edit
  const [formName, setFormName] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formKelas, setFormKelas] = useState('2.1');
  const [formTahunPelajaran, setFormTahunPelajaran] = useState('2026/2027');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  // Extract all distinct classes
  const availableClasses = Array.from(
    new Set(students.map((s) => s.kelas?.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Filter students by class and search keyword
  const filteredStudents = students.filter((s) => {
    const matchesClass =
      selectedClassFilter === 'all' ||
      s.kelas.trim().toLowerCase() === selectedClassFilter.trim().toLowerCase();
    const matchesSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      s.nis.includes(search.trim()) ||
      s.nisn.includes(search.trim()) ||
      s.kelas.toLowerCase().includes(search.toLowerCase().trim());
    return matchesClass && matchesSearch;
  });

  // Group filtered students by class
  const groupedByClass = filteredStudents.reduce<Record<string, Student[]>>(
    (acc, s) => {
      const cls = s.kelas.trim() || 'Tanpa Kelas';
      if (!acc[cls]) acc[cls] = [];
      acc[cls].push(s);
      return acc;
    },
    {}
  );
  const sortedClassGroups = Object.keys(groupedByClass).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setFormName(s.name);
    setFormNis(s.nis);
    setFormNisn(s.nisn);
    setFormKelas(s.kelas);
    setFormTahunPelajaran(s.tahunPelajaran);
    setIsAddingNew(false);
  };

  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setFormName('');
    setFormNis('');
    setFormNisn('');
    setFormKelas(
      selectedClassFilter !== 'all' ? selectedClassFilter : students[0]?.kelas || '2.1'
    );
    setFormTahunPelajaran(students[0]?.tahunPelajaran || '2026/2027');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    onAddStudent({
      name: formName.trim().toUpperCase(),
      nis: formNis.trim(),
      nisn: formNisn.trim(),
      kelas: formKelas.trim(),
      tahunPelajaran: formTahunPelajaran.trim(),
    });

    setIsAddingNew(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formName.trim()) return;

    onUpdateStudent(editingId, {
      name: formName.trim().toUpperCase(),
      nis: formNis.trim(),
      nisn: formNisn.trim(),
      kelas: formKelas.trim(),
      tahunPelajaran: formTahunPelajaran.trim(),
    });

    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kelola Data Siswa</h2>
            <p className="text-xs text-slate-500">
              Data siswa dikelompokkan per-kelas dengan fitur pencarian cepat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Top Controls: Search & Class Filter */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {/* Row 1: Search bar and action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama siswa atau NIS..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!isAddingNew && !editingId && (
                <div className="flex flex-wrap items-center gap-2">
                  {onDownloadTemplate && (
                    <button
                      type="button"
                      onClick={onDownloadTemplate}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                      title="Unduh format tabel Excel kosong untuk diisi"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Template</span>
                    </button>
                  )}

                  {onOpenExcelImport && (
                    <button
                      type="button"
                      onClick={onOpenExcelImport}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                      title="Unggah file Excel data siswa"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Impor Excel</span>
                    </button>
                  )}

                  <button
                    onClick={startAddNew}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Siswa</span>
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Filter by Class Buttons (Grouped by Class) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                Pilih Kelas:
              </span>

              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  selectedClassFilter === 'all'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Semua Kelas ({students.length})
              </button>

              {availableClasses.map((cls) => {
                const count = students.filter(
                  (s) => s.kelas.trim().toLowerCase() === cls.toLowerCase()
                ).length;
                const isSelected = selectedClassFilter === cls;

                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClassFilter(cls)}
                    className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    Kelas {cls} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form add or edit */}
          {(isAddingNew || editingId) && (
            <form
              onSubmit={isAddingNew ? handleSaveAdd : handleSaveEdit}
              className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 text-sm font-bold text-emerald-950">
                <span>{isAddingNew ? 'Tambah Data Siswa Baru' : 'Edit Biodata Siswa'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: ADIA PUTRI AZZAHRA"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas *
                  </label>
                  <input
                    type="text"
                    required
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    placeholder="Contoh: 2.1 atau 5"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Nomor Induk Siswa"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    placeholder="NISN Nasional"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formTahunPelajaran}
                    onChange={(e) => setFormTahunPelajaran(e.target.value)}
                    placeholder="Contoh: 2026/2027"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer"
                >
                  {isAddingNew ? 'Simpan Siswa' : 'Perbarui Siswa'}
                </button>
              </div>
            </form>
          )}

          {/* Student List Table (Grouped by Class) */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">NIS / NISN</th>
                  <th className="py-2.5 px-3 text-center">Kelas</th>
                  <th className="py-2.5 px-3 text-center">Status Aktif</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Tidak ada siswa yang cocok dengan filter kelas dan pencarian
                    </td>
                  </tr>
                ) : (
                  sortedClassGroups.map((cls) => {
                    const classStudents = groupedByClass[cls] || [];

                    return (
                      <React.Fragment key={cls}>
                        {/* Class Group Header */}
                        <tr className="bg-emerald-50/70 border-y border-emerald-200">
                          <td
                            colSpan={5}
                            className="py-1.5 px-3 font-bold text-emerald-900 text-xs tracking-wider uppercase"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4 text-emerald-700" />
                                <span>Kelas {cls}</span>
                              </span>
                              <span className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                                {classStudents.length} Siswa
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Students in this class */}
                        {classStudents.map((s) => {
                          const isActive = s.id === activeStudentId;
                          return (
                            <tr
                              key={s.id}
                              className={`hover:bg-slate-50 transition-colors ${
                                isActive ? 'bg-emerald-50/40' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {s.name}
                              </td>
                              <td className="py-2.5 px-3 text-xs text-slate-600 font-mono">
                                {s.nis && s.nisn
                                  ? `${s.nis} / ${s.nisn}`
                                  : s.nis || s.nisn || '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center text-xs font-bold text-emerald-800">
                                {s.kelas}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isActive ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" /> Sedang Dipilih
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      onSelectStudent(s.id);
                                      onClose();
                                    }}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                                  >
                                    Pilih Siswa Ini
                                  </button>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => startEdit(s)}
                                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                    title="Edit Data Siswa"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  {students.length > 1 && (
                                    <button
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Hapus siswa "${s.name}" (Kelas ${s.kelas})?`
                                          )
                                        ) {
                                          onDeleteStudent(s.id);
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                      title="Hapus Siswa"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total <strong>{students.length}</strong> siswa terdaftar di{' '}
            <strong>{availableClasses.length}</strong> kelas.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
