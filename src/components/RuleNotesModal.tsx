import React from 'react';
import { X, BookOpen, Clock, FileCheck } from 'lucide-react';

interface RuleNotesModalProps {
  onClose: () => void;
}

export const RuleNotesModal: React.FC<RuleNotesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#17324D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">Catatan Aturan Disiplin Kerja TPP</h3>
              <p className="text-xs text-slate-300">
                Dasar Perhitungan Potongan Kehadiran Sekretariat DPRD Kota Bitung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Section 1: Jam Kerja */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>1. Jadwal Jam Kerja Resmi</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-600">
              <li>
                <strong>Senin s/d Kamis:</strong> 07.30 - 16.45 WITA
              </li>
              <li>
                <strong>Jumat:</strong> 07.30 - 12.00 WITA
              </li>
              <li>
                <strong>Sabtu, Minggu & Hari Libur Nasional:</strong> Tidak dihitung dalam hari kerja efektif.
              </li>
            </ul>
          </div>

          {/* Section 2: Terlambat Masuk (TL) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-amber-50 px-4 py-2.5 border-b border-slate-200 font-bold text-amber-900">
              2. Matriks Potongan Terlambat Masuk (TL)
            </div>
            <div className="p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-1.5 px-2">Rentang Waktu Scan Masuk</th>
                    <th className="py-1.5 px-2 text-center">Persentase Potongan</th>
                    <th className="py-1.5 px-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-2 font-mono">07.30 ke bawah</td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-600">0.00%</td>
                    <td className="py-2 px-2 text-slate-500">Hadir Tepat Waktu (HD)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">07.31 - 07.39</td>
                    <td className="py-2 px-2 text-center font-bold text-slate-600">0.00%</td>
                    <td className="py-2 px-2 text-amber-600 font-medium">Toleransi masuk (Perlu review)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">07.40 - 08.00</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">0.50%</td>
                    <td className="py-2 px-2 text-slate-500">Terlambat Kategori 1</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">08.01 - 08.30</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.00%</td>
                    <td className="py-2 px-2 text-slate-500">Terlambat Kategori 2</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">08.31 - 09.00</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.25%</td>
                    <td className="py-2 px-2 text-slate-500">Terlambat Kategori 3</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">&gt; 09.00 / Tidak Scan Masuk</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.50%</td>
                    <td className="py-2 px-2 text-slate-500">Terlambat Maksimal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Pulang Sebelum Waktu (PSW) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-indigo-50 px-4 py-2.5 border-b border-slate-200 font-bold text-indigo-900">
              3. Matriks Potongan Pulang Sebelum Waktu (PSW)
            </div>
            <div className="p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-1.5 px-2">Rentang Jam Scan Pulang (Senin-Kamis)</th>
                    <th className="py-1.5 px-2 text-center">Persentase Potongan</th>
                    <th className="py-1.5 px-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-2 font-mono">16.45 ke atas</td>
                    <td className="py-2 px-2 text-center font-bold text-emerald-600">0.00%</td>
                    <td className="py-2 px-2 text-slate-500">Pulang Sesuai Waktu</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">16.31 - 16.44</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">0.50%</td>
                    <td className="py-2 px-2 text-slate-500">PSW Kategori 1</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">16.01 - 16.30</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.00%</td>
                    <td className="py-2 px-2 text-slate-500">PSW Kategori 2</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">15.31 - 16.00</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.25%</td>
                    <td className="py-2 px-2 text-slate-500">PSW Kategori 3</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">15.00 - 15.30</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.50%</td>
                    <td className="py-2 px-2 text-slate-500">PSW Kategori 4</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-mono">&lt; 15.00 / Tidak Scan Pulang</td>
                    <td className="py-2 px-2 text-center font-bold text-rose-600">1.55%</td>
                    <td className="py-2 px-2 text-slate-500">PSW Maksimal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Ketidakhadiran & Status Khusus */}
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-300">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>4. Ketentuan Ketidakhadiran, WFH, Izin, Sakit & Tugas Luar</span>
            </div>
            <ul className="space-y-2 list-disc list-inside text-slate-700">
              <li className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-300">
                <strong className="text-emerald-950">Work From Home (Kode WFH / W):</strong> Tidak dikenakan potongan (<strong>Potongan 0.00%</strong>) dan <strong>dianggap hadir/masuk bekerja (HD)</strong> serta diakumulasikan dalam rekap kehadiran efektif.
              </li>
              <li>
                <strong>Tugas Luar / Perjalanan Dinas (Kode TL):</strong> Potongan <strong>0.00%</strong> dan dianggap hadir dengan melampirkan Surat Perintah Tugas (SPT).
              </li>
              <li>
                <strong>Sakit (Kode S):</strong> Bebas potongan (<strong>0.00%</strong>) apabila melampirkan <strong>Bukti Rawat Inap Rumah Sakit</strong>. Tanpa rawat inap akan diverifikasi lebih lanjut.
              </li>
              <li>
                <strong>Izin (Kode I):</strong> Dikenakan potongan sebesar <strong>3.00%</strong> per hari kerja.
              </li>
              <li>
                <strong>Tidak Masuk Kerja (Kode TK / Alpha):</strong> Dikenakan potongan sebesar <strong>3.00%</strong> per hari kerja tidak hadir.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
