import React, { useState } from 'react';
import { Printer, CheckSquare, Square, X, Filter, GraduationCap } from 'lucide-react';
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
  const [classFilter, setClassFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Extract distinct classes
  const availableClasses = Array.from(
    new Set(students.map((s) => s.kelas?.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Filter students based on class filter
  const visibleStudents = students.filter(
    (s) => classFilter === 'all' || s.kelas.trim().toLowerCase() === classFilter.trim().toLowerCase()
  );

  // Group visible students by class
  const groupedByClass = visibleStudents.reduce<Record<string, Student[]>>((acc, s) => {
    const cls = s.kelas.trim() || 'Tanpa Kelas';
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(s);
    return acc;
  }, {});
  const sortedClasses = Object.keys(groupedByClass).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  const toggleSelectAllVisible = () => {
    const visibleIds = visibleStudents.map((s) => s.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      // Unselect visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectClass = (cls: string) => {
    const classIds = (groupedByClass[cls] || []).map((s) => s.id);
    const allClassSelected = classIds.every((id) => selectedIds.includes(id));

    if (allClassSelected) {
      setSelectedIds((prev) => prev.filter((id) => !classIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...classIds])));
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

  const visibleIds = visibleStudents.map((s) => s.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cetak Massal (Batch Print)</h2>
              <p className="text-xs text-slate-500">
                Pilih siswa per-kelas untuk dicetak sekaligus pada kertas Legal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Class Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              Kelas:
            </span>

            <button
              type="button"
              onClick={() => setClassFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                classFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Semua Kelas
            </button>

            {availableClasses.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setClassFilter(cls)}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  classFilter === cls
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>

          {/* Selection summary */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={toggleSelectAllVisible}
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 cursor-pointer"
            >
              {allVisibleSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {classFilter === 'all'
                  ? `Pilih Semua Siswa (${students.length})`
                  : `Pilih Semua Kelas ${classFilter} (${visibleStudents.length})`}
              </span>
            </button>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {selectedIds.length} siswa terpilih
            </span>
          </div>

          {/* Student list grouped by class */}
          <div className="space-y-4">
            {sortedClasses.map((cls) => {
              const classStudents = groupedByClass[cls] || [];
              const classSelectedCount = classStudents.filter((s) =>
                selectedIds.includes(s.id)
              ).length;
              const isAllClassSelected = classSelectedCount === classStudents.length;

              return (
                <div key={cls} className="space-y-1.5">
                  {/* Class subheader with quick toggle */}
                  <div className="flex items-center justify-between px-2 py-1 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-950">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                      Kelas {cls} ({classStudents.length} Siswa)
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSelectClass(cls)}
                      className="text-[11px] text-emerald-700 hover:underline cursor-pointer"
                    >
                      {isAllClassSelected ? 'Batal Pilih Kelas Ini' : 'Pilih Semua Kelas Ini'}
                    </button>
                  </div>

                  {classStudents.map((student) => {
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
                            <div className="text-[11px] text-slate-500 font-mono">
                              NIS: {student.nis || '-'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {filledCount} Lulus
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>

          <button
            disabled={selectedIds.length === 0}
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak {selectedIds.length} Siswa (Legal)
          </button>
        </div>
      </div>
    </div>
  );
};
