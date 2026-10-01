import React, { useRef } from 'react';
import { Settings, Upload, RotateCcw, Download, FileUp, X, Check } from 'lucide-react';
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onExportAllData,
  onImportData,
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
                Jabatan Penguji / Penandatangan Kanan
              </label>
              <input
                type="text"
                value={config.examinerTitle}
                onChange={(e) => onUpdateConfig({ ...config, examinerTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar Guru/Penguji
              </label>
              <input
                type="text"
                value={config.examinerName}
                onChange={(e) => onUpdateConfig({ ...config, examinerName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jabatan Penandatangan Kiri
              </label>
              <input
                type="text"
                value={config.parentTitle}
                onChange={(e) => onUpdateConfig({ ...config, parentTitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Orang Tua / Wali (Opsional, kosongkan untuk titik-titik)
              </label>
              <input
                type="text"
                value={config.parentName}
                onChange={(e) => onUpdateConfig({ ...config, parentName: e.target.value })}
                placeholder="(Dibiarkan titik-titik tanda tangan)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              />
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
