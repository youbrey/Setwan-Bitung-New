import React, { useState } from 'react';
import { Search, Table, Calendar, Users, CheckSquare } from 'lucide-react';
import { SpecialCode } from '../types';

export type ViewMode = 'daily_table' | 'monthly_summary' | 'calendar_matrix';

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string; // 'all' | 'issues' | 'deduction' | 'incomplete'
  onStatusFilterChange: (f: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  selectedCount: number;
  onApplyCodeToSelected: (code: SpecialCode, inpatient?: boolean) => void;
  onOpenPositionsModal: () => void;
  onToggleHolidaysForSelected: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onApplyCodeToSelected,
  onOpenPositionsModal,
  onToggleHolidaysForSelected,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('none');
  const [isInpatient, setIsInpatient] = useState<boolean>(false);

  const handleCodeChange = (codeVal: string) => {
    setSelectedCode(codeVal);
    if (codeVal !== 'S') {
      setIsInpatient(false);
    }
  };

  const handleApplyClick = () => {
    let code: SpecialCode = '';
    if (selectedCode === 'WFH') code = 'WFH';
    else if (selectedCode === 'TL') code = 'TL';
    else if (selectedCode === 'I') code = 'I';
    else if (selectedCode === 'S') code = 'S';

    onApplyCodeToSelected(code, isInpatient);
  };

  return (
    <div className="bg-white rounded-[10px] border border-[#E3E8EF] shadow-2xs p-3 flex flex-col gap-3">
      {/* Top Row: Search & Filters & Batch Code Application (matching Python Qt Control Card) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-query"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama, ID, tanggal, atau status…"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#C9D3DF] rounded-[7px] text-[#17324D] placeholder-slate-400 focus:outline-none focus:border-[#1D73E8]"
          />
        </div>

        {/* Filter Mode Combo */}
        <div className="flex items-center gap-1.5">
          <select
            id="select-filter-mode"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="text-xs bg-white border border-[#C9D3DF] rounded-[7px] px-2.5 py-1.5 text-[#17324D] font-medium focus:outline-none focus:border-[#1D73E8]"
          >
            <option value="all">Semua</option>
            <option value="issues">Perlu Review</option>
            <option value="deduction">Ada Potongan</option>
            <option value="incomplete">Finger Tidak Lengkap</option>
          </select>
        </div>

        {/* Separator / Spacing */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        {/* Batch Code Application Tools (Qt QComboBox + QCheckBox + QPushButton) */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-[#17324D] whitespace-nowrap">
            Kode pilihan:
          </label>

          <select
            id="select-code-choice"
            value={selectedCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="text-xs bg-white border border-[#C9D3DF] rounded-[7px] px-2.5 py-1.5 text-[#17324D] font-medium focus:outline-none focus:border-[#1D73E8]"
          >
            <option value="none">— Hapus kode —</option>
            <option value="WFH">WFH (Work From Home)</option>
            <option value="TL">TL (Tugas Luar)</option>
            <option value="I">I (Izin)</option>
            <option value="S">S (Sakit)</option>
          </select>

          <label className="inline-flex items-center gap-1.5 text-xs text-[#17324D] select-none cursor-pointer">
            <input
              type="checkbox"
              checked={isInpatient}
              disabled={selectedCode !== 'S'}
              onChange={(e) => setIsInpatient(e.target.checked)}
              className="rounded text-[#1D73E8] focus:ring-0 disabled:opacity-40"
            />
            <span className={selectedCode !== 'S' ? 'text-slate-400' : 'font-medium'}>
              Rawat inap
            </span>
          </label>

          <button
            id="btn-apply-code"
            type="button"
            onClick={handleApplyClick}
            disabled={selectedCount === 0}
            className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold border transition shadow-2xs ${
              selectedCount > 0
                ? 'bg-blue-50 text-[#1D73E8] border-blue-300 hover:bg-blue-100 font-bold'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title="Terapkan kode ke baris terpilih"
          >
            Terapkan {selectedCount > 0 && `(${selectedCount})`}
          </button>

          <button
            id="btn-edit-position-quick"
            type="button"
            onClick={onOpenPositionsModal}
            className="px-2.5 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
          >
            Isi Jabatan
          </button>

          <button
            id="btn-toggle-holiday-quick"
            type="button"
            onClick={onToggleHolidaysForSelected}
            disabled={selectedCount === 0}
            className="px-2.5 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs disabled:opacity-40"
            title="Atur status hari libur untuk tanggal baris terpilih"
          >
            Atur Hari Libur
          </button>
        </div>
      </div>

      {/* Bottom Row: View Mode Switcher */}
      <div className="flex items-center justify-between border-t border-[#E3E8EF] pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#66788A] mr-1">Tampilan:</span>

          <button
            id="tab-daily-table"
            type="button"
            onClick={() => onViewModeChange('daily_table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition ${
              viewMode === 'daily_table'
                ? 'bg-[#17324D] text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#C9D3DF]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel Kalkulasi Harian (PySide6 TableView)</span>
          </button>

          <button
            id="tab-monthly-summary"
            type="button"
            onClick={() => onViewModeChange('monthly_summary')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition ${
              viewMode === 'monthly_summary'
                ? 'bg-[#17324D] text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#C9D3DF]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rekapitulasi Bulanan Pegawai</span>
          </button>

          <button
            id="tab-calendar-matrix"
            type="button"
            onClick={() => onViewModeChange('calendar_matrix')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold transition ${
              viewMode === 'calendar_matrix'
                ? 'bg-[#17324D] text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#C9D3DF]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Matriks Kehadiran 31 Hari</span>
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="text-xs font-medium text-[#1D73E8]">
            <CheckSquare className="w-3.5 h-3.5 inline mr-1" />
            {selectedCount} baris terpilih
          </div>
        )}
      </div>
    </div>
  );
};
