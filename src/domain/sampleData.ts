import { AttendanceEntry, AttendanceState, Employee, ImportResult } from '../types';
import { generateDateRange, parseDate } from './calendar';

export const SAMPLE_EMPLOYEES: Employee[] = [
  {
    fingerId: '101',
    name: 'RITA E. SUMAMPOUW, SE',
    nip: '197204121998032004',
    position: 'Sekretaris DPRD Kota Bitung',
    golongan: 'IV/c',
    department: 'Pimpinan Sekretariat DPRD',
    basicTpp: 12500000,
  },
  {
    fingerId: '102',
    name: 'SANTY N. MAMESAH, SS, M.Si',
    nip: '198109112003122005',
    position: 'Kepala Bagian Umum dan Keuangan',
    golongan: 'IV/b',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 8500000,
  },
  {
    fingerId: '103',
    name: 'JEFFRY E. WONGKAR, SH',
    nip: '197906142006041008',
    position: 'Kepala Bagian Persidangan dan Perundang-undangan',
    golongan: 'IV/b',
    department: 'Bagian Persidangan dan Perundang-undangan',
    basicTpp: 8500000,
  },
  {
    fingerId: '104',
    name: 'MEIDY R. KALALO, SE',
    nip: '198305202008011012',
    position: 'Kepala Bagian Fasilitasi Penganggaran dan Pengawasan',
    golongan: 'IV/b',
    department: 'Bagian Fasilitasi Penganggaran dan Pengawasan',
    basicTpp: 8500000,
  },
  {
    fingerId: '105',
    name: 'CHRISTINE L. TUMBEL, S.Sos',
    nip: '198502122009022003',
    position: 'Kasubag Kepegawaian dan Tata Usaha',
    golongan: 'III/d',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 5200000,
  },
  {
    fingerId: '106',
    name: 'HENDRA P. SUMAMPOUW, SE',
    nip: '198611042010011009',
    position: 'Kasubag Keuangan & Perencanaan',
    golongan: 'III/c',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 4800000,
  },
  {
    fingerId: '107',
    name: 'GABRIELLA V. ROTINSULU, SE',
    nip: '199407222019032007',
    position: 'Kasubag Fasilitasi Penganggaran',
    golongan: 'III/b',
    department: 'Bagian Fasilitasi Penganggaran dan Pengawasan',
    basicTpp: 4500000,
  },
  {
    fingerId: '108',
    name: 'MICHAEL R. TAROREH, S.IP',
    nip: '199112052020121004',
    position: 'Kasubag Fasilitasi Pengawasan',
    golongan: 'III/b',
    department: 'Bagian Fasilitasi Penganggaran dan Pengawasan',
    basicTpp: 4500000,
  },
  {
    fingerId: '109',
    name: 'NOVITA S. PANGEMANAN, SH',
    nip: '198808152011012014',
    position: 'Perancang Peraturan Perundang-undangan Ahli Muda',
    golongan: 'III/c',
    department: 'Bagian Persidangan dan Perundang-undangan',
    basicTpp: 5000000,
  },
  {
    fingerId: '110',
    name: 'BILLY J. RUMOKOY, S.STP',
    nip: '199201282014061001',
    position: 'Pranata Humas Ahli Pertama',
    golongan: 'III/b',
    department: 'Bagian Persidangan dan Perundang-undangan',
    basicTpp: 4200000,
  },
  {
    fingerId: '111',
    name: 'MARVELLINO T. RUNTU, S.Kom',
    nip: '199304102015031002',
    position: 'Pranata Komputer Ahli Pertama',
    golongan: 'III/b',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 4200000,
  },
  {
    fingerId: '112',
    name: 'GLEN D. RUMENGAN, S.STP',
    nip: '199308152016091001',
    position: 'Analis Kebijakan Ahli Pertama',
    golongan: 'III/a',
    department: 'Bagian Fasilitasi Penganggaran dan Pengawasan',
    basicTpp: 3800000,
  },
  {
    fingerId: '113',
    name: 'GRACE M. MAMAHIT, A.Md',
    nip: '199503182021042008',
    position: 'Pengelola Pengadaan Barang/Jasa Terampil',
    golongan: 'II/c',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 2900000,
  },
  {
    fingerId: '114',
    name: 'VITA M. RANTUNG, A.Md',
    nip: '199406122020122009',
    position: 'Bendahara Pengeluaran',
    golongan: 'II/c',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 3200000,
  },
  {
    fingerId: '115',
    name: 'ADRIAN F. LUMINGAS',
    nip: '199609142022031005',
    position: 'Pengadministrasi Risalah dan Persidangan',
    golongan: 'II/a',
    department: 'Bagian Persidangan dan Perundang-undangan',
    basicTpp: 2400000,
  },
  {
    fingerId: '116',
    name: 'STERRA S. KALESARAN',
    nip: '199703212022032006',
    position: 'Pengadministrasi Keuangan',
    golongan: 'II/a',
    department: 'Bagian Umum dan Keuangan',
    basicTpp: 2400000,
  },
  {
    fingerId: '117',
    name: 'JERRY K. MANGKAPAL',
    nip: '199511022022031003',
    position: 'Pengadministrasi Umum',
    golongan: 'II/a',
    department: 'Bagian Persidangan dan Perundang-undangan',
    basicTpp: 2400000,
  },
];

