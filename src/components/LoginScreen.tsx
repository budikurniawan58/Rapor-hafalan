import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { UserAccount } from '../types';

interface LoginScreenProps {
  users: UserAccount[];
  customLogoUrl: string | null;
  onLogin: (user: UserAccount) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  customLogoUrl,
  onLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError('Silakan isi nama pengguna (username) dan kata sandi.');
      return;
    }

    const foundUser = users.find(
      (u) =>
        u.username.trim().toLowerCase() === cleanUsername &&
        u.password.trim() === cleanPassword
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Nama pengguna atau kata sandi tidak cocok. Silakan periksa kembali.');
    }
  };

  const handleQuickLogin = (u: UserAccount) => {
    setUsername(u.username);
    setPassword(u.password);
    onLogin(u);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-800/40">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 sm:p-8 text-center text-white relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 p-2 flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <SchoolLogo customLogoUrl={customLogoUrl} size={50} />
          </div>
          <h1 className="font-extrabold text-base sm:text-lg tracking-wide uppercase">
            MI RAUDLATUL HIKMAH
          </h1>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Sistem Informasi Kartu Hafalan Siswa & Rapor
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-[11px] text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Akses Terlindungi & Terenkripsi</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: admin atau wali2.1"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kata Sandi (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Aplikasi</span>
            </button>
          </form>

          {/* Collapsible Default Accounts Info */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAccountsGuide(!showAccountsGuide)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bantuan Akun Awal Masuk (Klik di sini)</span>
              </span>
              {showAccountsGuide ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAccountsGuide && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5 animate-in fade-in">
                <div className="text-[11px] text-slate-500 font-medium">
                  Klik salah satu akun di bawah ini untuk langsung mengisi formulir:
                </div>
                <div className="space-y-1.5">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleQuickLogin(u)}
                      className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-[11px]">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Username: <strong className="text-emerald-800">{u.username}</strong> | Pass: <span className="text-slate-700">{u.password}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : `Wali ${u.assignedKelas}`}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Admin dapat menambah, mengubah password, atau menghapus akun guru di dalam menu setelah login.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          MI Raudlatul Hikmah &copy; {new Date().getFullYear()} · Dilengkapi Cloud Database
        </div>
      </div>
    </div>
  );
};
