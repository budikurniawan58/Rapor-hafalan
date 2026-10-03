import React from 'react';
import { HafalanCategory, PrintFilterMode, SchoolConfig, Student, UserAccount } from '../types';
import { SchoolLogo } from './SchoolLogo';
import { filterCategoriesForStudent, findWaliKelasForStudent } from '../utils/hafalanFilter';

interface PrintCardProps {
  student: Student;
  categories: HafalanCategory[];
  config: SchoolConfig;
  users?: UserAccount[];
  className?: string;
  isPrinting?: boolean;
  printFilterMode?: PrintFilterMode;
}

export const PrintCard: React.FC<PrintCardProps> = ({
  student,
  categories,
  config,
  users,
  className = '',
  isPrinting = false,
  printFilterMode,
}) => {
  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white">
        Data siswa tidak ditemukan
      </div>
    );
  }

  const records = student.records || {};
  const activeFilterMode = printFilterMode || config.printFilterMode || 'class';
  const displayCategories = filterCategoriesForStudent(categories, student, activeFilterMode);

  return (
    <div
      className={`print-card bg-white text-black font-sans box-border mx-auto relative ${className}`}
      style={{
        width: '215.9mm',
        minHeight: isPrinting ? 'auto' : '355.6mm',
        padding: '14mm 16mm 14mm 16mm',
      }}
    >
      {/* HEADER SECTION */}
      <div className="text-center mb-2">
        <h1 className="text-[14.5pt] font-extrabold tracking-wide uppercase leading-tight text-black">
          {config.title || 'LAPORAN KARTU HAFALAN SISWA'}
        </h1>
        <h2 className="text-[14.5pt] font-extrabold tracking-wide uppercase leading-tight text-black mt-0.5">
          {config.schoolName || 'MADRASAH IBTIDAIYAH RAUDLATUL HIKMAH'}
        </h2>
        <h3 className="text-[13pt] font-extrabold tracking-wide uppercase leading-tight text-black mt-0.5">
          TAHUN PELAJARAN {student.tahunPelajaran || config.academicYear || '2026/2027'}
        </h3>

        {/* LOGO */}
        <div className="flex justify-center items-center my-3">
          <SchoolLogo
            customLogoUrl={config.customLogoUrl}
            size={72}
            className="w-[72px] h-[72px] object-contain drop-shadow-xs"
          />
        </div>
      </div>

      {/* STUDENT & CLASS INFO (TWO COLUMNS MATCHING PDF) */}
      <div className="flex justify-between items-start text-[10pt] font-bold text-black mb-3 px-1">
        {/* Left Column */}
        <div className="space-y-0.5">
          <div className="flex">
            <span className="w-28 uppercase font-bold">NAMA SISWA</span>
            <span className="mr-2">:</span>
            <span className="uppercase font-bold tracking-wide">{student.name || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-28 uppercase font-bold">NIS / NISN</span>
            <span className="mr-2">:</span>
            <span className="font-bold tracking-wide">
              {student.nis && student.nisn
                ? `${student.nis} / ${student.nisn}`
                : student.nis || student.nisn || '-'}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-0.5 text-left">
          <div className="flex">
            <span className="w-36 uppercase font-bold">KELAS</span>
            <span className="mr-2">:</span>
            <span className="font-bold">{student.kelas || '-'}</span>
          </div>
          <div className="flex">
            <span className="w-36 uppercase font-bold">TAHUN PELAJARAN</span>
            <span className="mr-2">:</span>
            <span className="font-bold">{student.tahunPelajaran || config.academicYear}</span>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <table
        className="w-full border-collapse text-[9.5pt] border-2"
        style={{
          borderColor: '#4a86d4',
          pageBreakInside: 'avoid',
        }}
      >
        <thead>
          {/* Header Row 1 */}
          <tr style={{ backgroundColor: '#c2e399' }}>
            <th
              rowSpan={2}
              className="text-center font-bold px-1.5 py-1 uppercase text-black"
              style={{
                width: '42px',
                border: '1px solid #5993de',
              }}
            >
              NO
            </th>
            <th
              rowSpan={2}
              className="text-center font-bold px-3 py-1 uppercase text-black"
              style={{
                border: '1px solid #5993de',
              }}
            >
              MATERI HAFALAN
            </th>
            <th
              colSpan={3}
              className="text-center font-bold px-2 py-1 uppercase text-black"
              style={{
                border: '1px solid #5993de',
              }}
            >
              LULUS UJIAN
            </th>
          </tr>
          {/* Header Row 2 */}
          <tr style={{ backgroundColor: '#c2e399' }}>
            <th
              className="text-center font-bold px-2 py-1 uppercase text-black"
              style={{
                width: '110px',
                border: '1px solid #5993de',
              }}
            >
              TANGGAL
            </th>
            <th
              className="text-center font-bold px-2 py-1 uppercase text-black"
              style={{
                width: '85px',
                border: '1px solid #5993de',
              }}
            >
              PENGUJI
            </th>
            <th
              className="text-center font-bold px-2 py-1 uppercase text-black"
              style={{
                width: '95px',
                border: '1px solid #5993de',
              }}
            >
              KETERANGAN
            </th>
          </tr>
        </thead>
        <tbody>
          {displayCategories.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-8 text-black font-medium"
                style={{ border: '1px solid #5993de' }}
              >
                Tidak ada materi hafalan untuk Kelas {student.kelas || '-'}.
                <div className="text-[8.5pt] text-slate-600 mt-1">
                  (Anda dapat mengatur target kelas hafalan melalui menu Atur Materi & Kategori)
                </div>
              </td>
            </tr>
          ) : (
            displayCategories.map((category) => (
              <React.Fragment key={category.id}>
                {/* Category Header Row */}
                <tr style={{ backgroundColor: '#c2e399' }}>
                  <td
                    className="text-center font-bold py-0.5 text-black"
                    style={{
                      border: '1px solid #5993de',
                    }}
                  >
                    {category.code}
                  </td>
                  <td
                    className="font-bold px-2 py-0.5 text-left uppercase text-black"
                    style={{
                      border: '1px solid #5993de',
                    }}
                  >
                    {category.name}
                  </td>
                  {/* Empty cells with same light green background matching the PDF */}
                  <td style={{ border: '1px solid #5993de' }}>&nbsp;</td>
                  <td style={{ border: '1px solid #5993de' }}>&nbsp;</td>
                  <td style={{ border: '1px solid #5993de' }}>&nbsp;</td>
                </tr>

                {/* Items in Category */}
                {category.items.map((item, itemIdx) => {
                  const record = records[item.id] || {
                    tanggal: '',
                    penguji: '',
                    keterangan: '',
                  };

                  const isLulus = (record.keterangan || '').trim().toLowerCase() === 'lulus';
                  const displayKeterangan = record.keterangan?.trim() || 'Belum Lulus';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td
                        className="text-center font-semibold py-0.5 text-black"
                        style={{
                          border: '1px solid #5993de',
                        }}
                      >
                        {itemIdx + 1}
                      </td>
                      <td
                        className="px-2 py-0.5 text-left text-black font-medium"
                        style={{
                          border: '1px solid #5993de',
                        }}
                      >
                        {item.nama}
                      </td>
                      <td
                        className="text-center py-0.5 text-black font-normal"
                        style={{
                          border: '1px solid #5993de',
                        }}
                      >
                        {record.tanggal ? record.tanggal : '-'}
                      </td>
                      <td
                        className="text-center py-0.5 text-black font-normal"
                        style={{
                          border: '1px solid #5993de',
                        }}
                      >
                        {record.penguji ? record.penguji : '-'}
                      </td>
                      <td
                        className="text-center py-0.5 font-bold"
                        style={{
                          border: '1px solid #5993de',
                          color: isLulus ? '#047857' : '#c2410c',
                        }}
                      >
                        {displayKeterangan}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {/* SIGNATURE SECTION */}
      {(() => {
        // Resolve matching wali kelas for student.kelas accurately
        const resolvedWali = findWaliKelasForStudent(
          student.kelas,
          config.waliKelasPerClass,
          users,
          config.examinerName || 'Fikra Abdillah Zaenal, S.S., S.Pd.',
          config.examinerNip || ''
        );
        const waliName = resolvedWali.name;
        const waliNip = resolvedWali.nip || '';

        // Dynamic title: "Wali Kelas 1.1," or fallback
        const cleanClass = student.kelas ? student.kelas.replace(/^kelas\s+/i, '').trim() : '';
        const waliTitle = cleanClass
          ? `Wali Kelas ${cleanClass},`
          : (config.examinerTitle || 'Wali Kelas,');

        return (
          <div className="mt-6 text-[10pt] text-black">
            {/* City & Date on the right side */}
            <div className="flex justify-end mb-2">
              <div className="w-72 text-left">
                <span>{config.city}, {config.date}</span>
              </div>
            </div>

            {/* Two Signature Columns */}
            <div className="flex justify-between items-start">
              {/* Left: Orang Tua / Wali Siswa */}
              <div className="w-64 text-left">
                <p className="font-normal">Mengetahui,</p>
                <p className="font-normal mb-16">{config.parentTitle || 'Orang Tua / Wali Siswa,'}</p>
                <p className="font-normal">
                  {config.parentName ? `( ${config.parentName} )` : '( .................................... )'}
                </p>
              </div>

              {/* Right: Wali Kelas (User Request: Tanda tangan wali kelas dengan penulisan huruf besar dan kecil terutama gelar) */}
              <div className="w-72 text-left">
                <p className="font-normal">&nbsp;</p>
                <p className="font-normal mb-16">{waliTitle}</p>
                <p className="font-bold underline" style={{ textTransform: 'none' }}>
                  ( {waliName} )
                </p>
                {waliNip && (
                  <p className="text-[9pt] mt-0.5 font-normal" style={{ textTransform: 'none' }}>
                    NIP. {waliNip}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
