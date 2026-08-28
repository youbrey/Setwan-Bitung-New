import React from 'react';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { EmployeeMonthlySummary, SpecialCode } from '../types';
import { getDayNameId, parseDate } from '../domain/calendar';
import { CalculationTableView } from './CalculationTableView';
import { ViewMode } from './ControlsBar';

interface AttendanceTableProps {
  summaries: EmployeeMonthlySummary[];
  dates: string[];
  viewMode: ViewMode;
  selectedKeys: Set<string>;
  onToggleKey: (key: string) => void;
  onSelectAllKeys: (keys: string[]) => void;
  onClearSelection: () => void;
  onSelectEmployeeDate: (fingerId: string, dateStr?: string) => void;
  onQuickApplyCode: (fingerId: string, dateStr: string, code: SpecialCode, inpatient?: boolean) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  summaries,
  dates,
  viewMode,
  selectedKeys,
  onToggleKey,
  onSelectAllKeys,
  onClearSelection,
  onSelectEmployeeDate,
  onQuickApplyCode,
}) => {
  // Flatten daily calculations for daily_table mode
  const flattenedCalculations = React.useMemo(() => {
    const list: Array<{
      calculation: any;
      dateStr: string;
      employeeName: string;
      employeeNip?: string;
      fingerId: string;
    }> = [];

    summaries.forEach((sum) => {
      dates.forEach((dateStr) => {
        const calc = sum.dailyCalculations[dateStr];
        if (calc) {
          list.push({
            calculation: calc,
            dateStr,
            employeeName: sum.employee.name,
            employeeNip: sum.employee.nip,
            fingerId: sum.employee.fingerId,
          });
        }
      });
    });

    return list;
  }, [summaries, dates]);

  if (summaries.length === 0) {
    return (
      <div className="bg-white rounded-[10px] border border-[#DCE3EB] p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#17324D] mb-1">Tidak ada data pegawai yang cocok</h4>
        <p className="text-xs text-[#66788A]">Silakan ubah kata kunci pencarian atau sesuaikan filter status.</p>
      </div>
    );
  }

  // ==================== 1. DAILY CALCULATION TABLE (PYSIDE6 NATIVE QTABLEVIEW) ====================
  if (viewMode === 'daily_table') {
    return (
      <CalculationTableView
        calculations={flattenedCalculations}
        selectedKeys={selectedKeys}
        onToggleKey={onToggleKey}
        onSelectAll={onSelectAllKeys}
        onClearSelection={onClearSelection}
        onSelectEmployeeDate={(fId, dStr) => onSelectEmployeeDate(fId, dStr)}
        onQuickApplyCodeToKey={onQuickApplyCode}
      />
    );
  }

  // ==================== 2. MONTHLY SUMMARY TABLE (REKAPITULASI BULANAN PEGAWAI) ====================
  if (viewMode === 'monthly_summary') {
    return (
      <div className="bg-white rounded-[10px] border border-[#DCE3EB] shadow-xs overflow-hidden flex flex-col font-sans">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#17324D] text-white">
              <tr className="border-b border-[#2B4865]">
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] text-center w-12">No</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] text-center w-20">ID Finger</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] min-w-[200px]">Nama Pegawai / NIP</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] min-w-[180px]">Jabatan</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">HK</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">HD</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center bg-teal-900/60">WFH</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center bg-blue-900/60">TL</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">TL Jml</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">TL %</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">PSW Jml</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">PSW %</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">TK Jml</th>
                <th className="py-2.5 px-2 font-bold border-r border-[#2B4865] text-center">TK %</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] text-center bg-[#1D3E5E]">Tot Pot %</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] text-right">Pagu TPP (Rp)</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#2B4865] text-right">Potongan (Rp)</th>
                <th className="py-2.5 px-3 font-bold text-right bg-emerald-900/80">TPP Bersih (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF2] text-[#17324D]">
              {summaries.map((sum, index) => {
                const basicTpp = sum.employee.basicTpp || 0;
                const deductionPct = sum.totalDeductionPct || 0;
                const deductionRp = Math.round((basicTpp * deductionPct) / 100);
                const finalTpp = basicTpp - deductionRp;

                return (
                  <tr
                    key={sum.employee.fingerId}
                    onClick={() => onSelectEmployeeDate(sum.employee.fingerId)}
                    className={`hover:bg-[#EBF3FC] transition cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                    } ${sum.hasIssues ? 'bg-rose-50/50' : ''}`}
                  >
                    <td className="py-2 px-3 text-center border-r border-[#E8EDF2] font-semibold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-[#E8EDF2] font-mono font-bold text-slate-800">
                      {sum.employee.fingerId}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E8EDF2]">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{sum.employee.name}</span>
                        {sum.hasIssues && (
                          <span title="Perlu review bukti">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 ml-1" />
                          </span>
                        )}
                      </div>
                      {sum.employee.nip && (
                        <div className="text-[11px] font-mono text-slate-500">NIP. {sum.employee.nip}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-[#E8EDF2] text-[11px] text-slate-700">
                      {sum.employee.position || '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono">{sum.totalWorkdays}</td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono font-bold text-emerald-800">
                      {sum.presentDays}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono bg-teal-50 font-bold text-teal-800">
                      {sum.wfhDays || '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono bg-blue-50 font-bold text-blue-800">
                      {sum.tlDays || '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono">{sum.lateDays || '—'}</td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono text-amber-700 font-medium">
                      {sum.lateDeduction > 0 ? `${sum.lateDeduction.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono">{sum.earlyDays || '—'}</td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono text-amber-700 font-medium">
                      {sum.earlyDeduction > 0 ? `${sum.earlyDeduction.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono">{sum.absenceDays || '—'}</td>
                    <td className="py-2 px-2 text-center border-r border-[#E8EDF2] font-mono text-rose-700 font-medium">
                      {sum.absenceDeduction > 0 ? `${sum.absenceDeduction.toFixed(2)}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center border-r border-[#E8EDF2] font-mono font-black text-rose-700 bg-rose-50/40">
                      {deductionPct > 0 ? `${deductionPct.toFixed(2)}%` : '0.00%'}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-[#E8EDF2] font-mono text-slate-700">
                      {basicTpp ? basicTpp.toLocaleString('id-ID') : '—'}
                    </td>
                    <td className="py-2 px-3 text-right border-r border-[#E8EDF2] font-mono text-rose-700 font-bold">
                      {deductionRp ? deductionRp.toLocaleString('id-ID') : '0'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-800 bg-emerald-50/50">
                      {basicTpp ? finalTpp.toLocaleString('id-ID') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== 3. CALENDAR MATRIX VIEW (31 HARI) ====================
  return (
    <div className="bg-white rounded-[10px] border border-[#DCE3EB] shadow-xs overflow-hidden flex flex-col font-sans">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17324D] text-white border-b border-[#2B4865]">
              <th className="py-2.5 px-3 sticky left-0 bg-[#17324D] z-10 min-w-[200px] border-r border-[#2B4865] font-bold">
                Pegawai (ID & Nama)
              </th>
              {dates.map((dateStr) => {
                const d = parseDate(dateStr);
                const dayNum = d.getDate();
                const dayOfWeek = d.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dayName = getDayNameId(dateStr).slice(0, 3);

                return (
                  <th
                    key={dateStr}
                    className={`py-2 px-1 text-center font-bold border-r border-[#2B4865] min-w-[48px] ${
                      isWeekend ? 'bg-slate-800 text-slate-400' : 'text-white'
                    }`}
                  >
                    <div className="text-[10px] uppercase text-slate-300">{dayName}</div>
                    <div className="font-extrabold text-xs">{dayNum}</div>
                  </th>
                );
              })}
              <th className="py-2.5 px-3 text-center bg-[#1D3E5E] font-extrabold min-w-[80px]">Tot Pot %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EDF2] text-[#17324D]">
            {summaries.map((sum, index) => (
              <tr
                key={sum.employee.fingerId}
                className={`hover:bg-[#EBF3FC] transition group ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}
              >
                {/* Sticky Employee Name */}
                <td className="py-2 px-3 sticky left-0 bg-inherit group-hover:bg-[#EBF3FC] z-10 border-r border-[#E8EDF2] shadow-2xs">
                  <button
                    onClick={() => onSelectEmployeeDate(sum.employee.fingerId)}
                    className="text-left font-bold text-slate-900 hover:text-[#1D73E8] truncate block max-w-[200px]"
                  >
                    {sum.employee.name}
                  </button>
                  <div className="text-[11px] text-[#66788A] flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-semibold">ID: {sum.employee.fingerId}</span>
                    {sum.wfhDays > 0 && (
                      <span className="bg-teal-100 text-teal-800 px-1 rounded text-[10px] font-bold">
                        {sum.wfhDays} WFH
                      </span>
                    )}
                    {sum.hasIssues && (
                      <span title="Ada catatan review">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Day Cells */}
                {dates.map((dateStr) => {
                  const calc = sum.dailyCalculations[dateStr];
                  const d = parseDate(dateStr);
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                  if (isWeekend) {
                    return (
                      <td key={dateStr} className="bg-slate-100 text-slate-400 text-center py-1.5 px-0.5 border-r border-[#E8EDF2]">
                        <span className="text-[10px] font-bold select-none">-</span>
                      </td>
                    );
                  }

                  if (!calc) {
                    return (
                      <td key={dateStr} className="text-center py-1.5 px-0.5 border-r border-[#E8EDF2]">
                        -
                      </td>
                    );
                  }

                  const { entry, deductions, override, highlightYellow, finalizable } = calc;
                  let cellBg = 'bg-white hover:bg-blue-50';
                  let content = null;

                  if (override.code === 'WFH' || override.code === 'W') {
                    cellBg = 'bg-teal-50 text-teal-900 font-bold';
                    content = <span className="text-[11px]">WFH</span>;
                  } else if (override.code === 'TL') {
                    cellBg = 'bg-blue-50 text-blue-900 font-bold';
                    content = <span className="text-[11px]">TL</span>;
                  } else if (override.code === 'I') {
                    cellBg = 'bg-rose-50 text-rose-900 font-bold';
                    content = <span className="text-[11px]">I (3%)</span>;
                  } else if (override.code === 'S') {
                    cellBg = highlightYellow ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-emerald-50 text-emerald-900 font-bold';
                    content = <span className="text-[11px]">S</span>;
                  } else if (entry.state === 'MISSING_BOTH') {
                    cellBg = 'bg-rose-100 text-rose-900 font-black';
                    content = <span className="text-[11px]">TK (3%)</span>;
                  } else {
                    const hasLate = deductions.late > 0;
                    const hasEarly = deductions.early > 0;

                    if (hasLate || hasEarly) {
                      cellBg = 'bg-amber-50 text-amber-900';
                      content = (
                        <div className="text-[10px] leading-tight">
                          {entry.inTime || '—'}
                          <br />
                          {entry.outTime || '—'}
                        </div>
                      );
                    } else {
                      cellBg = 'bg-emerald-50/50 text-emerald-900';
                      content = (
                        <div className="text-[10px] text-slate-700 leading-tight">
                          {entry.inTime || '—'}
                          <br />
                          {entry.outTime || '—'}
                        </div>
                      );
                    }
                  }

                  return (
                    <td
                      key={dateStr}
                      onClick={() => onSelectEmployeeDate(sum.employee.fingerId, dateStr)}
                      className={`text-center py-1 px-0.5 border-r border-[#E8EDF2] cursor-pointer transition ${cellBg}`}
                      title={`${getDayNameId(dateStr)}, ${dateStr} - ${calc.status}`}
                    >
                      <div className="flex flex-col items-center justify-center min-h-[30px]">
                        {content}
                        {!finalizable && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 mt-0.5" />}
                      </div>
                    </td>
                  );
                })}

                {/* Total Deduction Cell */}
                <td className="py-2 px-3 text-center font-mono font-black border-l border-[#E8EDF2] bg-slate-50">
                  <span className={sum.totalDeductionPct > 0 ? 'text-rose-700' : 'text-slate-500'}>
                    {sum.totalDeductionPct.toFixed(2)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
