import {
  AttendanceEntry,
  DayCalculation,
  DayOverride,
  DeductionBreakdown,
  Issue,
} from '../types';
import { getScheduleFor, parseDate } from './calendar';

export const PCT_050 = 0.50;
export const PCT_100 = 1.00;
export const PCT_125 = 1.25;
export const PCT_150 = 1.50;
export const PCT_155 = 1.55;
export const PCT_300 = 3.00;

export class DeductionEngine {
  /**
   * Evaluates attendance entry against official rules and returns full breakdown
   */
  public calculate(
    entry: AttendanceEntry,
    override?: DayOverride,
    customHolidays: string[] = []
  ): DayCalculation {
    const activeOverride = override || { code: '' };
    const schedule = getScheduleFor(entry.workDate, customHolidays);

    // Non-workday (Sabtu/Minggu or Holiday)
    if (!schedule.workday) {
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: 0, total: 0 },
        status: 'Bukan Hari Kerja',
        issues: [],
        highlightYellow: false,
        finalizable: true,
      };
    }

    // Special manual override codes or cell indicators
    if (
      activeOverride.code === 'WFH' ||
      activeOverride.code === 'W' ||
      entry.rawCell.trim().toUpperCase() === 'WFH' ||
      entry.rawCell.trim().toUpperCase() === 'W'
    ) {
      return {
        entry,
        override: activeOverride.code ? activeOverride : { code: 'WFH' },
        deductions: { late: 0, early: 0, absence: 0, total: 0 },
        status: 'WFH (Work From Home)',
        issues: [],
        highlightYellow: false,
        finalizable: true,
      };
    }

    if (activeOverride.code === 'TL') {
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: 0, total: 0 },
        status: 'Tugas Luar (TL)',
        issues: [],
        highlightYellow: false,
        finalizable: true,
      };
    }

    if (activeOverride.code === 'I') {
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: PCT_300, total: PCT_300 },
        status: 'Izin',
        issues: [],
        highlightYellow: false,
        finalizable: true,
      };
    }

    if (activeOverride.code === 'S') {
      if (activeOverride.inpatient) {
        return {
          entry,
          override: activeOverride,
          deductions: { late: 0, early: 0, absence: 0, total: 0 },
          status: 'Sakit — Rawat Inap',
          issues: [],
          highlightYellow: true,
          finalizable: true,
        };
      }
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: 0, total: 0 },
        status: 'Sakit — Perlu Bukti',
        issues: [
          {
            code: 'S_REQUIRES_INPATIENT_EVIDENCE',
            message: 'Status Sakit (S) memerlukan bukti rawat inap agar bebas potongan.',
            severity: 'WARNING',
          },
        ],
        highlightYellow: true,
        finalizable: false,
      };
    }

    // Attendance state checks
    if (entry.state === 'INVALID') {
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: 0, total: 0 },
        status: 'Data Tidak Valid',
        issues: [
          {
            code: 'INVALID_ATTENDANCE',
            message: `Nilai finger tidak dapat dibaca: "${entry.rawCell}".`,
            severity: 'BLOCKING',
          },
        ],
        highlightYellow: false,
        finalizable: false,
      };
    }

    if (entry.state === 'MISSING_BOTH') {
      return {
        entry,
        override: activeOverride,
        deductions: { late: 0, early: 0, absence: PCT_300, total: PCT_300 },
        status: 'Tidak Masuk Kerja (TK)',
        issues: [],
        highlightYellow: false,
        finalizable: true,
      };
    }

    const d = parseDate(entry.workDate);
    const dayOfWeek = d.getDay(); // 1=Mon, 5=Fri

    if (entry.state === 'MISSING_IN') {
      const { early, earlyIssue } = this.calculateEarly(dayOfWeek, entry.outTime);
      const issues = earlyIssue ? [earlyIssue] : [];
      let status = 'Tidak Finger Masuk';
      if (early > 0) status += ' + Pulang Cepat';
      if (issues.length > 0) status += ' + Perlu Review';

      const deductions: DeductionBreakdown = {
        late: PCT_150,
        early,
        absence: 0,
        total: +(PCT_150 + early).toFixed(2),
      };

      return {
        entry,
        override: activeOverride,
        deductions,
        status,
        issues,
        highlightYellow: false,
        finalizable: issues.every((i) => i.severity !== 'BLOCKING'),
      };
    }

    if (entry.state === 'MISSING_OUT') {
      const { late, lateIssue } = this.calculateLate(entry.inTime);
      const issues = lateIssue ? [lateIssue] : [];
      let status = 'Tidak Finger Pulang';
      if (late > 0) status = 'Terlambat + ' + status;
      if (issues.length > 0) status += ' + Perlu Review';

      const deductions: DeductionBreakdown = {
        late,
        early: PCT_155,
        absence: 0,
        total: +(late + PCT_155).toFixed(2),
      };

      return {
        entry,
        override: activeOverride,
        deductions,
        status,
        issues,
        highlightYellow: false,
        finalizable: issues.every((i) => i.severity !== 'BLOCKING'),
      };
    }

    // State is COMPLETE (both in and out recorded)
    const { late, lateIssue } = this.calculateLate(entry.inTime);
    const { early, earlyIssue } = this.calculateEarly(dayOfWeek, entry.outTime);
    const issues: Issue[] = [];
    if (lateIssue) issues.push(lateIssue);
    if (earlyIssue) issues.push(earlyIssue);

    const statusParts: string[] = [];
    if (late > 0) statusParts.push('Terlambat');
    if (early > 0) statusParts.push('Pulang Cepat');
    if (issues.length > 0) statusParts.push('Perlu Review');

    const deductions: DeductionBreakdown = {
      late,
      early,
      absence: 0,
      total: +(late + early).toFixed(2),
    };

    return {
      entry,
      override: activeOverride,
      deductions,
      status: statusParts.length > 0 ? statusParts.join(' + ') : 'Hadir',
      issues,
      highlightYellow: false,
      finalizable: issues.every((i) => i.severity !== 'BLOCKING'),
    };
  }

  /**
   * Late arrival rules
   */
  public calculateLate(inTime: string | null): { late: number; lateIssue: Issue | null } {
    if (!inTime) {
      return { late: PCT_150, lateIssue: null };
    }
    const [h, m] = inTime.split(':').map(Number);
    const minutes = h * 60 + m;

    const t0730 = 7 * 60 + 30;
    const t0739 = 7 * 60 + 39;
    const t0800 = 8 * 60 + 0;
    const t0830 = 8 * 60 + 30;
    const t0900 = 9 * 60 + 0;

    if (minutes <= t0730) {
      return { late: 0, lateIssue: null };
    }
    if (minutes <= t0739) {
      // 07:31 - 07:39 warning / tolerance range
      return {
        late: 0,
        lateIssue: {
          code: 'TOLERANCE_0731_0739_UNAPPROVED',
          message: `Masuk pukul ${inTime} (07.31–07.39) merupakan rentang toleransi. Periksa persetujuan pimpinan.`,
          severity: 'WARNING',
        },
      };
    }
    if (minutes <= t0800) {
      return { late: PCT_050, lateIssue: null };
    }
    if (minutes <= t0830) {
      return { late: PCT_100, lateIssue: null };
    }
    if (minutes <= t0900) {
      return { late: PCT_125, lateIssue: null };
    }
    return { late: PCT_150, lateIssue: null };
  }

  /**
   * Early departure rules (PSW)
   */
  public calculateEarly(
    dayOfWeek: number,
    outTime: string | null
  ): { early: number; earlyIssue: Issue | null } {
    if (!outTime) {
      return { early: PCT_155, earlyIssue: null };
    }
    const [h, m] = outTime.split(':').map(Number);
    const minutes = h * 60 + m;

    // Jumat (Friday): Normal finish is 12:00
    if (dayOfWeek === 5) {
      const t1200 = 12 * 60 + 0;
      if (minutes >= t1200) {
        return { early: 0, earlyIssue: null };
      }
      return {
        early: 0,
        earlyIssue: {
          code: 'FRIDAY_EARLY_RANGES_UNAPPROVED',
          message: `Jam pulang Jumat (${outTime}) sebelum 12.00 terdeteksi, persentase potongan perlu diverifikasi pimpinan.`,
          severity: 'WARNING',
        },
      };
    }

    // Senin s/d Kamis: Normal finish is 16:45
    const t1645 = 16 * 60 + 45;
    const t1630 = 16 * 60 + 30;
    const t1600 = 16 * 60 + 0;
    const t1530 = 15 * 60 + 30;
    const t1500 = 15 * 60 + 0;

    if (minutes >= t1645) {
      return { early: 0, earlyIssue: null };
    }
    if (minutes < t1500) {
      return {
        early: PCT_155,
        earlyIssue: {
          code: 'EARLY_BEFORE_1500_UNAPPROVED',
          message: `Jam pulang (${outTime}) sebelum 15.00 terdeteksi, perlu verifikasi izin pimpinan.`,
          severity: 'WARNING',
        },
      };
    }
    if (minutes <= t1530) {
      return { early: PCT_150, earlyIssue: null };
    }
    if (minutes <= t1600) {
      return { early: PCT_125, earlyIssue: null };
    }
    if (minutes <= t1630) {
      return { early: PCT_100, earlyIssue: null };
    }
    return { early: PCT_050, earlyIssue: null };
  }
}
