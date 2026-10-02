import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  UserCheck,
  Trash2,
  Edit2,
  KeyRound,
  Check,
  AlertCircle,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  availableClasses: string[];
  currentUser: UserAccount | null;
  onSaveUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  users,
  availableClasses,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('walikelas');
  const [assignedKelas, setAssignedKelas] = useState('2.1');
  const [nip, setNip] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('walikelas');
    setAssignedKelas(availableClasses[0] || '2.1');
    setNip('');
    setEditingUserId(null);
    setIsAddingOrEditing(false);
    setError(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsAddingOrEditing(true);
  };

  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setName(user.name);
    setUsername(user.username);
    setPassword(user.password);
    setRole(user.role);
    setAssignedKelas(user.assignedKelas || '2.1');
    setNip(user.nip || '');
    setIsAddingOrEditing(true);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    const cleanName = name.trim();

    if (!cleanUsername || !cleanPassword || !cleanName) {
      setError('Semua kolom wajib diisi (Nama, Username, Kata Sandi).');
      return;
    }

    // Check duplicate username (except when editing self)
    const duplicate = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.id !== editingUserId
    );
    if (duplicate) {
      setError(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
      return;
    }

    const newUser: UserAccount = {
      id: editingUserId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      role,
      assignedKelas: role === 'admin' ? 'all' : assignedKelas,
      nip: nip.trim(),
      createdAt: editingUserId
        ? users.find((u) => u.id === editingUserId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    onSaveUser(newUser);
    resetForm();
  };

  const handleDelete = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      alert('Tidak dapat menghapus akun admin terakhir.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun "${target.name}" (${target.username})?`)) {
      onDeleteUser(userId);
      if (editingUserId === userId) resetForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                Kelola Akun Guru & Wali Kelas
              </h2>
              <p className="text-[11px] text-emerald-200">
                Buat dan atur hak akses login untuk masing-masing wali kelas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Top Info Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Keamanan Akses Cloud:</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Setiap akun yang Anda buat di sini otomatis tersimpan di Cloud Database. Guru dapat langsung menggunakan username & kata sandi tersebut untuk masuk dari HP atau laptop mereka.
              </p>
            </div>
          </div>

          {/* Quick Edit for Admin / Current Account */}
          {currentUser && !isAddingOrEditing && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-200/80 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center font-bold shadow-xs">
                  <KeyRound className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 flex items-center gap-2">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-extrabold uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-800 mt-0.5">
                    Username: <strong className="font-mono text-purple-950">{currentUser.username}</strong> · Password Saat Ini: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-purple-200 font-semibold">{currentUser.password}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit(currentUser)}
                className="px-3 py-2 bg-purple-800 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs flex-shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Password Admin</span>
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {isAddingOrEditing ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  {editingUserId ? 'Edit Akun Guru' : 'Tambah Akun Wali Kelas Baru'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Guru
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Fikra Abdillah Zaenal, S.S., S.Pd."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIP / NUPTK (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 19880415 201201 1 002"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username Login (Huruf kecil/tanpa spasi)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: wali2.1 atau ustadzah.rahma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-emerald-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kata Sandi (Password)
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Buat kata sandi..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Peran (Role) Akun
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="walikelas">Wali Kelas</option>
                    <option value="admin">Administrator (Akses Penuh)</option>
                  </select>
                </div>

                {role === 'walikelas' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kelas yang Dipegang
                    </label>
                    <input
                      type="text"
                      value={assignedKelas}
                      onChange={(e) => setAssignedKelas(e.target.value)}
                      placeholder="Contoh: 2.1 atau 1.1 atau 5"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-900 focus:border-emerald-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Wali kelas akan otomatis diarahkan ke kelas ini saat login
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingUserId ? 'Simpan Perubahan' : 'Buat Akun'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Akun Terdaftar ({users.length})
              </span>
              <button
                type="button"
                onClick={handleStartAdd}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Akun Wali Kelas</span>
              </button>
            </div>
          )}

          {/* Accounts List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <th className="py-2.5 px-3">Nama & Gelar</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Kata Sandi</th>
                  <th className="py-2.5 px-3 text-center">Peran / Kelas</th>
                  <th className="py-2.5 px-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">{u.name}</div>
                        {u.nip && (
                          <div className="text-[10px] text-slate-400">NIP: {u.nip}</div>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                            (Akun Anda Saat Ini)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-900">
                        {u.username}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {u.password}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'admin'
                            ? 'Admin (Semua Kelas)'
                            : `Wali Kelas ${u.assignedKelas}`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="p-1 text-slate-600 hover:text-emerald-700 rounded hover:bg-slate-200 cursor-pointer"
                            title="Edit Akun"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {(!isCurrent || users.filter((x) => x.role === 'admin').length > 1) && (
                            <button
                              type="button"
                              onClick={() => handleDelete(u.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
