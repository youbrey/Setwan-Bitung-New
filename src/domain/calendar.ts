export const DAY_NAMES_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export interface WorkSchedule {
  start: string; // HH:mm
  end: string;   // HH:mm
  workday: boolean;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatIndonesianDate(dateStr: string): string {
  try {
    const d = parseDate(dateStr);
    const day = d.getDate();
    const month = MONTH_NAMES_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function getDayNameId(dateStr: string): string {
  const d = parseDate(dateStr);
  return DAY_NAMES_ID[d.getDay()];
}

export function isWorkday(dateStr: string, customHolidays: string[] = []): boolean {
  if (customHolidays.includes(dateStr)) return false;
  const d = parseDate(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek >= 1 && dayOfWeek <= 5;
}

export function getScheduleFor(dateStr: string, customHolidays: string[] = []): WorkSchedule {
  if (customHolidays.includes(dateStr)) {
    return { start: '00:00', end: '00:00', workday: false };
  }
  const d = parseDate(dateStr);
  const dayOfWeek = d.getDay();

  // Senin (1) s/d Kamis (4): 07:30 - 16:45
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    return { start: '07:30', end: '16:45', workday: true };
  }
  // Jumat (5): 07:30 - 12:00
  if (dayOfWeek === 5) {
    return { start: '07:30', end: '12:00', workday: true };
  }
  // Sabtu (6) & Minggu (0): Libur
  return { start: '00:00', end: '00:00', workday: false };
}

export function generateDateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const curr = parseDate(startStr);
  const end = parseDate(endStr);

  while (curr <= end) {
    dates.push(formatDateIso(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}
