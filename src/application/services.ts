import {
  DayOverride,
  EmployeeMonthlySummary,
  ImportResult,
  SignerProfile,
} from '../types';
import { generateDateRange, isWorkday } from '../domain/calendar';
import { DeductionEngine } from '../domain/rules';

const engine = new DeductionEngine();

export const DEFAULT_SIGNER: SignerProfile = {
  title: 'Kepala Bagian Umum dan Keuangan',
  name: 'SANTY N. MAMESAH, SS, M.Si',
  nip: '198109112003122005',
  city: 'Bitung',
  signDate: '2026-08-31',
};

export function computeMonthlySummaries(
  importResult: ImportResult,
  overrides: Record<string, Record<string, DayOverride>> = {}, // [fingerId][workDate]
  customHolidays: string[] = []
): {
  summaries: EmployeeMonthlySummary[];
  dates: string[];
  totalWorkdays: number;
} {
  const dates = generateDateRange(importResult.periodStart, importResult.periodEnd);
  const workdaysInPeriod = dates.filter((d) => isWorkday(d, customHolidays)).length;

  const summaries: EmployeeMonthlySummary[] = importResult.employees.map((employee) => {
    let presentDays = 0;
    let lateDays = 0;
    let lateDeduction = 0;
    let earlyDays = 0;
    let earlyDeduction = 0;
    let absenceDays = 0;
    let absenceDeduction = 0;
    let tlDays = 0;
    let wfhDays = 0;
    let izinDays = 0;
    let sakitDays = 0;
    let hasIssues = false;

    const dailyCalculations: Record<string, any> = {};

    dates.forEach((workDate) => {
      const entry =
        importResult.entries.find(
          (e) => e.fingerId === employee.fingerId && e.workDate === workDate
        ) || {
          fingerId: employee.fingerId,
          workDate,
          rawCell: '',
          inTime: null,
          outTime: null,
          state: 'MISSING_BOTH' as const,
        };

      const override = overrides[employee.fingerId]?.[workDate];
      const calc = engine.calculate(entry, override, customHolidays);
      dailyCalculations[workDate] = calc;

      if (!isWorkday(workDate, customHolidays)) {
        return; // Don't count non-workdays into deductions
      }

      if (calc.issues.length > 0) {
        hasIssues = true;
      }

      if (calc.override.code === 'WFH' || calc.override.code === 'W' || calc.status.startsWith('WFH')) {
        wfhDays++;
        presentDays++; // WFH dihitung sebagai hadir / masuk kerja tanpa potongan
      } else if (calc.override.code === 'TL') {
        tlDays++;
        presentDays++; // Tugas luar dinas juga dihitung hadir
      } else if (calc.override.code === 'I') {
        izinDays++;
        absenceDeduction += calc.deductions.absence;
      } else if (calc.override.code === 'S') {
        sakitDays++;
      } else if (calc.entry.state === 'MISSING_BOTH') {
        absenceDays++;
        absenceDeduction += calc.deductions.absence;
      } else {
        presentDays++;
        if (calc.deductions.late > 0) {
          lateDays++;
          lateDeduction += calc.deductions.late;
        }
        if (calc.deductions.early > 0) {
          earlyDays++;
          earlyDeduction += calc.deductions.early;
        }
      }
    });

    const totalDeductionPct = +(lateDeduction + earlyDeduction + absenceDeduction).toFixed(2);
    const basicTpp = employee.basicTpp || 4000000;
    const potRupiah = Math.round((basicTpp * totalDeductionPct) / 100);
    const calculatedTpp = Math.max(0, basicTpp - potRupiah);

    return {
      employee,
      totalWorkdays: workdaysInPeriod,
      presentDays,
      lateDays,
      lateDeduction: +lateDeduction.toFixed(2),
      earlyDays,
      earlyDeduction: +earlyDeduction.toFixed(2),
      absenceDays,
      absenceDeduction: +absenceDeduction.toFixed(2),
      tlDays,
      wfhDays,
      izinDays,
      sakitDays,
      totalDeductionPct,
      calculatedTpp,
      hasIssues,
      dailyCalculations,
    };
  });

  return {
    summaries,
    dates,
    totalWorkdays: workdaysInPeriod,
  };
}

export function saveOverridesToStorage(
  storageKey: string,
  overrides: Record<string, Record<string, DayOverride>>
) {
  try {
    localStorage.setItem(`tpp_overrides_${storageKey}`, JSON.stringify(overrides));
  } catch (err) {
    console.error('Failed to save overrides', err);
  }
}

export function loadOverridesFromStorage(
  storageKey: string
): Record<string, Record<string, DayOverride>> {
  try {
    const raw = localStorage.getItem(`tpp_overrides_${storageKey}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
