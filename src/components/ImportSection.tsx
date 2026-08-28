import React, { useRef, useState } from 'react';
import { CheckCircle2, Upload, Sparkles } from 'lucide-react';
import { formatIndonesianDate } from '../domain/calendar';

interface ImportSectionProps {
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
  fileName?: string;
  periodStart?: string;
  periodEnd?: string;
  totalEmployees?: number;
}

export const ImportSection: React.FC<ImportSectionProps> = ({
  onFileSelect,
  onLoadSample,
  isLoading,
  fileName,
  periodStart,
  periodEnd,
  totalEmployees,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualPath, setManualPath] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setManualPath(file.name);
      onFileSelect(file);
    }
  };

  const handleProcessClick = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-[10px] border border-[#E3E8EF] shadow-2xs p-4 sm:p-5">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Input Bar Form matching Python Qt QFrame#Card */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <label className="text-xs font-bold text-[#17324D] whitespace-nowrap min-w-[135px]">
            Dokumen finger scan:
          </label>

          <div className="flex-1 relative">
            <input
              id="input-pdf-path"
              type="text"
              readOnly
              value={manualPath || fileName || ''}
              placeholder="Pilih PDF hasil finger scan…"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white border border-[#C9D3DF] rounded-[7px] px-3 py-2 text-xs text-[#17324D] placeholder-slate-400 focus:outline-none focus:border-[#1D73E8] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-browse-pdf"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-[7px] text-xs font-semibold bg-white hover:bg-[#F0F5FA] text-[#17324D] border border-[#C9D3DF] transition shadow-2xs whitespace-nowrap"
            >
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Pilih PDF
              </span>
            </button>

            <button
              id="btn-process-pdf"
              type="button"
              onClick={handleProcessClick}
              disabled={isLoading}
              className="px-4 py-2 rounded-[7px] text-xs font-semibold bg-[#1D73E8] hover:bg-[#155FC0] text-white border border-[#1D73E8] transition shadow-2xs whitespace-nowrap"
            >
              {isLoading ? 'Memproses...' : 'Proses Dokumen'}
            </button>
          </div>
        </div>

        {/* Quick Sample Button */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-[#E3E8EF] pt-2 lg:pt-0 lg:pl-3.5">
          <button
            id="btn-load-sample"
            type="button"
            onClick={onLoadSample}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[7px] text-xs font-semibold bg-[#F5F7FA] hover:bg-[#EBF3FC] text-[#17324D] border border-[#C9D3DF] transition whitespace-nowrap"
            title="Muat Data Sampel Riil PNS Sekretariat DPRD Kota Bitung"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Muat Sampel Setwan</span>
          </button>
        </div>
      </div>

      {/* Active File Period Info */}
      {fileName && periodStart && periodEnd && (
        <div className="mt-3 pt-3 border-t border-[#E3E8EF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#66788A]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-bold text-[#087443] bg-[#DDF5E8] px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-[#087443]" />
              Dokumen Aktif
            </span>
            <span className="font-semibold text-[#17324D]">{fileName}</span>
          </div>

          <div>
            Periode: <strong className="text-[#17324D]">{formatIndonesianDate(periodStart)}</strong> s/d{' '}
            <strong className="text-[#17324D]">{formatIndonesianDate(periodEnd)}</strong> ·{' '}
            <strong className="text-[#17324D]">{totalEmployees}</strong> Pegawai Terdaftar
          </div>
        </div>
      )}
    </div>
  );
};
