import React from 'react';
import { X, Printer } from 'lucide-react';
import { EmployeeMonthlySummary, SignerProfile } from '../types';
import { formatIndonesianDate } from '../domain/calendar';

interface PrintSummaryModalProps {
  summaries: EmployeeMonthlySummary[];
  periodStart: string;
  periodEnd: string;
  signer: SignerProfile;
  onClose: () => void;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  summaries,
  periodStart,
  periodEnd,
  signer,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalPotonganNominal = summaries.reduce((acc, s) => {
    const basic = s.employee.basicTpp || 0;
    return acc + Math.round((basic * s.totalDeductionPct) / 100);
  }, 0);

  const totalPaguNominal = summaries.reduce((acc, s) => acc + (s.employee.basicTpp || 0), 0);
  const totalBersihNominal = totalPaguNominal - totalPotonganNominal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none print:max-h-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3 bg-[#17324D] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Pratinjau Format Cetak Dokumen Rekapitulasi TPP</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 font-serif text-slate-900 bg-white print:p-4">
          {/* Official Header / Kop Surat */}
          <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-3 mb-4">
            <div className="w-16 h-18 flex-shrink-0 flex items-center justify-center">
              <img src="/logo_kota_bitung.svg" alt="Logo Bitung" className="w-14 h-16 object-contain" />
            </div>
            <div className="flex-1 text-center pr-12">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">PEMERINTAH KOTA BITUNG</h2>
              <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH
              </h1>
              <p className="text-[11px] italic text-slate-600 mt-0.5">
                Jalan Sam Ratulangi No. 45, Kota Bitung, Sulawesi Utara 95511 · Telp/Fax: (0438) 21101
              </p>
            </div>
          </div>

          <div className="text-center my-4">
            <h3 className="text-sm font-bold uppercase underline text-slate-900">
              REKAPITULASI PEMOTONGAN TUNJANGAN PENAMBAHAN PENGHASILAN (TPP)
            </h3>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Berdasarkan Disiplin Kehadiran Kerja Finger Scan Periode:{' '}
              <strong>{formatIndonesianDate(periodStart)}</strong> s/d{' '}
              <strong>{formatIndonesianDate(periodEnd)}</strong>
            </p>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse text-[11px] font-sans border-2 border-slate-900 my-4">
            <thead>
              <tr className="bg-slate-200 text-center font-bold border-b-2 border-slate-900 text-slate-900">
                <th className="border border-slate-700 p-1.5 w-7">No</th>
                <th className="border border-slate-700 p-1.5">Nama Pegawai / NIP / Gol</th>
                <th className="border border-slate-700 p-1.5">Jabatan</th>
                <th className="border border-slate-700 p-1.5 w-9" title="Hari Kerja Efektif">HK</th>
                <th className="border border-slate-700 p-1.5 w-9" title="Hari Hadir">HD</th>
                <th className="border border-slate-700 p-1.5 w-9 bg-teal-50" title="Work From Home">WFH</th>
                <th className="border border-slate-700 p-1.5 w-12">TL (%)</th>
                <th className="border border-slate-700 p-1.5 w-12">PSW (%)</th>
                <th className="border border-slate-700 p-1.5 w-12">TK (%)</th>
                <th className="border border-slate-700 p-1.5 w-12 bg-slate-300 font-extrabold">Tot Pot (%)</th>
                <th className="border border-slate-700 p-1.5 text-right w-22">Pagu TPP (Rp)</th>
                <th className="border border-slate-700 p-1.5 text-right w-22">Potongan (Rp)</th>
                <th className="border border-slate-700 p-1.5 text-right w-22 font-extrabold bg-emerald-50">TPP Diterima</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((sum, idx) => {
                const basic = sum.employee.basicTpp || 0;
                const potRupiah = Math.round((basic * sum.totalDeductionPct) / 100);
                const netTpp = basic - potRupiah;

                return (
                  <tr key={sum.employee.fingerId} className="border-b border-slate-600 hover:bg-slate-50">
                    <td className="border border-slate-700 p-1 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="border border-slate-700 p-1">
                      <div className="font-bold text-slate-900">{sum.employee.name}</div>
                      <div className="text-[10px] text-slate-600">
                        NIP. {sum.employee.nip || '-'} ({sum.employee.golongan || '-'})
                      </div>
                    </td>
                    <td className="border border-slate-700 p-1 text-[10px]">{sum.employee.position || 'Staf'}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono">{sum.totalWorkdays}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono font-bold">{sum.presentDays}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono">{sum.wfhDays > 0 ? `${sum.wfhDays}` : '-'}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono">{sum.lateDeduction > 0 ? `${sum.lateDeduction.toFixed(2)}%` : '-'}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono">{sum.earlyDeduction > 0 ? `${sum.earlyDeduction.toFixed(2)}%` : '-'}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono">{sum.absenceDeduction > 0 ? `${sum.absenceDeduction.toFixed(2)}%` : '-'}</td>
                    <td className="border border-slate-700 p-1 text-center font-mono font-extrabold bg-slate-100">
                      {sum.totalDeductionPct.toFixed(2)}%
                    </td>
                    <td className="border border-slate-700 p-1 text-right font-mono">
                      {basic.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-700 p-1 text-right font-mono text-rose-700 font-bold">
                      {potRupiah.toLocaleString('id-ID')}
                    </td>
                    <td className="border border-slate-700 p-1 text-right font-mono font-extrabold text-slate-900 bg-emerald-50/50">
                      {netTpp.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 font-extrabold border-t-2 border-slate-900 text-slate-900">
                <td colSpan={10} className="border border-slate-700 p-1.5 text-center">
                  JUMLAH TOTAL
                </td>
                <td className="border border-slate-700 p-1.5 text-right font-mono">
                  Rp {totalPaguNominal.toLocaleString('id-ID')}
                </td>
                <td className="border border-slate-700 p-1.5 text-right font-mono text-rose-800">
                  Rp {totalPotonganNominal.toLocaleString('id-ID')}
                </td>
                <td className="border border-slate-700 p-1.5 text-right font-mono font-extrabold text-slate-900 bg-emerald-100">
                  Rp {totalBersihNominal.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-2 mt-8 text-xs font-sans">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-semibold">Sekretaris DPRD Kota Bitung</p>
              <div className="h-16"></div>
              <p className="font-bold underline">RITA E. SUMAMPOUW, SE</p>
              <p>NIP. 197204121998032004</p>
            </div>

            <div className="text-center">
              <p>
                {signer.city}, {formatIndonesianDate(signer.signDate || periodEnd)}
              </p>
              <p className="font-semibold">{signer.title}</p>
              <div className="h-16"></div>
              <p className="font-bold underline">{signer.name}</p>
              <p>NIP. {signer.nip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
