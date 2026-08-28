export type AttendanceState =
  | 'COMPLETE'
  | 'MISSING_IN'
  | 'MISSING_OUT'
  | 'MISSING_BOTH'
  | 'INVALID';

export type SpecialCode = '' | 'TL' | 'I' | 'S' | 'WFH' | 'W';

export type IssueSeverity = 'WARNING' | 'BLOCKING';

export interface Employee {
  fingerId: string;
  name: string;
  nip?: string;
  position?: string;
  golongan?: string;
  department?: string;
  basicTpp?: number;
}

export interface DayOverride {
  code: SpecialCode;
  inpatient?: boolean;
  reason?: string;
  evidenceName?: string;
}

export interface Issue {
  code: string;
  message: string;
  severity: IssueSeverity;
}

export interface DeductionBreakdown {
  late: number;    // in percentage, e.g., 0.50, 1.00, 1.50
  early: number;   // in percentage, e.g., 0.50, 1.00, 1.25, 1.50, 1.55
  absence: number; // in percentage, e.g., 3.00
  total: number;
}

export interface AttendanceEntry {
  fingerId: string;
  workDate: string; // ISO format: YYYY-MM-DD
  rawCell: string;
  inTime: string | null;  // HH:mm
  outTime: string | null; // HH:mm
  state: AttendanceState;
  sourcePage?: number;
  confidence?: number;
}

export interface DayCalculation {
  entry: AttendanceEntry;
  override: DayOverride;
  deductions: DeductionBreakdown;
  status: string;
  issues: Issue[];
  highlightYellow: boolean;
  finalizable: boolean;
}

export interface EmployeeMonthlySummary {
  employee: Employee;
  totalWorkdays: number;
  presentDays: number;
  lateDays: number;
  lateDeduction: number;
  earlyDays: number;
  earlyDeduction: number;
  absenceDays: number;
  absenceDeduction: number;
  tlDays: number;
  wfhDays: number;
  izinDays: number;
  sakitDays: number;
  totalDeductionPct: number;
  calculatedTpp: number;
  hasIssues: boolean;
  dailyCalculations: Record<string, DayCalculation>; // key: YYYY-MM-DD
}

export interface ImportResult {
  fileName: string;
  fileSha256?: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  employees: Employee[];
  entries: AttendanceEntry[];
  issues: Issue[];
  importedAt: string;
}

export interface SignerProfile {
  title: string;
  name: string;
  nip: string;
  city: string;
  signDate: string;
}

export interface AppSettings {
  signer: SignerProfile;
  excludeBoundaryDates: boolean;
  enableAutoFixTolerances: boolean;
}
