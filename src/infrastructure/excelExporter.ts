import * as XLSX from 'xlsx';
import { EmployeeMonthlySummary, SignerProfile } from '../types';
import { formatIndonesianDate, getDayNameId } from '../domain/calendar';

export function exportRecapToExcel(
  summaries: EmployeeMonthlySummary[],
  dates: string[],
  periodStart: string,
  periodEnd: string,
  signer: SignerProfile
): void {
  const wb = XLSX.utils.book_new();

  // 1. REKAP PER PEGAWAI
  const recapData: (string | number)[][] = [
    ['PEMERINTAH KOTA BITUNG'],
    ['SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH'],
    ['REKAPITULASI PEMOTONGAN TUNJANGAN PENAMBAHAN PENGHASILAN (TPP)'],
    [`Periode: ${formatIndonesianDate(periodStart)} s/d ${formatIndonesianDate(periodEnd)}`],
    [],
    [
      'No',
      'ID Finger',
      'NIP',
      'Nama Pegawai',
      'Gol',
      'Jabatan',
      'Hari Kerja',
      'Hadir',
      'WFH',
      'TL (kali)',
      'TL (%)',
      'PSW (kali)',
      'PSW (%)',
      'TK (kali)',
      'TK (%)',
      'Izin',
      'Sakit',
      'Total Pot. (%)',
      'Pagu TPP (Rp)',
      'Potongan (Rp)',
      'TPP Bersih (Rp)',
    ],
  ];

  summaries.forEach((sum, idx) => {
    const basicTpp = sum.employee.basicTpp || 0;
    const potRupiah = Math.round((basicTpp * sum.totalDeductionPct) / 100);
    const netTpp = basicTpp - potRupiah;

    recapData.push([
      idx + 1,
      sum.employee.fingerId,
      sum.employee.nip || '-',
      sum.employee.name,
      sum.employee.golongan || '-',
      sum.employee.position || 'Staf',
      sum.totalWorkdays,
      sum.presentDays,
      sum.wfhDays || 0,
      sum.lateDays,
      `${sum.lateDeduction.toFixed(2)}%`,
      sum.earlyDays,
      `${sum.earlyDeduction.toFixed(2)}%`,
      sum.absenceDays,
      `${sum.absenceDeduction.toFixed(2)}%`,
      sum.izinDays,
      sum.sakitDays,
      `${sum.totalDeductionPct.toFixed(2)}%`,
      basicTpp,
      potRupiah,
      netTpp,
    ]);
  });

  // Add Signer Block
  recapData.push([]);
  recapData.push([]);
  recapData.push([
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    `${signer.city}, ${formatIndonesianDate(signer.signDate || periodEnd)}`,
  ]);
  recapData.push([
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    signer.title,
  ]);
  recapData.push([]);
  recapData.push([]);
  recapData.push([]);
  recapData.push([
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    signer.name,
  ]);
  recapData.push([
    '', '', '', '', '', '', '', '', '', '', '', '', '',
    `NIP. ${signer.nip}`,
  ]);

  const wsRecap = XLSX.utils.aoa_to_sheet(recapData);
  wsRecap['!cols'] = [
    { wch: 5 },  // No
    { wch: 10 }, // ID
    { wch: 22 }, // NIP
    { wch: 32 }, // Nama
    { wch: 8 },  // Gol
    { wch: 38 }, // Jabatan
    { wch: 11 }, // Hari Kerja
    { wch: 8 },  // Hadir
    { wch: 8 },  // WFH
    { wch: 9 },  // TL jml
    { wch: 9 },  // TL %
    { wch: 10 }, // PSW jml
    { wch: 10 }, // PSW %
    { wch: 9 },  // TK jml
    { wch: 9 },  // TK %
    { wch: 8 },  // Izin
    { wch: 8 },  // Sakit
    { wch: 14 }, // Total %
    { wch: 16 }, // Pagu TPP
    { wch: 16 }, // Potongan Rp
    { wch: 16 }, // TPP Bersih
  ];
  XLSX.utils.book_append_sheet(wb, wsRecap, 'Rekap Per Pegawai');

  // 2. MASTER PEGAWAI
  const masterData: (string | number)[][] = [
    ['ID Finger', 'NIP', 'Nama Pegawai', 'Golongan', 'Jabatan', 'Unit Kerja / Bagian', 'Pagu TPP (Rp)'],
  ];
  summaries.forEach((sum) => {
    masterData.push([
      sum.employee.fingerId,
      sum.employee.nip || '',
      sum.employee.name,
      sum.employee.golongan || '',
      sum.employee.position || '',
      sum.employee.department || 'Sekretariat DPRD',
      sum.employee.basicTpp || 0,
    ]);
  });
  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  wsMaster['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 34 }, { wch: 12 }, { wch: 40 }, { wch: 35 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master Pegawai');

  // 3. DETAIL HARIAN
  const detailData: (string | number)[][] = [
    ['ID Finger', 'Nama Pegawai', 'Tanggal', 'Hari', 'Jam Masuk', 'Jam Pulang', 'Status', 'Pot. Masuk (%)', 'Pot. Pulang (%)', 'Pot. Absen (%)', 'Total Pot (%)', 'Catatan / Review'],
  ];

  summaries.forEach((sum) => {
    dates.forEach((dateStr) => {
      const calc = sum.dailyCalculations[dateStr];
      if (!calc) return;
      detailData.push([
        sum.employee.fingerId,
        sum.employee.name,
        dateStr,
        getDayNameId(dateStr),
        calc.entry.inTime || '-',
        calc.entry.outTime || '-',
        calc.status,
        calc.deductions.late,
        calc.deductions.early,
        calc.deductions.absence,
        calc.deductions.total,
        calc.issues.map((i) => i.message).join('; ') || (calc.override.reason || ''),
      ]);
    });
  });

  const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
  wsDetail['!cols'] = [
    { wch: 10 }, { wch: 30 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Harian');

  // 4. CATATAN ATURAN
  const rulesData = [
    ['CATATAN ATURAN DAN KETENTUAN DISIPLIN TPP SEKRETARIAT DPRD KOTA BITUNG'],
    [],
    ['1. HARI & JAM KERJA RESMI'],
    ['   - Senin s/d Kamis : 07.30 - 16.45 WITA'],
    ['   - Jumat           : 07.30 - 12.00 WITA'],
    ['   - Sabtu & Minggu  : Libur'],
    [],
    ['2. KETENTUAN TERLAMBAT MASUK KERJA (TL)'],
    ['   - 07.30 ke bawah       : 0.00% (Tepat Waktu)'],
    ['   - 07.31 s/d 07.39      : 0.00% (Rentang Toleransi Review)'],
    ['   - 07.40 s/d 08.00      : 0.50%'],
    ['   - 08.01 s/d 08.30      : 1.00%'],
    ['   - 08.31 s/d 09.00      : 1.25%'],
    ['   - Di atas 09.00        : 1.50%'],
    ['   - Tidak Finger Masuk   : 1.50%'],
    [],
    ['3. KETENTUAN PULANG SEBELUM WAKTU (PSW)'],
    ['   - Senin-Kamis >= 16.45 : 0.00%'],
    ['   - Senin-Kamis 16.31-16.44: 0.50%'],
    ['   - Senin-Kamis 16.01-16.30: 1.00%'],
    ['   - Senin-Kamis 15.31-16.00: 1.25%'],
    ['   - Senin-Kamis 15.00-15.30: 1.50%'],
    ['   - Senin-Kamis < 15.00  : 1.55%'],
    ['   - Tidak Finger Pulang  : 1.55%'],
    ['   - Jumat >= 12.00       : 0.00%'],
    [],
    ['4. KETENTUAN TIDAK MASUK KERJA / WFH / IZIN / SAKIT'],
    ['   - WFH / Work From Home (WFH/W) : 0.00% (Dianggap Masuk/Hadir HD)'],
    ['   - Tugas Luar (TL)              : 0.00% (Disertai SPT)'],
    ['   - Sakit Rawat Inap (S)         : 0.00% (Wajib Bukti Rawat Inap)'],
    ['   - Izin (I)                     : 3.00% per hari'],
    ['   - Tidak Masuk Kerja (TK/Alpha) : 3.00% per hari'],
  ];
  const wsRules = XLSX.utils.aoa_to_sheet(rulesData);
  wsRules['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsRules, 'Catatan Aturan');

  // Trigger download
  const dateTag = periodStart.replace(/-/g, '').slice(0, 6);
  XLSX.writeFile(wb, `REKAP_TPP_SETWAN_BITUNG_${dateTag}.xlsx`);
}
