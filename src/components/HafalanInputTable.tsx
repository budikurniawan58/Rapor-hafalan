import React, { useState } from 'react';
import {
  Calendar,
  RotateCcw,
  Zap,
  Check,
  SlidersHorizontal,
  UserCheck,
  Printer,
  Filter,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { HafalanCategory, Student } from '../types';
import { isApplicableToClass } from '../utils/hafalanFilter';

interface HafalanInputTableProps {
  student: Student;
  categories: HafalanCategory[];
  examiners: string[];
  defaultPenguji: string;
  onChangeDefaultPenguji: (penguji: string) => void;
  onUpdateRecord: (itemId: string, field: 'tanggal' | 'penguji' | 'keterangan', value: string) => void;
  onBatchUpdateRecords: (records: Record<string, { tanggal: string; penguji: string; keterangan: string }>) => void;
  onToggleExcludeFromPrint?: (itemId: string, exclude: boolean) => void;
  onBatchToggleExcludeFromPrint?: (itemIds: string[], exclude: boolean) => void;
  onOpenMateriManager: () => void;
  onOpenExaminerManager: () => void;
}

export const HafalanInputTable: React.FC<HafalanInputTableProps> = ({
  student,
  categories,
  examiners,
  defaultPenguji,
  onChangeDefaultPenguji,
  onUpdateRecord,
  onBatchUpdateRecords,
  onToggleExcludeFromPrint,
  onBatchToggleExcludeFromPrint,
  onOpenMateriManager,
  onOpenExaminerManager,
}) => {
  const [showHelperTools, setShowHelperTools] = useState(false);
  // View scope: 'class' (only items for this student's class) vs 'all' (all master items)
  const [viewScope, setViewScope] = useState<'class' | 'all'>('class');

  // Filtered categories based on view scope
  const displayCategories = categories
    .map((category) => {
      if (viewScope === 'class' && !isApplicableToClass(category.targetClasses, student.kelas)) {
        return null;
      }
      const items = category.items.filter((item) => {
        if (viewScope === 'class') {
          return isApplicableToClass(item.targetClasses, student.kelas);
        }
        return true;
      });
      if (items.length === 0) return null;
      return { ...category, items };
    })
    .filter((c): c is HafalanCategory => c !== null);

  // Statistics for active displayed items
  const allDisplayItems = displayCategories.flatMap((cat) => cat.items);
  const totalItems = allDisplayItems.length;
  const passedItems = allDisplayItems.filter(
    (item) => (student.records[item.id]?.keterangan || '').toLowerCase() === 'lulus'
  ).length;
  const printedItemsCount = allDisplayItems.filter(
    (item) => !student.records[item.id]?.excludeFromPrint
  ).length;
  const progressPercent = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

  // Bulk actions
  const handlePassAllSequential = () => {
    const updated: Record<string, { tanggal: string; penguji: string; keterangan: string }> = {};
    let counter = 1;
    displayCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        updated[item.id] = {
          tanggal: String(counter++),
          penguji: defaultPenguji || (examiners[0] || 'q'),
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
    displayCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        updated[item.id] = {
          tanggal: formatted,
          penguji: defaultPenguji || (examiners[0] || 'q'),
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

  // Toggle Print inclusion for all displayed items
  const handlePrintAllToggle = (includeAll: boolean) => {
    if (onBatchToggleExcludeFromPrint) {
      const itemIds = allDisplayItems.map((item) => item.id);
      onBatchToggleExcludeFromPrint(itemIds, !includeAll);
    }
  };

  // Only include items that are marked 'Lulus' on print
  const handlePrintOnlyPassed = () => {
    if (onBatchToggleExcludeFromPrint) {
      allDisplayItems.forEach((item) => {
        const isPassed = (student.records[item.id]?.keterangan || '').toLowerCase() === 'lulus';
        onToggleExcludeFromPrint?.(item.id, !isPassed);
      });
    }
  };

  const toggleItemLulus = (itemId: string) => {
    const current = student.records[itemId];
    if (current?.keterangan === 'Lulus') {
      // Toggle to Belum Lulus
      onUpdateRecord(itemId, 'keterangan', 'Belum Lulus');
      onUpdateRecord(itemId, 'tanggal', '');
      onUpdateRecord(itemId, 'penguji', '');
    } else {
      // Toggle to Lulus
      const filledCount = Object.values(student.records).filter(
        (r) => r.keterangan === 'Lulus'
      ).length;
      onUpdateRecord(itemId, 'keterangan', 'Lulus');
      if (!current?.tanggal) {
        onUpdateRecord(itemId, 'tanggal', String(filledCount + 1));
      }
      if (!current?.penguji) {
        onUpdateRecord(itemId, 'penguji', defaultPenguji || (examiners[0] || 'q'));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Top Simple Summary & Action Bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Progress indicator & Class Scope Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            {progressPercent}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {passedItems} dari {totalItems} Hafalan Lulus
              </span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {printedItemsCount} Dicetak
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Siswa: <strong className="text-slate-700">{student.name}</strong> (Kelas {student.kelas || '-'})
            </div>
          </div>
        </div>

        {/* View Scope & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter Switcher */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewScope('class')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewScope === 'class'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Materi Kelas {student.kelas || '-'}
            </button>
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Materi
            </button>
          </div>

          <button
            onClick={() => setShowHelperTools(!showHelperTools)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
              showHelperTools
                ? 'bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showHelperTools ? 'Tutup Alat' : 'Alat Cepat'}</span>
          </button>

          <button
            onClick={handlePassAllSequential}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Luluskan Semua Sekaligus</span>
          </button>
        </div>
      </div>

      {/* Expandable Helper Tools Drawer */}
      {showHelperTools && (
        <div className="p-3.5 bg-emerald-50/60 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Dropdown for default examiner */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-600 font-medium">Penguji Default:</span>
              <select
                value={defaultPenguji}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    onOpenExaminerManager();
                  } else {
                    onChangeDefaultPenguji(e.target.value);
                  }
                }}
                className="px-2 py-0.5 font-bold text-xs border border-slate-300 rounded-lg text-emerald-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {examiners.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
                <option value="__add_new__" className="text-emerald-700 font-bold">
                  + Tambah Penguji...
                </option>
              </select>
              <button
                type="button"
                onClick={onOpenExaminerManager}
                className="text-[11px] text-emerald-700 hover:text-emerald-950 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                Kelola
              </button>
            </div>

            <button
              onClick={handlePassAllToday}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Luluskan Tanggal Hari Ini
            </button>

            {/* Print Selection Helpers */}
            <button
              onClick={() => handlePrintAllToggle(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Centang semua materi ini untuk dicetak pada kartu"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Centang Semua Dicetak
            </button>

            <button
              onClick={() => handlePrintAllToggle(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Kosongkan semua centang agar Anda dapat memilih hafalan tertentu saja"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              Hapus Semua Centang
            </button>

            <button
              onClick={handlePrintOnlyPassed}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-emerald-800 font-semibold rounded-xl border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
              title="Hanya centang materi yang bernilai Lulus"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              Hanya Centang yang Lulus
            </button>

            <button
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 font-medium rounded-xl border border-rose-200 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kosongkan Nilai
            </button>
          </div>

          <button
            onClick={onOpenMateriManager}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 ml-auto cursor-pointer"
          >
            Atur Materi Per-Kelas →
          </button>
        </div>
      )}

      {/* Main Hafalan List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-2.5 px-3 text-center w-12">No</th>
              <th className="py-2.5 px-3">Materi Hafalan</th>
              <th className="py-2.5 px-3 text-center w-28">Status</th>
              <th className="py-2.5 px-3 text-center w-28">Tanggal</th>
              <th className="py-2.5 px-3 text-center w-36">Penguji</th>
              <th className="py-2.5 px-3 text-center w-32">Keterangan</th>
              <th
                className="py-2.5 px-2 text-center w-24"
                title="Centang hafalan yang ingin dimunculkan saat dicetak (baik yang sudah lulus ataupun belum)"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Cetak?</span>
                  <button
                    type="button"
                    onClick={() => handlePrintAllToggle(printedItemsCount < totalItems)}
                    className="p-0.5 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                    title={
                      printedItemsCount === totalItems
                        ? 'Batal centang semua'
                        : 'Centang semua materi ini'
                    }
                  >
                    {printedItemsCount === totalItems ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayCategories.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                  Tidak ada materi hafalan untuk Kelas {student.kelas || '-'}.
                  <div className="text-xs text-slate-400 mt-1">
                    Silakan klik tombol "Semua Materi" di kanan atas atau "Atur Materi Per-Kelas" untuk menambahkan hafalan.
                  </div>
                </td>
              </tr>
            ) : (
              displayCategories.map((category) => (
                <React.Fragment key={category.id}>
                  {/* Category Divider */}
                  <tr className="bg-emerald-50/70 border-y border-emerald-200/80">
                    <td className="py-2 px-3 text-center font-bold text-emerald-800">
                      {category.code}
                    </td>
                    <td colSpan={6} className="py-2 px-3 font-bold text-emerald-900 tracking-wide">
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {category.targetClasses && category.targetClasses[0] !== 'Semua Kelas' && (
                          <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            Kelas {category.targetClasses.join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Items */}
                  {category.items.map((item, idx) => {
                    const record = student.records[item.id] || {
                      tanggal: '',
                      penguji: '',
                      keterangan: '',
                    };
                    const isPassed = record.keterangan === 'Lulus';
                    const isExcluded = Boolean(record.excludeFromPrint);
                    const itemTargets = (item.targetClasses || []).filter(
                      (c) => c && c.toLowerCase() !== 'semua kelas'
                    );

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isExcluded
                            ? 'opacity-60 bg-slate-50/50'
                            : isPassed
                            ? 'bg-emerald-50/20'
                            : ''
                        }`}
                      >
                        {/* Number */}
                        <td className="py-2.5 px-3 text-center text-xs font-semibold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Hafalan Name & Target Badge */}
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{item.nama}</span>
                            {itemTargets.length > 0 && (
                              <span
                                className="text-[10px] bg-slate-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-slate-200"
                                title={`Materi ini berlaku untuk Kelas: ${itemTargets.join(', ')}`}
                              >
                                {itemTargets.join(', ')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 1-Click Lulus Toggle Button */}
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggleItemLulus(item.id)}
                            className={`w-full inline-flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isPassed
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 border border-slate-200'
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Lulus</span>
                              </>
                            ) : (
                              <span>Belum</span>
                            )}
                          </button>
                        </td>

                        {/* Tanggal Input */}
                        <td className="py-2 px-1.5 text-center">
                          <input
                            type="text"
                            value={record.tanggal || ''}
                            onChange={(e) => onUpdateRecord(item.id, 'tanggal', e.target.value)}
                            placeholder="e.g. 1"
                            className="w-full text-center text-xs px-2 py-1 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* Penguji Dropdown Select */}
                        <td className="py-2 px-1.5 text-center">
                          <select
                            value={record.penguji || ''}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                onOpenExaminerManager();
                              } else {
                                onUpdateRecord(item.id, 'penguji', e.target.value);
                              }
                            }}
                            className="w-full text-center text-xs px-1.5 py-1 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:outline-none cursor-pointer truncate"
                            title={record.penguji || 'Pilih nama penguji'}
                          >
                            <option value="">- Penguji -</option>
                            {examiners.map((ex) => (
                              <option key={ex} value={ex}>
                                {ex}
                              </option>
                            ))}
                            {record.penguji && !examiners.includes(record.penguji) && (
                              <option value={record.penguji}>{record.penguji}</option>
                            )}
                            <option value="__add_new__" className="text-emerald-700 font-bold">
                              + Tambah Penguji...
                            </option>
                          </select>
                        </td>

                        {/* Keterangan Select */}
                        <td className="py-2 px-1.5 text-center">
                          <select
                            value={record.keterangan || ''}
                            onChange={(e) => onUpdateRecord(item.id, 'keterangan', e.target.value)}
                            className={`w-full text-xs px-2 py-1 rounded-md font-semibold border focus:outline-none ${
                              record.keterangan === 'Lulus'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : record.keterangan === 'Belum Lulus'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="Belum Lulus">Belum Lulus</option>
                            <option value="Lulus">Lulus</option>
                            <option value="Mengulang">Mengulang</option>
                            <option value="Mutqin">Mutqin</option>
                          </select>
                        </td>

                        {/* Cetak di Kartu Toggle Checkbox */}
                        <td className="py-2 px-2 text-center">
                          <label
                            className="inline-flex items-center justify-center p-1 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                            title={
                              isExcluded
                                ? 'Hafalan ini TIDAK dicetak di rapor'
                                : 'Hafalan ini AKAN dicetak di rapor (Lulus / Belum Lulus)'
                            }
                          >
                            <input
                              type="checkbox"
                              checked={!isExcluded}
                              onChange={(e) => {
                                onToggleExcludeFromPrint?.(item.id, !e.target.checked);
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                            />
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Helpful bottom guide */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              Kolom <strong>Cetak?</strong> menentukan hafalan yang dimunculkan di rapor (baik yang statusnya <strong>Lulus</strong> maupun <strong>Belum Lulus</strong>).
            </span>
          </span>
          <button
            type="button"
            onClick={onOpenExaminerManager}
            className="text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 cursor-pointer flex items-center gap-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Daftar Penguji</span>
          </button>
        </div>

        <button
          onClick={onOpenMateriManager}
          className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 cursor-pointer"
        >
          Atur Target Kelas Hafalan →
        </button>
      </div>
    </div>
  );
};
