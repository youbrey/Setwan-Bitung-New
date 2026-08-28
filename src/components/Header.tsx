import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  BookOpen,
  Settings,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { LogoKotaBitung } from './LogoKotaBitung';

interface HeaderProps {
  onReset: () => void;
  onOpenPositions: () => void;
  onOpenSigner: () => void;
  onOpenRules: () => void;
  onOpenPrint: () => void;
  onExportExcel: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onOpenPositions,
  onOpenSigner,
  onOpenRules,
  onOpenPrint,
  onExportExcel,
  hasData,
}) => {
  return (
    <header className="bg-white border-b border-[#E3E8EF] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: App Title & Subtitle matching Python UI */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-13 flex-shrink-0 flex items-center justify-center p-0.5 bg-slate-50 rounded-lg border border-[#C9D3DF] shadow-2xs">
            <LogoKotaBitung className="w-10 h-12" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#102A43]">
                Rekapitulasi TPP PNS
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087443] bg-[#DDF5E8] border border-[#B7E7CE] px-3 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#087443] animate-pulse"></span>
                OFFLINE ENGINE
              </span>
            </div>
            <p className="text-xs text-[#66788A] font-medium mt-0.5">
              Sekretariat DPRD Kota Bitung · Sistem Rekap Disiplin Kehadiran & Potongan TPP
            </p>
          </div>
        </div>

        {/* Right: Action Buttons in Qt QPushButton Style */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            id="btn-rule-notes"
            onClick={onOpenRules}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
            title="Lihat Aturan dan Matriks Perhitungan"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1D73E8]" />
            <span>Aturan TPP</span>
          </button>

          <button
            id="btn-master-positions"
            onClick={onOpenPositions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
            title="Kelola Data Pegawai, Jabatan, & Pagu TPP"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            <span>Master Pegawai</span>
          </button>

          {hasData && (
            <>
              <button
                id="btn-signer-config"
                onClick={onOpenSigner}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
                title="Atur Pejabat Penandatangan Dokumen"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Penandatangan</span>
              </button>

              <button
                id="btn-print-recap"
                onClick={onOpenPrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak Ringkasan</span>
              </button>

              <button
                id="btn-export-excel"
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] text-xs font-semibold bg-[#1D73E8] hover:bg-[#155FC0] text-white border border-[#1D73E8] transition shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Ekspor Excel</span>
              </button>

              <button
                id="btn-reset-session"
                onClick={onReset}
                className="p-1.5 rounded-[7px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                title="Kosongkan Data Aktif"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
