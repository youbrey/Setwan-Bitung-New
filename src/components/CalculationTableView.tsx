import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  AlertTriangle,
  FileEdit,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DayCalculation, SpecialCode } from '../types';
import { getDayNameId, parseDate } from '../domain/calendar';

interface CalculationTableViewProps {
  calculations: Array<{
    calculation: DayCalculation;
    dateStr: string;
    employeeName: string;
    employeeNip?: string;
    fingerId: string;
  }>;
  selectedKeys: Set<string>; // key: `${fingerId}|${dateStr}`
  onToggleKey: (key: string) => void;
  onSelectAll: (keys: string[]) => void;
  onClearSelection: () => void;
  onSelectEmployeeDate: (fingerId: string, dateStr: string) => void;
  onQuickApplyCodeToKey?: (fingerId: string, dateStr: string, code: SpecialCode, inpatient?: boolean) => void;
}

export const CalculationTableView: React.FC<CalculationTableViewProps> = ({
  calculations,
  selectedKeys,
  onToggleKey,
  onSelectAll,
  onClearSelection,
  onSelectEmployeeDate,
}) => {
  const [sortField, setSortField] = useState<'date' | 'name' | 'fingerId' | 'totalDeduction' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(true);

  const allKeys = useMemo(
    () => calculations.map((c) => `${c.fingerId}|${c.dateStr}`),
    [calculations]
  );

  const reviewKeys = useMemo(
    () =>
      calculations
        .filter((c) => !c.calculation.finalizable || c.calculation.issues.length > 0)
        .map((c) => `${c.fingerId}|${c.dateStr}`),
    [calculations]
  );

  const isAllSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));
  const isSomeSelected = selectedKeys.size > 0 && !isAllSelected;

  const sortedCalculations = useMemo(() => {
    const list = [...calculations];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = a.dateStr.localeCompare(b.dateStr);
      } else if (sortField === 'name') {
        cmp = a.employeeName.localeCompare(b.employeeName);
      } else if (sortField === 'fingerId') {
        cmp = a.fingerId.localeCompare(b.fingerId);
      } else if (sortField === 'totalDeduction') {
        cmp = (a.calculation.deductions.total || 0) - (b.calculation.deductions.total || 0);
      } else if (sortField === 'status') {
        cmp = (a.calculation.status || '').localeCompare(b.calculation.status || '');
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [calculations, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const formatPercent = (val: number) => {
    if (!val || val === 0) return '—';
    return `${val.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg border border-[#DCE3EB] shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Table Action Header & Selection Info */}
      <div className="px-4 py-2.5 bg-[#F5F7FA] border-b border-[#DCE3EB] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (isAllSelected ? onClearSelection() : onSelectAll(allKeys))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-[#C9D3DF] text-[#17324D] font-semibold transition"
          >
            {isAllSelected ? <CheckSquare className="w-3.5 h-3.5 text-[#1D73E8]" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isAllSelected ? 'Batal Pilih Semua' : 'Pilih Semua Baris'}</span>
          </button>

          {reviewKeys.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectAll(reviewKeys)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-semibold transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Pilih Semua Perlu Review ({reviewKeys.length})</span>
            </button>
          )}

          {selectedKeys.size > 0 && (
            <span className="text-xs font-bold text-[#1D73E8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {selectedKeys.size} baris terpilih
            </span>
          )}
        </div>

        <div className="text-xs text-[#66788A]">
          Total Data: <strong className="text-[#17324D]">{calculations.length}</strong> baris kehadiran
        </div>
      </div>

      {/* Main Qt-Style Table */}
      <div className="overflow-x-auto max-w-full max-h-[620px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Qt QHeaderView Style (#17324D header, white bold text, border #2B4865) */}
          <thead className="sticky top-0 z-20 bg-[#17324D] text-white shadow-xs">
            <tr className="border-b border-[#2B4865]">
              <th className="w-9 px-2 py-2.5 text-center border-r border-[#2B4865]">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={(e) => (e.target.checked ? onSelectAll(allKeys) : onClearSelection())}
                  className="rounded text-[#1D73E8] focus:ring-0 cursor-pointer"
                  title="Pilih / Batal Pilih Semua"
                />
              </th>
              <th
                onClick={() => handleSort('date')}
                className="px-2.5 py-2.5 font-bold border-r border-[#2B4865] cursor-pointer hover:bg-[#1D3E5E] select-none text-center min-w-[95px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Tanggal</span>
                  {sortField === 'date' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[75px]">Hari</th>
              <th
                onClick={() => handleSort('fingerId')}
                className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center cursor-pointer hover:bg-[#1D3E5E] select-none min-w-[80px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>ID Finger</span>
                  {sortField === 'fingerId' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-3 py-2.5 font-bold border-r border-[#2B4865] cursor-pointer hover:bg-[#1D3E5E] select-none min-w-[190px]"
              >
                <div className="flex items-center gap-1">
                  <span>Nama Pegawai</span>
                  {sortField === 'name' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[65px]">Masuk</th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[65px]">Pulang</th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[60px]">Kode</th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[85px]">Tidak Masuk</th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[75px]">Terlambat</th>
              <th className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center min-w-[85px]">Pulang Cepat</th>
              <th
                onClick={() => handleSort('totalDeduction')}
                className="px-2 py-2.5 font-bold border-r border-[#2B4865] text-center cursor-pointer hover:bg-[#1D3E5E] select-none min-w-[70px]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Jumlah</span>
                  {sortField === 'totalDeduction' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-3 py-2.5 font-bold border-r border-[#2B4865] cursor-pointer hover:bg-[#1D3E5E] select-none min-w-[140px]"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === 'status' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-3 py-2.5 font-bold border-r border-[#2B4865] min-w-[220px]">Catatan Review</th>
              <th className="px-2 py-2.5 font-bold text-center min-w-[70px]">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E8EDF2] text-[#17324D]">
            {sortedCalculations.map((item, idx) => {
              const { calculation, dateStr, employeeName, fingerId } = item;
              const { entry, deductions, status, issues, highlightYellow, finalizable, override } = calculation;
              const key = `${fingerId}|${dateStr}`;
              const isSelected = selectedKeys.has(key);

              // Date formatting
              const d = parseDate(dateStr);
              const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
              const dayName = getDayNameId(dateStr);

              // Determine row background styling matching Qt ResultTable
              let rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]';
              let textStyle = 'text-[#17324D]';

              if (isSelected) {
                rowBg = 'bg-[#DCEBFF] font-medium';
              } else if (highlightYellow) {
                rowBg = 'bg-[#FFF2CC]';
              } else if (!finalizable) {
                rowBg = 'bg-[#FCE8E6]';
                textStyle = 'text-[#8A1C13]';
              }

              const hasLate = deductions.late > 0;
              const hasEarly = deductions.early > 0;
              const hasAbsence = deductions.absence > 0;
              const hasTotal = deductions.total > 0;

              return (
                <tr
                  key={key}
                  className={`${rowBg} ${textStyle} hover:bg-[#EBF3FC] transition border-b border-[#E8EDF2] cursor-pointer`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    onToggleKey(key);
                  }}
                >
                  {/* Checkbox Column */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2]" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleKey(key)}
                      className="rounded text-[#1D73E8] focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Tanggal */}
                  <td className="px-2.5 py-2 text-center border-r border-[#E8EDF2] font-mono text-[11px] font-medium whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Hari */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] whitespace-nowrap font-medium">
                    {dayName}
                  </td>

                  {/* ID Finger */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-bold text-slate-700 whitespace-nowrap">
                    {fingerId}
                  </td>

                  {/* Nama Pegawai */}
                  <td className="px-3 py-2 border-r border-[#E8EDF2]">
                    <div className="font-semibold text-slate-900 truncate max-w-[220px]" title={employeeName}>
                      {employeeName}
                    </div>
                  </td>

                  {/* Masuk */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-medium">
                    {entry.inTime ? (
                      <span className={hasLate ? 'text-amber-800 font-bold' : 'text-slate-800'}>{entry.inTime}</span>
                    ) : (
                      <span className="text-slate-400 font-bold">—</span>
                    )}
                  </td>

                  {/* Pulang */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-medium">
                    {entry.outTime ? (
                      <span className={hasEarly ? 'text-amber-800 font-bold' : 'text-slate-800'}>{entry.outTime}</span>
                    ) : (
                      <span className="text-slate-400 font-bold">—</span>
                    )}
                  </td>

                  {/* Kode Override */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2]">
                    {override.code ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          override.code === 'WFH' || override.code === 'W'
                            ? 'bg-teal-100 text-teal-900 border border-teal-300'
                            : override.code === 'TL'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : override.code === 'S'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {override.code}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Tidak Masuk % */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-medium">
                    <span className={hasAbsence ? 'text-rose-700 font-bold' : 'text-slate-400'}>
                      {formatPercent(deductions.absence)}
                    </span>
                  </td>

                  {/* Terlambat % */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-medium">
                    <span className={hasLate ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                      {formatPercent(deductions.late)}
                    </span>
                  </td>

                  {/* Pulang Cepat % */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-medium">
                    <span className={hasEarly ? 'text-amber-700 font-bold' : 'text-slate-400'}>
                      {formatPercent(deductions.early)}
                    </span>
                  </td>

                  {/* Jumlah Total Potongan % */}
                  <td className="px-2 py-2 text-center border-r border-[#E8EDF2] font-mono font-extrabold">
                    <span className={hasTotal ? 'text-rose-700 font-black' : 'text-slate-400'}>
                      {formatPercent(deductions.total)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 border-r border-[#E8EDF2]">
                    <div className="font-semibold text-xs truncate max-w-[150px]" title={status}>
                      {status}
                    </div>
                  </td>

                  {/* Catatan Review */}
                  <td className="px-3 py-2 border-r border-[#E8EDF2]">
                    {issues.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                        <span className="truncate max-w-[240px]" title={issues.map((i) => i.message).join(' | ')}>
                          {issues.map((i) => i.message).join(' | ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[11px]">Tidak ada catatan</span>
                    )}
                  </td>

                  {/* Aksi / Detail Modal Trigger */}
                  <td className="px-2 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSelectEmployeeDate(fingerId, dateStr)}
                      className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-blue-700 shadow-2xs transition"
                      title="Buka Editor Kehadiran Pegawai"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
