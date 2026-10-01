import React, { useState } from 'react';
import {
  Calendar,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { HafalanCategory, Student } from '../types';

interface HafalanInputTableProps {
  student: Student;
  categories: HafalanCategory[];
  onUpdateRecord: (itemId: string, field: 'tanggal' | 'penguji' | 'keterangan', value: string) => void;
  onBatchUpdateRecords: (records: Record<string, { tanggal: string; penguji: string; keterangan: string }>) => void;
  onOpenMateriManager: () => void;
}

export const HafalanInputTable: React.FC<HafalanInputTableProps> = ({
  student,
  categories,
  onUpdateRecord,
  onBatchUpdateRecords,
  onOpenMateriManager,
}) => {
  const [defaultPenguji, setDefaultPenguji] = useState('q');

  // Calculate statistics
  const allItems = categories.flatMap((cat) => cat.items);
  const totalItems = allItems.length;
  const passedItems = allItems.filter(
    (item) => (student.records[item.id]?.keterangan || '').toLowerCase() === 'lulus'
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

  // Bulk action: Mark all as 'Lulus' with sequential or current date and default penguji
  const handlePassAllSequential = () => {
    const updated: Record<string, { tanggal: string; penguji: string; keterangan: string }> = {};
    let counter = 1;
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        updated[item.id] = {
          tanggal: String(counter++),
          penguji: defaultPenguji || 'q',
          keterangan: 'Lulus',
        };
      });
    });
    onBatchUpdateRecords(updated);
  };

  const handlePassAllToday = () => {
    const today = new Date();
    const formatted = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const updated: Record<string, { tanggal: string; penguji: string; keterangan: string }> = {};
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        updated[item.id] = {
          tanggal: formatted,
          penguji: defaultPenguji || 'q',
          keterangan: 'Lulus',
        };
      });
    });
    onBatchUpdateRecords(updated);
  };

  const handleResetAll = () => {
    if (window.confirm(`Kosongkan semua nilai hafalan untuk ${student.name}?`)) {
      const updated: Record<string, { tanggal: string; penguji: string; keterangan: string }> = {};
      categories.forEach((cat) => {
        cat.items.forEach((item) => {
          updated[item.id] = {
            tanggal: '',
            penguji: '',
            keterangan: '',
          };
        });
      });
      onBatchUpdateRecords(updated);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Action Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Progres Hafalan:
            </span>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {passedItems} / {totalItems} Lulus ({progressPercent}%)
            </span>
          </div>

          {/* Quick preset controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span>Paraf/Penguji Default:</span>
              <input
                type="text"
                value={defaultPenguji}
                onChange={(e) => setDefaultPenguji(e.target.value)}
                className="w-12 px-1 py-0.5 text-xs font-semibold text-center border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
                placeholder="q"
                title="Paraf atau inisial penguji (contoh: q, FZ, dll)"
              />
            </div>

            <button
              onClick={handlePassAllSequential}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Isi nomor urut (1, 2, 3...) dan tandai Lulus seperti format PDF"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              Luluskan Semua (Urut 1..{totalItems})
            </button>

            <button
              onClick={handlePassAllToday}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Tandai semua lulus dengan tanggal hari ini"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              Luluskan Tanggal Hari Ini
            </button>

            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Kosongkan nilai hafalan siswa ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kosongkan
            </button>
          </div>
        </div>
      </div>

      {/* Input Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3 text-center w-12">No</th>
              <th className="py-2.5 px-3">Materi Hafalan</th>
              <th className="py-2.5 px-3 text-center w-32">Tanggal</th>
              <th className="py-2.5 px-3 text-center w-28">Penguji</th>
              <th className="py-2.5 px-3 text-center w-36">Keterangan</th>
              <th className="py-2.5 px-3 text-center w-28">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <tr className="bg-emerald-100/70 border-y border-emerald-200 font-bold text-emerald-950">
                  <td className="py-2 px-3 text-center">{category.code}</td>
                  <td colSpan={5} className="py-2 px-3 tracking-wide">
                    {category.name}
                  </td>
                </tr>

                {/* Category Items */}
                {category.items.map((item, idx) => {
                  const record = student.records[item.id] || {
                    tanggal: '',
                    penguji: '',
                    keterangan: '',
                  };
                  const isPassed = record.keterangan === 'Lulus';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isPassed ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {item.nama}
                      </td>

                      {/* Tanggal Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={record.tanggal || ''}
                          onChange={(e) => onUpdateRecord(item.id, 'tanggal', e.target.value)}
                          placeholder="e.g. 1 / 16 Okt"
                          className="w-full text-center text-xs px-2 py-1 bg-white border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>

                      {/* Penguji Input */}
                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={record.penguji || ''}
                          onChange={(e) => onUpdateRecord(item.id, 'penguji', e.target.value)}
                          placeholder="q"
                          className="w-full text-center text-xs px-2 py-1 bg-white border border-slate-300 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>

                      {/* Keterangan Select / Input */}
                      <td className="py-2 px-2 text-center">
                        <select
                          value={record.keterangan || ''}
                          onChange={(e) => onUpdateRecord(item.id, 'keterangan', e.target.value)}
                          className={`w-full text-xs px-2 py-1 rounded font-semibold border focus:outline-none transition-colors ${
                            record.keterangan === 'Lulus'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : record.keterangan === 'Belum Lulus'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="">- Kosong -</option>
                          <option value="Lulus">Lulus</option>
                          <option value="Belum Lulus">Belum Lulus</option>
                          <option value="Mengulang">Mengulang</option>
                          <option value="Mutqin">Mutqin</option>
                        </select>
                      </td>

                      {/* Quick Action Button */}
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {record.keterangan === 'Lulus' ? (
                            <button
                              onClick={() => {
                                onUpdateRecord(item.id, 'keterangan', '');
                                onUpdateRecord(item.id, 'tanggal', '');
                                onUpdateRecord(item.id, 'penguji', '');
                              }}
                              className="text-xs px-2 py-0.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus Nilai"
                            >
                              Reset
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const currentFilledCount = Object.values(student.records).filter(
                                  (r) => r.keterangan === 'Lulus'
                                ).length;
                                onUpdateRecord(item.id, 'keterangan', 'Lulus');
                                if (!record.tanggal) {
                                  onUpdateRecord(item.id, 'tanggal', String(currentFilledCount + 1));
                                }
                                if (!record.penguji) {
                                  onUpdateRecord(item.id, 'penguji', defaultPenguji || 'q');
                                }
                              }}
                              className="text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors shadow-2xs"
                              title="Tandai Lulus & Isi Nilai"
                            >
                              + Lulus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>💡 Tips: Klik "+ Lulus" untuk mengisi otomatis nilai, tanggal nomor urut, dan paraf penguji.</span>
        <button
          onClick={onOpenMateriManager}
          className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
        >
          Kelola Kategori & Butir Hafalan →
        </button>
      </div>
    </div>
  );
};
