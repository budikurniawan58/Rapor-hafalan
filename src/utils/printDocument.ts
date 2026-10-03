import { HafalanCategory, SchoolConfig, Student, UserAccount } from '../types';
import { filterCategoriesForStudent, findWaliKelasForStudent } from './hafalanFilter';

/**
 * Generates a clean, standalone, 100% pure white HTML document for printing
 * that works across all browsers, operating systems, and iframe environments.
 */
export function generatePrintableHtml(
  students: Student[],
  categories: HafalanCategory[],
  config: SchoolConfig,
  users: UserAccount[] = []
): string {
  const cardsHtml = students
    .map((student) => {
      const records = student.records || {};
      const displayCategories = filterCategoriesForStudent(categories, student, config.printFilterMode || 'class');

      const resolvedWali = findWaliKelasForStudent(
        student.kelas,
        config.waliKelasPerClass,
        users,
        config.examinerName || 'Fikra Abdillah Zaenal, S.S., S.Pd.',
        config.examinerNip || ''
      );
      const waliName = resolvedWali.name;
      const waliNip = resolvedWali.nip || '';
      const cleanClass = student.kelas ? student.kelas.replace(/^kelas\s+/i, '').trim() : '';
      const waliTitle = cleanClass ? `Wali Kelas ${cleanClass},` : (config.examinerTitle || 'Wali Kelas,');

      const logoHtml = config.customLogoUrl
        ? `<img src="${config.customLogoUrl}" alt="Logo" style="width:72px;height:72px;object-fit:contain;" />`
        : `<svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,4 93,25 93,75 50,96 7,75 7,25" fill="#047857" stroke="#065f46" stroke-width="2"/>
            <polygon points="50,10 87,28 87,72 50,90 13,72 13,28" fill="#059669"/>
            <circle cx="50" cy="50" r="30" fill="#ffffff"/>
            <path d="M50 32 L36 43 L36 60 L64 60 L64 43 Z" fill="#047857"/>
            <path d="M50 28 L30 42 L34 45 L50 33 L66 45 L70 42 Z" fill="#065f46"/>
          </svg>`;

      const rowsHtml =
        displayCategories.length === 0
          ? `<tr>
              <td colspan="5" style="text-align:center;padding:24px;border:1px solid #5993de;color:#000;">
                Tidak ada materi hafalan untuk Kelas ${student.kelas || '-'}.
              </td>
            </tr>`
          : displayCategories
              .map((category) => {
                const headerRow = `
                  <tr style="background-color:#c2e399;">
                    <td style="text-align:center;font-weight:bold;padding:2px 4px;border:1px solid #5993de;color:#000;">
                      ${category.code}
                    </td>
                    <td colspan="4" style="font-weight:bold;padding:2px 8px;border:1px solid #5993de;color:#000;letter-spacing:0.5px;">
                      ${category.name.toUpperCase()}
                    </td>
                  </tr>
                `;

                const itemRows = category.items
                  .map((item, itemIdx) => {
                    const record = records[item.id] || { tanggal: '', penguji: '', keterangan: '' };
                    const isLulus = (record.keterangan || '').trim().toLowerCase() === 'lulus';
                    const displayKeterangan = record.keterangan
                      ? record.keterangan
                      : record.tanggal
                      ? 'Lulus'
                      : '-';

                    return `
                      <tr>
                        <td style="text-align:center;padding:2px 4px;border:1px solid #5993de;color:#000;">
                          ${itemIdx + 1}
                        </td>
                        <td style="padding:2px 8px;border:1px solid #5993de;color:#000;">
                          ${item.nama}
                        </td>
                        <td style="text-align:center;padding:2px 4px;border:1px solid #5993de;color:#000;">
                          ${record.tanggal || '-'}
                        </td>
                        <td style="text-align:center;padding:2px 4px;border:1px solid #5993de;color:#000;">
                          ${record.penguji || '-'}
                        </td>
                        <td style="text-align:center;padding:2px 4px;border:1px solid #5993de;font-weight:bold;color:${
                          isLulus ? '#047857' : '#c2410c'
                        };">
                          ${displayKeterangan}
                        </td>
                      </tr>
                    `;
                  })
                  .join('');

                return headerRow + itemRows;
              })
              .join('');

      return `
        <div class="print-card-page">
          <!-- HEADER -->
          <div style="text-align:center;margin-bottom:8px;">
            <h1 style="font-size:14.5pt;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;margin:0;line-height:1.2;color:#000;">
              ${config.title || 'LAPORAN KARTU HAFALAN SISWA'}
            </h1>
            <h2 style="font-size:14.5pt;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;margin:2px 0 0 0;line-height:1.2;color:#000;">
              ${config.schoolName || 'MADRASAH IBTIDAIYAH RAUDLATUL HIKMAH'}
            </h2>
            <h3 style="font-size:13pt;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;margin:2px 0 0 0;line-height:1.2;color:#000;">
              TAHUN PELAJARAN ${student.tahunPelajaran || config.academicYear || '2026/2027'}
            </h3>

            <div style="display:flex;justify-content:center;align-items:center;margin:10px 0;">
              ${logoHtml}
            </div>
          </div>

          <!-- STUDENT INFO -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:10pt;font-weight:bold;color:#000;margin-bottom:12px;">
            <div style="line-height:1.4;">
              <div>NAMA SISWA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span style="text-transform:uppercase;">${student.name || '-'}</span></div>
              <div>NIS / NISN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${student.nis && student.nisn ? `${student.nis} / ${student.nisn}` : student.nis || student.nisn || '-'}</div>
            </div>
            <div style="line-height:1.4;text-align:left;">
              <div>KELAS &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${student.kelas || '-'}</div>
              <div>TAHUN PELAJARAN : ${student.tahunPelajaran || config.academicYear}</div>
            </div>
          </div>

          <!-- TABLE -->
          <table style="width:100%;border-collapse:collapse;font-size:9.5pt;border:2px solid #4a86d4;">
            <thead>
              <tr style="background-color:#c2e399;">
                <th rowspan="2" style="width:42px;text-align:center;font-weight:bold;padding:4px;border:1px solid #5993de;color:#000;">NO</th>
                <th rowspan="2" style="text-align:center;font-weight:bold;padding:4px 8px;border:1px solid #5993de;color:#000;">MATERI HAFALAN</th>
                <th colspan="3" style="text-align:center;font-weight:bold;padding:4px;border:1px solid #5993de;color:#000;">LULUS UJIAN</th>
              </tr>
              <tr style="background-color:#c2e399;">
                <th style="width:110px;text-align:center;font-weight:bold;padding:4px;border:1px solid #5993de;color:#000;">TANGGAL</th>
                <th style="width:85px;text-align:center;font-weight:bold;padding:4px;border:1px solid #5993de;color:#000;">PENGUJI</th>
                <th style="width:95px;text-align:center;font-weight:bold;padding:4px;border:1px solid #5993de;color:#000;">KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <!-- SIGNATURE -->
          <div style="margin-top:24px;font-size:10pt;color:#000;">
            <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
              <div style="width:280px;text-align:left;">
                <span>${config.city}, ${config.date}</span>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div style="width:260px;text-align:left;">
                <p style="margin:0;">Mengetahui,</p>
                <p style="margin:0 0 64px 0;">${config.parentTitle || 'Orang Tua / Wali Siswa,'}</p>
                <p style="margin:0;">${config.parentName ? `( ${config.parentName} )` : '( .................................... )'}</p>
              </div>

              <div style="width:280px;text-align:left;">
                <p style="margin:0;">&nbsp;</p>
                <p style="margin:0 0 64px 0;">${waliTitle}</p>
                <p style="margin:0;font-weight:bold;text-decoration:underline;">( ${waliName} )</p>
                ${waliNip ? `<p style="margin:2px 0 0 0;font-size:9pt;">NIP. ${waliNip}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kartu Hafalan Siswa - ${config.schoolName}</title>
  <style>
    @page {
      size: legal portrait;
      margin: 10mm 12mm 10mm 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #000000;
    }

    .print-card-page {
      background-color: #ffffff !important;
      background: #ffffff !important;
      width: 100%;
      max-width: 215.9mm;
      min-height: 350mm;
      margin: 0 auto;
      padding: 10mm 14mm 10mm 14mm;
      page-break-after: always;
      break-after: page;
    }

    .print-card-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #047857;
      color: #ffffff;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .no-print-btn {
      background: #facc15;
      color: #022c22;
      border: none;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      .print-card-page {
        padding: 4mm 0 !important;
        min-height: auto !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>📄 Dokumen Kartu Hafalan Siap Cetak (Kertas Legal)</span>
    <button class="no-print-btn" onclick="window.print()">🖨️ Cetak Halaman Ini (Ctrl + P)</button>
  </div>
  ${cardsHtml}
  <script>
    // Auto trigger print when loaded
    window.addEventListener('load', function() {
      setTimeout(function() {
        try { window.print(); } catch (e) {}
      }, 350);
    });
  </script>
</body>
</html>`;
}

/**
 * Downloads the printable document directly to user's computer as a clean HTML file
 * that can be printed or converted to PDF without any iframe or sandbox issues.
 */
export function downloadPrintableHtml(
  students: Student[],
  categories: HafalanCategory[],
  config: SchoolConfig,
  users: UserAccount[] = []
): void {
  const htmlContent = generatePrintableHtml(students, categories, config, users);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename =
    students.length === 1
      ? `Kartu_Hafalan_${(students[0].name || 'Siswa').replace(/\s+/g, '_')}.html`
      : `Kartu_Hafalan_Massal_${students.length}_Siswa.html`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
