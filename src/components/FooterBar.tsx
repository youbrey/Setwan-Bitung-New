import React, { useState } from 'react';
import { Printer, FileSpreadsheet, RotateCcw } from 'lucide-react';

interface FooterBarProps {
  statusMessage: string;
  hasData: boolean;
  onPrint: () => void;
  onExportExcel: () => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({
  statusMessage,
  hasData,
  onPrint,
  onExportExcel,
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState('PDF / System Print (A4 Landscape)');
  const printerList = [
    'PDF / System Print (A4 Landscape)',
    'Epson L3210 Series (USB001)',
    'Canon LBP6030 / IP (Network)',
    'HP LaserJet Pro M404n (Network)',
  ];
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPrinters = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <footer className="bg-white border-t border-[#E3E8EF] shadow-2xs mt-auto py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: StatusLabel */}
        <div className="flex items-center gap-2 text-xs text-[#66788A] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span id="status-label" className="text-[#17324D]">{statusMessage}</span>
        </div>

        {/* Right: Printer & Action Buttons matching Python Qt Footer */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Printer ComboBox */}
          <div className="flex items-center gap-1.5">
            <select
              id="select-printer"
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
              className="text-xs bg-white border border-[#C9D3DF] rounded-[7px] px-2.5 py-1.5 text-[#17324D] font-medium min-w-[200px] focus:outline-none focus:border-[#1D73E8]"
            >
              {printerList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <button
              id="btn-refresh-printers"
              type="button"
              onClick={handleRefreshPrinters}
              className="px-2.5 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs"
              title="Perbarui Daftar Printer"
            >
              <span className="flex items-center gap-1">
                <RotateCcw className={`w-3 h-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Muat Ulang</span>
              </span>
            </button>
          </div>

          {/* Cetak Ringkasan Button */}
          <button
            id="btn-print-summary-footer"
            type="button"
            onClick={onPrint}
            disabled={!hasData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Ringkasan</span>
          </button>

          {/* Ekspor Excel (PrimaryButton #1D73E8) */}
          <button
            id="btn-export-excel-footer"
            type="button"
            onClick={onExportExcel}
            disabled={!hasData}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[7px] text-xs font-semibold bg-[#1D73E8] hover:bg-[#155FC0] text-white border border-[#1D73E8] transition shadow-2xs disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
