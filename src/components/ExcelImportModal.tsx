import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  X,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { downloadStudentExcelTemplate, parseStudentExcelFile, ParsedStudentRow } from '../utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKelas?: string;
  defaultTahunPelajaran?: string;
  onImport: (newStudents: ParsedStudentRow[], replaceAll: boolean) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  defaultKelas = '2.1',
  defaultTahunPelajaran = '2026/2027',
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replaceAll, setReplaceAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    downloadStudentExcelTemplate(defaultKelas, defaultTahunPelajaran);
  };

  const handleProcessFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setIsLoading(true);
    setFile(selectedFile);

    try {
      const rows = await parseStudentExcelFile(selectedFile);
      setParsedRows(rows);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file Excel.');
      setParsedRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleProcessFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleProcessFile(droppedFile);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImport(parsedRows, replaceAll);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg(null);
    setIsLoading(false);
    setReplaceAll(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Impor Data Siswa dari Excel
              </h2>
              <p className="text-xs text-slate-500">
                Gunakan template resmi untuk memasukkan data siswa secara otomatis
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1: Download Template */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-950">
                  Unduh Template Excel Resmi
                </div>
                <div className="text-xs text-emerald-800/80">
                  Format kolom: No, Nama Lengkap Siswa, NIS, NISN, Kelas, Tahun Pelajaran
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer ml-auto"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload Area */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Unggah File Excel yang Telah Diisi
              </span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-700">
                  {file ? (
                    <FileCheck className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                {file ? (
                  <div>
                    <div className="text-sm font-bold text-slate-800">{file.name}</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Klik atau seret file lain untuk mengganti
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-bold text-slate-700">
                      Klik untuk memilih file Excel atau seret file ke sini
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Mendukung format .xlsx, .xls, atau .csv
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="text-center py-4 text-xs text-slate-500">
              Sedang membaca dan memverifikasi data Excel...
            </div>
          )}

          {/* Preview of Parsed Rows */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Ditemukan {parsedRows.length} Data Siswa Siap Diimpor:
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">No</th>
                      <th className="py-2 px-3">Nama Lengkap</th>
                      <th className="py-2 px-3">NIS</th>
                      <th className="py-2 px-3">NISN</th>
                      <th className="py-2 px-3 text-center">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800">
                          {row.name}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {row.nis}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {row.nisn}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600 font-semibold">
                          {row.kelas}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Options */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block">Pilihan Mode Impor:</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="radio"
                      name="importMode"
                      checked={!replaceAll}
                      onChange={() => setReplaceAll(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tambahkan ke daftar siswa yang ada</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-rose-700">
                    <input
                      type="radio"
                      name="importMode"
                      checked={replaceAll}
                      onChange={() => setReplaceAll(true)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Ganti seluruh daftar siswa saat ini</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirmImport}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
              parsedRows.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Impor {parsedRows.length > 0 ? `${parsedRows.length} Siswa` : 'Data'} Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
