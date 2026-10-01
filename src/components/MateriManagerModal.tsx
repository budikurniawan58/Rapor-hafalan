import React, { useState } from 'react';
import { Plus, Trash2, Edit2, RotateCcw, X, FolderPlus } from 'lucide-react';
import { HafalanCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/defaultData';

interface MateriManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: HafalanCategory[];
  onSaveCategories: (categories: HafalanCategory[]) => void;
}

export const MateriManagerModal: React.FC<MateriManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [localCategories, setLocalCategories] = useState<HafalanCategory[]>(categories);
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newItemNameByCat, setNewItemNameByCat] = useState<Record<string, string>>({});

  // Sync when opened
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategories(JSON.parse(JSON.stringify(categories)));
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleAddItem = (catId: string) => {
    const itemName = newItemNameByCat[catId]?.trim();
    if (!itemName) return;

    const updated = localCategories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          items: [
            ...cat.items,
            {
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nama: itemName,
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
        'Kembalikan daftar materi hafalan ke format standar PDF (A: Hafalan Umum, B: Doa Sehari-hari, C: Shalat, D: Juz Amma, E: Hadits, F: Hadits/Ayat Kursi)?'
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kelola Kategori & Materi Hafalan</h2>
            <p className="text-xs text-slate-500">Sesuaikan butir-butir hafalan yang diujikan pada kartu</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Tambah Kategori Baru
            </button>

            <button
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Format Bawaan PDF
            </button>
          </div>

          {/* Form add category */}
          {isAddingCategory && (
            <form
              onSubmit={handleAddCategory}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-xs"
            >
              <div className="font-bold text-emerald-950">Tambah Kategori Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Kode (A, B, C..)</label>
                  <input
                    type="text"
                    placeholder="G"
                    value={newCatCode}
                    onChange={(e) => setNewCatCode(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-bold uppercase"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-600 mb-1">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TAHFIDZ JUZ 30 / ASMAUL HUSNA"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-semibold uppercase"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-700 text-white font-medium rounded hover:bg-emerald-800"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {localCategories.map((category) => (
              <div
                key={category.id}
                className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
              >
                {/* Category Header */}
                <div className="bg-emerald-50 px-4 py-2.5 flex items-center justify-between border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
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
                      className="font-bold text-emerald-950 text-sm bg-transparent border-b border-transparent hover:border-emerald-400 focus:border-emerald-600 focus:bg-white px-1 py-0.5 rounded focus:outline-none uppercase"
                    />
                    <span className="text-xs text-emerald-700 font-medium">
                      ({category.items.length} butir)
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Items in this Category */}
                <div className="p-3 space-y-2 bg-white">
                  {category.items.length === 0 ? (
                    <div className="text-xs text-slate-400 py-2 text-center italic">
                      Belum ada materi hafalan di kategori ini
                    </div>
                  ) : (
                    category.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 group"
                      >
                        <span className="w-5 text-center text-xs font-semibold text-slate-400">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.nama}
                          onChange={(e) => handleUpdateItem(category.id, item.id, e.target.value)}
                          className="flex-1 text-xs py-1 px-2 border border-slate-200 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleDeleteItem(category.id, item.id)}
                          className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add Item to Category input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                    <input
                      type="text"
                      placeholder={`+ Tambah hafalan ke ${category.name}...`}
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
                      className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(category.id)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAndApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
          >
            Terapkan & Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
