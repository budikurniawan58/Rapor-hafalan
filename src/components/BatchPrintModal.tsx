import React, { useState } from 'react';
import { Printer, CheckSquare, Square, X } from 'lucide-react';
import { Student } from '../types';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onTriggerBatchPrint: (selectedIds: string[]) => void;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  students,
  onTriggerBatchPrint,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(students.map((s) => s.id));

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.id));
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    if (selectedIds.length === 0) return;
    onTriggerBatchPrint(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cetak Massal (Batch Print)</h2>
              <p className="text-xs text-slate-500">Pilih siswa yang ingin dicetak sekaligus dalam satu dokumen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 cursor-pointer"
            >
              {selectedIds.length === students.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Pilih Semua Siswa ({students.length})</span>
            </button>
            <span className="text-slate-500">
              {selectedIds.length} terpilih ({selectedIds.length} lembar A4)
            </span>
          </div>

          <div className="space-y-1.5">
            {students.map((student) => {
              const isChecked = selectedIds.includes(student.id);
              const filledCount = Object.values(student.records).filter(
                (r) => r.keterangan === 'Lulus'
              ).length;

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Kelas {student.kelas} · NIS: {student.nis || '-'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {filledCount} Lulus
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>

          <button
            disabled={selectedIds.length === 0}
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak {selectedIds.length} Siswa Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