export function generateSampleImportResult(): ImportResult {
  const periodStart = '2026-08-01';
  const periodEnd = '2026-08-31';
  const dates = generateDateRange(periodStart, periodEnd);
  const entries: AttendanceEntry[] = [];

  SAMPLE_EMPLOYEES.forEach((emp, empIdx) => {
    dates.forEach((dateStr, dIdx) => {
      const d = parseDate(dateStr);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat, 5 = Fri
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) {
        entries.push({
          fingerId: emp.fingerId,
          workDate: dateStr,
          rawCell: '',
          inTime: null,
          outTime: null,
          state: 'MISSING_BOTH',
        });
        return;
      }

      // Generate realistic work patterns including WFH
      const seed = (empIdx * 37 + dIdx * 19) % 100;
      let rawCell = '';
      let inTime: string | null = null;
      let outTime: string | null = null;
      let state: AttendanceState = 'COMPLETE';

      const normalOut = dayOfWeek === 5 ? '12:05' : '16:50';

      if (seed < 65) {
        // Normal On Time
        inTime = '07:18';
        outTime = normalOut;
        rawCell = `${inTime}-${outTime}`;
        state = 'COMPLETE';
      } else if (seed < 73) {
        // WFH (Work From Home) -> 0% deduction and counted as present
        inTime = null;
        outTime = null;
        rawCell = 'WFH';
        state = 'COMPLETE';
      } else if (seed < 80) {
        // Late arrival (07:35 - 08:15)
        const lateMin = 35 + (seed % 40);
        const h = lateMin >= 60 ? '08' : '07';
        const m = String(lateMin % 60).padStart(2, '0');
        inTime = `${h}:${m}`;
        outTime = normalOut;
        rawCell = `${inTime}-${outTime}`;
        state = 'COMPLETE';
      } else if (seed < 86) {
        // Early departure (Senin-Kamis 15:45 or 16:15)
        inTime = '07:22';
        if (dayOfWeek === 5) {
          outTime = '11:45';
        } else {
          outTime = seed % 2 === 0 ? '15:40' : '16:15';
        }
        rawCell = `${inTime}-${outTime}`;
        state = 'COMPLETE';
      } else if (seed < 90) {
        // Missing Out
        inTime = '07:25';
        outTime = null;
        rawCell = `${inTime}-`;
        state = 'MISSING_OUT';
      } else if (seed < 94) {
        // Missing In
        inTime = null;
        outTime = normalOut;
        rawCell = `-${outTime}`;
        state = 'MISSING_IN';
      } else if (seed < 97) {
        // Absent (Tidak Masuk / Alpha)
        inTime = null;
        outTime = null;
        rawCell = '';
        state = 'MISSING_BOTH';
      } else {
        // Tugas Luar (TL)
        inTime = '07:10';
        outTime = normalOut;
        rawCell = `${inTime}-${outTime}`;
        state = 'COMPLETE';
      }

      entries.push({
        fingerId: emp.fingerId,
        workDate: dateStr,
        rawCell,
        inTime,
        outTime,
        state,
        sourcePage: Math.floor(empIdx / 4) + 1,
      });
    });
  });

  return {
    fileName: 'REKAP_FINGER_SCAN_SETWAN_BITUNG_AGUSTUS_2026.pdf',
    periodStart,
    periodEnd,
    employees: SAMPLE_EMPLOYEES,
    entries,
    issues: [],
    importedAt: new Date().toISOString(),
  };
}

