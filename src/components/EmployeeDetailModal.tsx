import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Save,
  Calendar,
} from 'lucide-react';
import { DayOverride, EmployeeMonthlySummary, SpecialCode } from '../types';
import { formatIndonesianDate, getDayNameId, parseDate } from '../domain/calendar';

interface EmployeeDetailModalProps {
  summary: EmployeeMonthlySummary;
  dates: string[];
  initialDate?: string;
  onSaveOverride: (fingerId: string, workDate: string, override: DayOverride) => void;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  summary,
  dates,
  initialDate,
  onSaveOverride,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || dates[0]);
  const activeCalc = summary.dailyCalculations[selectedDate];

  // Override Form State for selected date
  const [overrideCode, setOverrideCode] = useState<SpecialCode>(
    activeCalc?.override.code || ''
  );
  const [inpatient, setInpatient] = useState<boolean>(
    activeCalc?.override.inpatient || false
  );
  const [reason, setReason] = useState<string>(
    activeCalc?.override.reason || ''
  );

  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
    const calc = summary.dailyCalculations[d];
    setOverrideCode(calc?.override.code || '');
    setInpatient(calc?.override.inpatient || false);
    setReason(calc?.override.reason || '');
  };

  const handleSave = () => {
    onSaveOverride(summary.employee.fingerId, selectedDate, {
      code: overrideCode,
      inpatient: overrideCode === 'S' ? inpatient : false,
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#17324D] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">{summary.employee.name}</h3>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
                ID: {summary.employee.fingerId}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {summary.employee.position || 'Staf'} · {summary.employee.department || 'Sekretariat DPRD Kota Bitung'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: 31-Day List */}
          <div className="md:col-span-6 border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 font-semibold text-xs text-slate-700 flex items-center justify-between">
              <span>Daftar Hari Dalam Periode</span>
              <span className="text-[11px] text-slate-500 font-normal">Klik tanggal untuk edit</span>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[380px]">
              {dates.map((dateStr) => {
                const calc = summary.dailyCalculations[dateStr];
                const isSelected = dateStr === selectedDate;
                const d = parseDate(dateStr);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleSelectDate(dateStr)}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    } ${isWeekend ? 'opacity-60 bg-slate-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {getDayNameId(dateStr).slice(0, 3)}, {dateStr.slice(8)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {calc?.issues.length > 0 && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          calc?.deductions.total > 0
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : isWeekend
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isWeekend ? 'Libur' : `${calc?.deductions.total || 0}%`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Inspection & Override Editor */}
          <div className="md:col-span-6 flex flex-col gap-4">
            {activeCalc ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                {/* Day Header */}
                <div className="border-b border-slate-200 pb-3">
                  <div className="text-xs text-slate-500 font-medium">
                    {getDayNameId(selectedDate)}, {formatIndonesianDate(selectedDate)}
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 flex items-center justify-between">
                    <span>Status: {activeCalc.status}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        activeCalc.deductions.total > 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Potongan: {activeCalc.deductions.total}%
                    </span>
                  </div>
                </div>

                {/* Finger Machine Log Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Jam Masuk</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {activeCalc.entry.inTime || '— (Tidak Scan)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Jam Pulang</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {activeCalc.entry.outTime || '— (Tidak Scan)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Potongan Masuk (TL)</span>
                    <span className="font-semibold text-slate-700">
                      {activeCalc.deductions.late}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Potongan Pulang (PSW)</span>
                    <span className="font-semibold text-slate-700">
                      {activeCalc.deductions.early}%
                    </span>
                  </div>
                </div>

                {/* Issues Warning */}
                {activeCalc.issues.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Catatan / Issue Terdeteksi:</span>
                    </div>
                    {activeCalc.issues.map((issue, i) => (
                      <div key={i} className="pl-5 text-[11px]">
                        • {issue.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Override Controls */}
                <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800">
                    Koreksi / Status Khusus (Override)
                  </h4>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Pilih Status Khusus:
                    </label>
                    <select
                      id="select-override-code"
                      value={overrideCode}
                      onChange={(e) => setOverrideCode(e.target.value as SpecialCode)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium"
                    >
                      <option value="">Otomatis (Sesuai Log Mesin Finger)</option>
                      <option value="WFH">WFH / W - Work From Home (Bebas Potongan 0% & Dianggap Masuk)</option>
                      <option value="TL">TL - Tugas Luar / Perjalanan Dinas (Potongan 0%)</option>
                      <option value="I">I - Izin Disetujui (Potongan 3.00%)</option>
                      <option value="S">S - Sakit (Rawat Inap 0% / Bebas Potongan)</option>
                    </select>
                  </div>

                  {overrideCode === 'S' && (
                    <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-200 text-xs text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inpatient}
                        onChange={(e) => setInpatient(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Ada Bukti Rawat Inap (Bebas Potongan 0%)</span>
                    </label>
                  )}

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Keterangan / Nomor Surat Tugas / Bukti:
                    </label>
                    <textarea
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Contoh: SPT No. 090/SETWAN/VIII/2026 atau Surat Keterangan Dokter..."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                    />
                  </div>

                  <button
                    id="btn-save-override"
                    onClick={handleSave}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Koreksi Tanggal Ini</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">Pilih tanggal di sebelah kiri.</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Total Potongan Pegawai: <strong className="text-rose-600">{summary.totalDeductionPct.toFixed(2)}%</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
