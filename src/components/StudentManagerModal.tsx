import React, { useState } from 'react';
import { Plus, Trash2, Edit2, User, Search, Check, X } from 'lucide-react';
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
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for new / edit
  const [formName, setFormName] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formKelas, setFormKelas] = useState('2.1');
  const [formTahunPelajaran, setFormTahunPelajaran] = useState('2026/2027');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.includes(search) ||
      s.nisn.includes(search) ||
      s.kelas.toLowerCase().includes(search.toLowerCase())
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
    setFormKelas(students[0]?.kelas || '2.1');
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kelola Data Siswa</h2>
            <p className="text-xs text-slate-500">Tambah, ubah, atau pilih siswa untuk cetak kartu</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Bar: Search & Add button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama siswa, NIS, atau kelas..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            {!isAddingNew && !editingId && (
              <button
                onClick={startAddNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Tambah Siswa Baru
              </button>
            )}
          </div>

          {/* New / Edit Form Banner */}
          {(isAddingNew || editingId) && (
            <form
              onSubmit={isAddingNew ? handleSaveAdd : handleSaveEdit}
              className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-950">
                  {isAddingNew ? 'Tambah Siswa Baru' : 'Edit Biodata Siswa'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: ADIA PUTRI AZZAHRA"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm uppercase focus:border-emerald-500 focus:outline-none"
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
                    placeholder="Contoh: 111236740052251026"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
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
                    placeholder="Contoh: 3183369703"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    placeholder="Contoh: 2.1"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
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
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
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
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  {isAddingNew ? 'Simpan Siswa' : 'Perbarui Siswa'}
                </button>
              </div>
            </form>
          )}

          {/* Student List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold">
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
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Tidak ada siswa yang cocok dengan pencarian
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const isActive = s.id === activeStudentId;
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isActive ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600">
                          {s.nis && s.nisn ? `${s.nis} / ${s.nisn}` : s.nis || s.nisn || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-center text-xs font-medium text-slate-700">
                          {s.kelas}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Sedang Diedit
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onSelectStudent(s.id);
                                onClose();
                              }}
                              className="text-xs font-medium text-slate-500 hover:text-emerald-700 hover:underline"
                            >
                              Pilih Siswa
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(s)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Data Siswa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {students.length > 1 && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus siswa "${s.name}"?`)) {
                                    onDeleteStudent(s.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Hapus Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
