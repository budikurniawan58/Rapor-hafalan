import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus, Users, X } from 'lucide-react';

interface MultiClassSelectorProps {
  selectedClasses: string[] | undefined;
  availableClasses: string[];
  onChange: (newClasses: string[]) => void;
  onAddNewClassOption?: (newClass: string) => void;
  className?: string;
  size?: 'xs' | 'sm';
}

export const MultiClassSelector: React.FC<MultiClassSelectorProps> = ({
  selectedClasses = ['Semua Kelas'],
  availableClasses,
  onChange,
  onAddNewClassOption,
  className = '',
  size = 'xs',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAddingCustom(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isAll =
    !selectedClasses ||
    selectedClasses.length === 0 ||
    selectedClasses.includes('Semua Kelas');

  const handleToggleClass = (cls: string) => {
    if (cls === 'Semua Kelas') {
      onChange(['Semua Kelas']);
      return;
    }

    // If currently 'Semua Kelas', switch to this single class
    if (isAll) {
      onChange([cls]);
      return;
    }

    if (selectedClasses.includes(cls)) {
      // Remove class
      const next = selectedClasses.filter((c) => c !== cls);
      if (next.length === 0) {
        onChange(['Semua Kelas']);
      } else {
        onChange(next);
      }
    } else {
      // Add class without losing previous classes!
      onChange([...selectedClasses, cls]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    if (onAddNewClassOption) {
      onAddNewClassOption(clean);
    }

    // Automatically check the newly added class
    if (isAll) {
      onChange([clean]);
    } else if (!selectedClasses.includes(clean)) {
      onChange([...selectedClasses, clean]);
    }

    setCustomInput('');
    setIsAddingCustom(false);
  };

  // Label representation
  const renderLabel = () => {
    if (isAll) {
      return (
        <span className="font-semibold text-slate-700">Semua Kelas</span>
      );
    }
    if (selectedClasses.length === 1) {
      return (
        <span className="font-bold text-emerald-800">
          Kelas {selectedClasses[0]}
        </span>
      );
    }
    if (selectedClasses.length === 2) {
      return (
        <span className="font-bold text-emerald-800">
          {selectedClasses[0]}, {selectedClasses[1]}
        </span>
      );
    }
    return (
      <span className="font-bold text-emerald-800">
        {selectedClasses.slice(0, 2).join(', ')} +{selectedClasses.length - 2}
      </span>
    );
  };

  // Unique list of options (excluding 'Semua Kelas')
  const specificOptions = Array.from(
    new Set(
      availableClasses.filter(
        (c) => c && c.trim() && c.toLowerCase() !== 'semua kelas'
      )
    )
  );

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer ${
          size === 'xs' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        } ${
          isAll
            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
        }`}
        title={
          isAll
            ? 'Materi ini berlaku untuk Semua Kelas'
            : `Materi berlaku untuk Kelas: ${selectedClasses.join(', ')}`
        }
      >
        <Users className="w-3 h-3 text-emerald-700 opacity-80" />
        {renderLabel()}
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pilih Target Kelas
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              Bisa &gt;1 Kelas
            </span>
          </div>

          <div className="max-h-52 overflow-y-auto px-1 space-y-0.5">
            {/* 'Semua Kelas' Option */}
            <button
              type="button"
              onClick={() => handleToggleClass('Semua Kelas')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isAll
                  ? 'bg-emerald-50 text-emerald-900'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Semua Kelas</span>
              {isAll && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
            </button>

            {/* Individual Class Options */}
            {specificOptions.map((cls) => {
              const isChecked = !isAll && selectedClasses.includes(cls);

              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleToggleClass(cls)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>Kelas {cls}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add custom class input */}
          <div className="pt-2 mt-1 border-t border-slate-100 px-2">
            {isAddingCustom ? (
              <form onSubmit={handleAddCustom} className="space-y-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="Contoh: 2.2 atau 4.1"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none font-semibold"
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustom(false);
                      setCustomInput('');
                    }}
                    className="px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-2 py-0.5 text-[10px] bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800"
                  >
                    + Tambahkan
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="w-full text-left px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kelas Baru...</span>
              </button>
            )}
          </div>

          {/* Footer with done button */}
          <div className="px-2 pt-2 mt-1 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              {isAll ? 'Semua kelas aktif' : `${selectedClasses.length} kelas dipilih`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
