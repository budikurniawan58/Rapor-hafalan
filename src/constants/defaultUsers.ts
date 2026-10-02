import { UserAccount } from '../types';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Madrasah',
    role: 'admin',
    assignedKelas: 'all',
    nip: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_wali_21',
    username: 'wali2.1',
    password: 'wali123',
    name: 'Fikra Abdillah Zaenal, S.S., S.Pd.',
    role: 'walikelas',
    assignedKelas: '2.1',
    nip: '19880415 201201 1 002',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_wali_11',
    username: 'wali1.1',
    password: 'wali123',
    name: 'Ustadzah Rahmawati, S.Pd.I',
    role: 'walikelas',
    assignedKelas: '1.1',
    nip: '19920310 201502 2 001',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_wali_5',
    username: 'wali5',
    password: 'wali123',
    name: 'Ustadz Muhammad Ilham, Lc., M.Ag.',
    role: 'walikelas',
    assignedKelas: '5',
    nip: '19850720 201001 1 003',
    createdAt: new Date().toISOString(),
  },
];
