import React, { useState } from 'react';
import { Plus, Trash2, UserCheck, X } from 'lucide-react';

interface ExaminerManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  examiners: string[];
  defaultExaminer: string;
  onUpdateExaminers: (examiners: string[]) => void;
  onSetDefaultExaminer: (examiner: string) => void;
}

export const ExaminerManagerModal: React.FC<ExaminerManagerModalProps> = ({
  isOpen,
  onClose,
  examiners,
  defaultExaminer,
  onUpdateExaminers,
  onSetDefaultExaminer,
}) => {
  const [newExaminerName, setNewExaminerName] = useState('');

  if (!isOpen) return null;

  const handleAddExaminer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newExaminerName.trim();
    if (!trimmed) return;

    if (examiners.some((ex) => ex.toLowerCase() === trimmed.toLowerCase())) {
      alert('Nama penguji ini sudah ada dalam daftar.');
      return;
    }

    const updated = [...examiners, trimmed];
    onUpdateExaminers(updated);
    setNewExaminerName('');
  };

  const handleDeleteExaminer = (nameToDelete: string) => {
    if (examiners.length <= 1) {
      alert('Minimal harus ada 1 nama penguji.');
      return;
    }
    const updated = examiners.filter((ex) => ex !== nameToDelete);
    onUpdateExaminers(updated);

    if (defaultExaminer === nameToDelete && updated.length > 0) {
      onSetDefaultExaminer(updated[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Kelola Daftar Penguji</h2>
              <p className="text-xs text-slate-500">Nama atau inisial penguji untuk menu dropdown</p>
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
        <div className="p-5 space-y-4">
          {/* Add form */}
          <form onSubmit={handleAddExaminer} className="flex gap-2">
            <input
              type="text"
              required
              value={newExaminerName}
              onChange={(e) => setNewExaminerName(e.target.value)}
              placeholder="Contoh: Ust. Fikra / q / FZ"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </form>

          {/* List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto border border-slate-100 rounded-xl p-1 bg-slate-50/50">
            {examiners.map((examiner) => {
              const isDefault = examiner === defaultExaminer;
              return (
                <div
                  key={examiner}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                    isDefault
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {examiner}
                    </span>
                    {isDefault && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => onSetDefaultExaminer(examiner)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 hover:bg-emerald-100 rounded cursor-pointer"
                      >
                        Jadikan Default
                      </button>
                    )}
                    {examiners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExaminer(examiner)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Hapus penguji"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
