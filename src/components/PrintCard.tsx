import React from 'react';
import { HafalanCategory, SchoolConfig, Student } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface PrintCardProps {
  student: Student;
  categories: HafalanCategory[];
  config: SchoolConfig;
  className?: string;
  isPrinting?: boolean;
}

export const PrintCard: React.FC<PrintCardProps> = ({
  student,
  categories,
  config,
  className = '',
  isPrinting = false,
}) => {
  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white">
        Data siswa tidak ditemukan
      </div>
    );
  }

  const records = student.records || {};
  return (
    <div
      className={`print-card bg-white text-black font-sans box-border mx-auto relative ${className}`}
      style={{
        width: '210mm',
        minHeight: isPrinting ? 'auto' : '297mm',
        padding: '14mm 16mm 12mm 16mm',
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
          {categories.map((category) => (
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
                      {record.tanggal || ''}
                    </td>
                    <td
                      className="text-center py-0.5 text-black font-normal lowercase"
                      style={{
                        border: '1px solid #5993de',
                      }}
                    >
                      {record.penguji || ''}
                    </td>
                    <td
                      className="text-center py-0.5 text-black font-semibold"
                      style={{
                        border: '1px solid #5993de',
                      }}
                    >
                      {record.keterangan || ''}
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* SIGNATURE SECTION */}
      <div className="mt-6 text-[10pt] text-black">
        {/* City & Date on the right side */}
        <div className="flex justify-end mb-2">
          <div className="w-72 text-left">
            <span>{config.city}, {config.date}</span>
          </div>
        </div>

        {/* Two Signature Columns */}
        <div className="flex justify-between items-start">
          {/* Left: Orang Tua / Wali Murid */}
          <div className="w-64 text-left">
            <p className="font-normal">Mengetahui,</p>
            <p className="font-normal mb-16">{config.parentTitle}</p>
            <p className="font-normal">
              {config.parentName ? `( ${config.parentName} )` : '( .................................... )'}
            </p>
          </div>

          {/* Right: Guru Kelas / Penguji */}
          <div className="w-72 text-left">
            <p className="font-normal">&nbsp;</p>
            <p className="font-normal mb-16">{config.examinerTitle}</p>
            <p className="font-bold">
              ( {config.examinerName} )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
