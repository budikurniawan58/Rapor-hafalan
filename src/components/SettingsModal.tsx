import React, { useRef } from 'react';
import { Settings, Upload, RotateCcw, Download, FileUp, X } from 'lucide-react';
import { SchoolConfig } from '../types';
import { DEFAULT_SCHOOL_CONFIG } from '../constants/defaultData';
import { SchoolLogo } from './SchoolLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onUpdateConfig: (updated: SchoolConfig) => void;
  onExportAllData: () => void;
  onImportData: (file: File) => void;
  onOpenExaminerManager?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onExportAllData,
  onImportData,
  onOpenExaminerManager,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

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
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Daftar Wali Kelas Masing-Masing Kelas
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Rapor tiap kelas otomatis mencantumkan nama wali kelasnya masing-masing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['1.1', '2.1', '5'].map((cls) => {
                const current = config.waliKelasPerClass?.[cls] || { name: '', nip: '' };
                return (
                  <div key={cls} className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-900 border-b border-slate-100 pb-1 flex items-center justify-between">
                      <span>Wali Kelas {cls}</span>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Nama & Gelar</label>
                      <input
                        type="text"
                        value={current.name}
                        onChange={(e) => {
                          const updatedMap = {
                            ...(config.waliKelasPerClass || {}),
                            [cls]: { ...current, name: e.target.value },
                          };
                          onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
                        }}
                        placeholder={`Nama Wali Kelas ${cls}`}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">NIP (Opsional)</label>
                      <input
                        type="text"
                        value={current.nip || ''}
                        onChange={(e) => {
                          const updatedMap = {
                            ...(config.waliKelasPerClass || {}),
                            [cls]: { ...current, nip: e.target.value },
                          };
                          onUpdateConfig({ ...config, waliKelasPerClass: updatedMap });
                        }}
                        placeholder="NIP Wali Kelas"
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
