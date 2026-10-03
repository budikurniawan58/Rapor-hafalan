import React, { useRef, useState } from 'react';
import { Settings, Upload, RotateCcw, Download, FileUp, X, Plus, Trash2, UserCheck, RefreshCw } from 'lucide-react';
import { SchoolConfig, UserAccount } from '../types';
import { DEFAULT_SCHOOL_CONFIG } from '../constants/defaultData';
import { SchoolLogo } from './SchoolLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  users?: UserAccount[];
  availableClasses?: string[];
  onUpdateConfig: (updated: SchoolConfig) => void;
  onExportAllData: () => void;
  onImportData: (file: File) => void;
  onOpenExaminerManager?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  users = [],
  availableClasses = ['1.1', '2.1', '5'],
  onUpdateConfig,
  onExportAllData,
  onImportData,
  onOpenExaminerManager,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // State for adding a new Wali Kelas
  const [isAddingWali, setIsAddingWali] = useState(false);
  const [newWaliKelas, setNewWaliKelas] = useState('');
  const [newWaliName, setNewWaliName] = useState('');
  const [newWaliNip, setNewWaliNip] = useState('');

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateConfig({
          ...config,
          customLogoUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    onUpdateConfig({
      ...config,
      customLogoUrl: null,
    });
  };

  const handleResetAllConfig = () => {
    if (window.confirm('Kembalikan pengaturan madrasah dan penguji ke format standar PDF?')) {
      onUpdateConfig({ ...DEFAULT_SCHOOL_CONFIG });
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pengaturan Lembaga & Tanda Tangan</h2>
              <p className="text-xs text-slate-500">Sesuaikan kop madrasah, penguji, tanggal, dan logo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Logo Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Logo Madrasah pada Kartu
            </label>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-center w-20 h-20 shadow-2xs">
                <SchoolLogo customLogoUrl={config.customLogoUrl} size={64} />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Unggah Logo Resmi
                  </button>
                  {config.customLogoUrl && (
                    <button
                      onClick={handleResetLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      Kembali ke Logo Vektor
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Format gambar: PNG/JPEG transparan dianjurkan. Logo akan tampil presisi pada kartu cetak.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields for Madrasah Kop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Nama Madrasah / Sekolah
              </label>
              <input
                type="text"
                value={config.schoolName}
                onChange={(e) => onUpdateConfig({ ...config, schoolName: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Judul Laporan
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => onUpdateConfig({ ...config, title: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tahun Pelajaran Default
              </label>
              <input
                type="text"
                value={config.academicYear}
                onChange={(e) => onUpdateConfig({ ...config, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kota Titimangsa
              </label>
              <input
                type="text"
                value={config.city}
                onChange={(e) => onUpdateConfig({ ...config, city: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tanggal Titimangsa Kartu
              </label>
              <input
                type="text"
                value={config.date}
                onChange={(e) => onUpdateConfig({ ...config, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jabatan Penandatangan (Kanan)
              </label>
              <input
                type="text"
                value={config.examinerTitle || 'Wali Kelas,'}
                onChange={(e) => onUpdateConfig({ ...config, examinerTitle: e.target.value })}
                placeholder="Contoh: Wali Kelas,"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Nama Lengkap & Gelar Wali Kelas
                </label>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  (Bisa huruf besar & kecil)
                </span>
              </div>
              <input
                type="text"
                value={config.examinerName}
                onChange={(e) => onUpdateConfig({ ...config, examinerName: e.target.value })}
                placeholder="Contoh: Fikra Abdillah Zaenal, S.S., S.Pd."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Penulisan gelar diakomodasi huruf besar/kecil (contoh: S.Pd., S.Pd.I, Lc., M.Ag.)
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP / NUPTK Wali Kelas (Opsional)
              </label>
              <input
                type="text"
                value={config.examinerNip || ''}
                onChange={(e) => onUpdateConfig({ ...config, examinerNip: e.target.value })}
                placeholder="Contoh: 19880415 201201 1 002 (Kosongkan jika tidak ada)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jabatan Penandatangan (Kiri)
              </label>
              <input
                type="text"
                value={config.parentTitle || 'Orang Tua / Wali Siswa,'}
                onChange={(e) => onUpdateConfig({ ...config, parentTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Nama Orang Tua / Wali Siswa (Opsional, kosongkan untuk titik-titik)
              </label>
              <input
                type="text"
                value={config.parentName}
                onChange={(e) => onUpdateConfig({ ...config, parentName: e.target.value })}
                placeholder="(Dibiarkan kosong untuk titik-titik tanda tangan orang tua)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Per-Class Wali Kelas Section */}
          {(() => {
            const registeredTeachers = users.filter((u) => u.role === 'walikelas');
            const configuredMap = config.waliKelasPerClass || {};
            const sortedClasses = Object.keys(configuredMap).sort((a, b) =>
              a.localeCompare(b, undefined, { numeric: true })
            );

            const handleAddWali = (e: React.FormEvent) => {
              e.preventDefault();
              const cleanClass = newWaliKelas.trim();
              const cleanName = newWaliName.trim();
              if (!cleanClass || !cleanName) return;

              const updatedMap = {
                ...configuredMap,
                [cleanClass]: {
                  name: cleanName,
                  nip: newWaliNip.trim() || undefined,
                },
              };
              onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
              setNewWaliKelas('');
              setNewWaliName('');
              setNewWaliNip('');
              setIsAddingWali(false);
            };

            const handleDeleteWali = (clsToDelete: string) => {
              if (window.confirm(`Hapus data wali kelas untuk Kelas ${clsToDelete}?`)) {
                const updatedMap = { ...configuredMap };
                delete updatedMap[clsToDelete];
                onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
              }
            };

            const handleUpdateField = (cls: string, field: 'name' | 'nip', value: string) => {
              const current = configuredMap[cls] || { name: '', nip: '' };
              const updatedMap = {
                ...configuredMap,
                [cls]: {
                  ...current,
                  [field]: value,
                },
              };
              onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
            };

            const handleSyncFromUsers = () => {
              if (registeredTeachers.length === 0) {
                alert('Belum ada akun guru wali kelas yang terdaftar.');
                return;
              }
              const updatedMap = { ...configuredMap };
              let count = 0;
              registeredTeachers.forEach((u) => {
                if (u.assignedKelas) {
                  const cls = u.assignedKelas.trim();
                  updatedMap[cls] = {
                    name: u.name,
                    nip: u.nip || '',
                  };
                  count++;
                }
              });
              onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
              alert(`Berhasil menyinkronkan ${count} wali kelas dari akun guru terdaftar!`);
            };

            return (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
                  <div>
                    <h4 className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-700" />
                      <span>Daftar Wali Kelas Tiap Kelas ({sortedClasses.length})</span>
                    </h4>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Tanda tangan rapor otomatis mencantumkan nama dan NIP wali kelas sesuai kelas murid masing-masing
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {registeredTeachers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSyncFromUsers}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        title="Otomatis menyelaraskan daftar wali kelas dengan akun guru terdaftar"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sinkron dari Akun Guru</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsAddingWali(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Wali Kelas</span>
                    </button>
                  </div>
                </div>

                {/* Form Tambah Wali Kelas Baru */}
                {isAddingWali && (
                  <form
                    onSubmit={handleAddWali}
                    className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-2xs space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-slate-100 pb-1.5">
                      <span>+ Tambah Wali Kelas Baru</span>
                      <button
                        type="button"
                        onClick={() => setIsAddingWali(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Kelas
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: 1.2 / 3.1 / 4"
                          value={newWaliKelas}
                          onChange={(e) => setNewWaliKelas(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-bold"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Nama Lengkap & Gelar
                          </label>
                          {registeredTeachers.length > 0 && (
                            <select
                              onChange={(e) => {
                                const u = registeredTeachers.find((t) => t.id === e.target.value);
                                if (u) {
                                  setNewWaliName(u.name);
                                  setNewWaliNip(u.nip || '');
                                  if (!newWaliKelas && u.assignedKelas) {
                                    setNewWaliKelas(u.assignedKelas);
                                  }
                                }
                              }}
                              className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 cursor-pointer"
                              defaultValue=""
                            >
                              <option value="" disabled>Pilih dari Guru...</option>
                              {registeredTeachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} (Kelas {t.assignedKelas})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Ustadzah Nurul Hidayah, S.Pd.I"
                          value={newWaliName}
                          onChange={(e) => setNewWaliName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none font-medium"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          NIP / NUPTK (Opsional)
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: 19930512 201801 2 001"
                          value={newWaliNip}
                          onChange={(e) => setNewWaliNip(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingWali(false)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Simpan Wali Kelas
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Wali Kelas Cards */}
                {sortedClasses.length === 0 ? (
                  <div className="p-6 bg-white rounded-xl border border-dashed border-emerald-300 text-center text-slate-500">
                    Belum ada wali kelas khusus yang didaftarkan. Silakan klik tombol "+ Tambah Wali Kelas" di atas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedClasses.map((cls) => {
                      const current = configuredMap[cls] || { name: '', nip: '' };
                      return (
                        <div
                          key={cls}
                          className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-2 hover:border-emerald-400 transition-colors"
                        >
                          <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold tracking-wide">
                              Kelas {cls}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteWali(cls)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={`Hapus Wali Kelas ${cls}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick pick from registered teachers */}
                          {registeredTeachers.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <label className="text-[10px] text-slate-400 flex-shrink-0">Pilih:</label>
                              <select
                                onChange={(e) => {
                                  const t = registeredTeachers.find((u) => u.id === e.target.value);
                                  if (t) {
                                    handleUpdateField(cls, 'name', t.name);
                                    if (t.nip) handleUpdateField(cls, 'nip', t.nip);
                                  }
                                }}
                                className="w-full text-[10px] py-0.5 px-1 bg-slate-50 border border-slate-200 rounded text-slate-700 cursor-pointer"
                                defaultValue=""
                              >
                                <option value="" disabled>-- Ambil dari Akun Guru --</option>
                                {registeredTeachers.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} (Kelas {t.assignedKelas})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nama & Gelar</label>
                            <input
                              type="text"
                              value={current.name}
                              onChange={(e) => handleUpdateField(cls, 'name', e.target.value)}
                              placeholder={`Nama Wali Kelas ${cls}`}
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">NIP / NUPTK</label>
                            <input
                              type="text"
                              value={current.nip || ''}
                              onChange={(e) => handleUpdateField(cls, 'nip', e.target.value)}
                              placeholder="NIP Wali Kelas (Opsional)"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Backup & Restore Data */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Cadangkan & Pulihkan Data (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Simpan seluruh data siswa, penilaian hafalan, materi, dan pengaturan ke file komputer Anda, atau muat cadangan sebelumnya.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportAllData}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Ekspor Backup (JSON)
              </button>

              <input
                type="file"
                ref={jsonInputRef}
                onChange={handleJsonUpload}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <FileUp className="w-4 h-4 text-blue-600" />
                Impor Data Backup
              </button>

              <button
                onClick={handleResetAllConfig}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-medium rounded-lg transition-colors cursor-pointer ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset ke Format Standar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
