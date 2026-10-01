import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  RotateCcw,
  X,
  FolderPlus,
  Filter,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { HafalanCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaultData';
import { isApplicableToClass } from '../utils/hafalanFilter';

interface MateriManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: HafalanCategory[];
  availableClasses?: string[];
  activeStudentClass?: string;
  onSaveCategories: (categories: HafalanCategory[]) => void;
}

export const MateriManagerModal: React.FC<MateriManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  availableClasses = ['2.1', '1.1'],
  activeStudentClass,
  onSaveCategories,
}) => {
  const [localCategories, setLocalCategories] = useState<HafalanCategory[]>(categories);
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatClass, setNewCatClass] = useState('Semua Kelas');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newItemNameByCat, setNewItemNameByCat] = useState<Record<string, string>>({});
  const [newItemClassByCat, setNewItemClassByCat] = useState<Record<string, string>>({});

  // Class filter inside the manager modal: 'all', or a specific class like '2.1'
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Sync when opened
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategories(JSON.parse(JSON.stringify(categories)));
      if (activeStudentClass) {
        setSelectedClassFilter('all'); // Show all by default so user sees everything, or can filter
      }
    }
  }, [isOpen, categories, activeStudentClass]);

  if (!isOpen) return null;

  // Combine unique classes for selection
  const allClassOptions = Array.from(
    new Set(['Semua Kelas', ...availableClasses, '1.1', '2.1', '3.1'])
  );

  const handleAddItem = (catId: string) => {
    const itemName = newItemNameByCat[catId]?.trim();
    if (!itemName) return;

    const targetClass = newItemClassByCat[catId] || (selectedClassFilter !== 'all' ? selectedClassFilter : 'Semua Kelas');

    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nama: itemName,
              targetClasses: targetClass === 'Semua Kelas' ? ['Semua Kelas'] : [targetClass],
            },
          ],
        };
      }
      return cat;
    });

    setLocalCategories(updated);
    setNewItemNameByCat((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      }
      return cat;
    });
    setLocalCategories(updated);
  };

  const handleUpdateItem = (catId: string, itemId: string, newName: string) => {
    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, nama: newName } : item
          ),
        };
      }
      return cat;
    });
    setLocalCategories(updated);
  };

  const handleUpdateItemClass = (catId: string, itemId: string, targetClass: string) => {
    let finalClass = targetClass;
    if (targetClass === '__custom__') {
      const custom = window.prompt('Masukkan nama kelas baru (contoh: 3.2 atau 4.1):');
      if (!custom || !custom.trim()) return;
      finalClass = custom.trim();
    }

    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                targetClasses: finalClass === 'Semua Kelas' ? ['Semua Kelas'] : [finalClass],
              };
            }
            return item;
          }),
        };
      }
      return cat;
    });
    setLocalCategories(updated);
  };

  const handleUpdateCategoryClass = (catId: string, targetClass: string) => {
    let finalClass = targetClass;
    if (targetClass === '__custom__') {
      const custom = window.prompt('Masukkan nama kelas baru (contoh: 3.2 atau 4.1):');
      if (!custom || !custom.trim()) return;
      finalClass = custom.trim();
    }

    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          targetClasses: finalClass === 'Semua Kelas' ? ['Semua Kelas'] : [finalClass],
        };
      }
      return cat;
    });
    setLocalCategories(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const nextCode =
      newCatCode.trim().toUpperCase() ||
      String.fromCharCode(65 + localCategories.length); // Next letter

    const newCat: HafalanCategory = {
      id: `cat_${Date.now()}`,
      code: nextCode,
      name: newCatName.trim().toUpperCase(),
      targetClasses: newCatClass === 'Semua Kelas' ? ['Semua Kelas'] : [newCatClass],
      items: [],
    };

    setLocalCategories([...localCategories, newCat]);
    setNewCatName('');
    setNewCatCode('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm('Hapus kategori ini beserta seluruh hafalan di dalamnya?')) {
      setLocalCategories(localCategories.filter((c) => c.id !== catId));
    }
  };

  const handleResetToDefault = () => {
    if (
      window.confirm(
        'Kembalikan daftar materi hafalan ke format standar bawaan (lengkap dengan pembagian kelas)?'
      )
    ) {
      setLocalCategories(JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)));
    }
  };

  const handleSaveAndApply = () => {
    onSaveCategories(localCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kelola Kategori & Materi Hafalan</h2>
            <p className="text-xs text-slate-500">
              Atur materi hafalan yang berbeda untuk setiap kelas dan yang dicetak pada kartu
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Controls & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            {/* Filter by class selector */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-slate-700">Tampilkan Materi:</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-emerald-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">Semua Materi (Semua Kelas)</option>
                {allClassOptions
                  .filter((c) => c !== 'Semua Kelas')
                  .map((cls) => (
                    <option key={cls} value={cls}>
                      Khusus Kelas {cls}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingCategory(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>

              <button
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Reset materi ke default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar</span>
              </button>
            </div>
          </div>

          {/* Form add category */}
          {isAddingCategory && (
            <form
              onSubmit={handleAddCategory}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-xs animate-in fade-in"
            >
              <div className="font-bold text-emerald-950 flex items-center justify-between">
                <span>Tambah Kategori Baru</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1 font-bold">Kode (A, B, C..)</label>
                  <input
                    type="text"
                    placeholder="G"
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold uppercase focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-slate-600 mb-1 font-bold">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TAHFIDZ JUZ 30 / ASMAUL HUSNA"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold uppercase focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-slate-600 mb-1 font-bold">Berlaku Untuk Kelas</label>
                  <select
                    value={newCatClass}
                    onChange={(e) => setNewCatClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none cursor-pointer"
                  >
                    {allClassOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls === 'Semua Kelas' ? 'Semua Kelas' : `Kelas ${cls}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {localCategories.map((category) => {
              // If filtering by class, check if category or any of its items matches
              const categoryMatch =
                selectedClassFilter === 'all' ||
                isApplicableToClass(category.targetClasses, selectedClassFilter);

              const visibleItems = category.items.filter((item) => {
                if (selectedClassFilter === 'all') return true;
                return isApplicableToClass(item.targetClasses, selectedClassFilter);
              });

              if (!categoryMatch && visibleItems.length === 0) {
                return null;
              }

              const catTargetClass = category.targetClasses?.[0] || 'Semua Kelas';

              return (
                <div
                  key={category.id}
                  className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                >
                  {/* Category Header */}
                  <div className="bg-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200">
                    <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                      <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {category.code}
                      </span>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => {
                          const updated = localCategories.map((c) =>
                            c.id === category.id ? { ...c, name: e.target.value.toUpperCase() } : c
                          );
                          setLocalCategories(updated);
                        }}
                        className="font-bold text-emerald-950 text-sm bg-transparent border-b border-transparent hover:border-emerald-400 focus:border-emerald-600 focus:bg-white px-2 py-0.5 rounded-lg focus:outline-none uppercase flex-1 max-w-sm"
                      />
                      <span className="text-xs text-emerald-700 font-medium">
                        ({visibleItems.length} butir)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Category target class badge */}
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-1 rounded-lg border border-emerald-200">
                        <span>Target:</span>
                        <select
                          value={catTargetClass}
                          onChange={(e) => handleUpdateCategoryClass(category.id, e.target.value)}
                          className="font-bold text-emerald-800 bg-transparent border-none focus:outline-none cursor-pointer"
                        >
                          {allClassOptions.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls === 'Semua Kelas' ? 'Semua Kelas' : `Kelas ${cls}`}
                            </option>
                          ))}
                          <option value="__custom__">+ Kelas Lain...</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Items in this Category */}
                  <div className="p-3.5 space-y-2 bg-white">
                    {visibleItems.length === 0 ? (
                      <div className="text-xs text-slate-400 py-3 text-center italic">
                        {selectedClassFilter !== 'all'
                          ? `Tidak ada butir hafalan khusus Kelas ${selectedClassFilter} di kategori ini.`
                          : 'Belum ada materi hafalan di kategori ini.'}
                      </div>
                    ) : (
                      visibleItems.map((item, idx) => {
                        const itemClass = item.targetClasses?.[0] || 'Semua Kelas';

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-100 group transition-colors"
                          >
                            <span className="w-6 text-center text-xs font-semibold text-slate-400">
                              {idx + 1}.
                            </span>

                            {/* Item name input */}
                            <input
                              type="text"
                              value={item.nama}
                              onChange={(e) =>
                                handleUpdateItem(category.id, item.id, e.target.value)
                              }
                              className="flex-1 text-xs py-1 px-2.5 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                            />

                            {/* Item Class Selector (Requested Feature: Different hafalan per class) */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <select
                                value={itemClass}
                                onChange={(e) =>
                                  handleUpdateItemClass(category.id, item.id, e.target.value)
                                }
                                className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer focus:outline-none ${
                                  itemClass === 'Semua Kelas'
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                }`}
                                title="Atur materi ini untuk kelas berapa"
                              >
                                {allClassOptions.map((cls) => (
                                  <option key={cls} value={cls}>
                                    {cls === 'Semua Kelas' ? 'Semua Kelas' : `Kelas ${cls}`}
                                  </option>
                                ))}
                                <option value="__custom__">+ Kelas Lain...</option>
                              </select>
                            </div>

                            <button
                              onClick={() => handleDeleteItem(category.id, item.id)}
                              className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus butir hafalan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}

                    {/* Add Item to Category input */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                      <input
                        type="text"
                        placeholder={`+ Tambah butir hafalan baru...`}
                        value={newItemNameByCat[category.id] || ''}
                        onChange={(e) =>
                          setNewItemNameByCat({
                            ...newItemNameByCat,
                            [category.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddItem(category.id);
                          }
                        }}
                        className="flex-1 text-xs py-1.5 px-3 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                      />

                      {/* Class selector for new item */}
                      <select
                        value={
                          newItemClassByCat[category.id] ||
                          (selectedClassFilter !== 'all' ? selectedClassFilter : 'Semua Kelas')
                        }
                        onChange={(e) =>
                          setNewItemClassByCat({
                            ...newItemClassByCat,
                            [category.id]: e.target.value,
                          })
                        }
                        className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none cursor-pointer"
                        title="Pilih kelas untuk materi baru ini"
                      >
                        {allClassOptions.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls === 'Semua Kelas' ? 'Semua Kelas' : `Kelas ${cls}`}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleAddItem(category.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 inline mr-1" />
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Materi yang ditandai dengan kelas tertentu hanya akan muncul pada kartu siswa kelas tersebut.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Perubahan Materi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
