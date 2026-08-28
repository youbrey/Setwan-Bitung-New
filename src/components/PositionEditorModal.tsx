import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Users } from 'lucide-react';
import { Employee } from '../types';

interface PositionEditorModalProps {
  employees: Employee[];
  onSaveEmployees: (updated: Employee[]) => void;
  onClose: () => void;
}

export const PositionEditorModal: React.FC<PositionEditorModalProps> = ({
  employees,
  onSaveEmployees,
  onClose,
}) => {
  const [list, setList] = useState<Employee[]>(() => JSON.parse(JSON.stringify(employees)));

  const handleUpdate = (index: number, field: keyof Employee, value: any) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const handleAdd = () => {
    const nextId = String(Math.max(100, ...list.map((e) => parseInt(e.fingerId, 10) || 0)) + 1);
    setList([
      ...list,
      {
        fingerId: nextId,
        name: 'Pegawai Baru',
        nip: '',
        position: 'Staf Sekretariat DPRD',
        golongan: 'III/a',
        department: 'Bagian Umum dan Keuangan',
        basicTpp: 4000000,
      },
    ]);
  };

  const handleDelete = (index: number) => {
    if (confirm('Hapus pegawai ini dari daftar master?')) {
      setList(list.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    onSaveEmployees(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#17324D] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">Master Data Pegawai & Pagu TPP</h3>
              <p className="text-xs text-slate-300">
                Kelola NIP, Golongan, Jabatan, dan Besaran Pagu TPP Sekretariat DPRD Kota Bitung
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-slate-500">
              Total Pegawai: <strong className="text-slate-800">{list.length} orang</strong>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pegawai</span>
            </button>
          </div>

          <div className="border-2 border-slate-700 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs border border-slate-400">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold border-b-2 border-slate-700">
                  <th className="py-2.5 px-3 w-16 text-center border border-slate-400">ID Finger</th>
                  <th className="py-2.5 px-3 min-w-[160px] border border-slate-400">Nama Lengkap</th>
                  <th className="py-2.5 px-3 min-w-[140px] border border-slate-400">NIP</th>
                  <th className="py-2.5 px-2 w-20 border border-slate-400">Golongan</th>
                  <th className="py-2.5 px-3 min-w-[160px] border border-slate-400">Jabatan</th>
                  <th className="py-2.5 px-3 min-w-[140px] border border-slate-400">Unit / Bagian</th>
                  <th className="py-2.5 px-3 w-28 text-right border border-slate-400">Pagu TPP (Rp)</th>
                  <th className="py-2.5 px-2 w-12 text-center border border-slate-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400 text-slate-900">
                {list.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition">
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.fingerId}
                        onChange={(e) => handleUpdate(idx, 'fingerId', e.target.value)}
                        className="w-full text-xs font-mono text-center p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 font-bold"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.name}
                        onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                        className="w-full text-xs font-bold p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.nip || ''}
                        onChange={(e) => handleUpdate(idx, 'nip', e.target.value)}
                        placeholder="198..."
                        className="w-full text-xs font-mono p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.golongan || ''}
                        onChange={(e) => handleUpdate(idx, 'golongan', e.target.value)}
                        placeholder="IV/a"
                        className="w-full text-xs p-1 text-center font-semibold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-800"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.position || ''}
                        onChange={(e) => handleUpdate(idx, 'position', e.target.value)}
                        placeholder="Kepala Bagian..."
                        className="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="text"
                        value={emp.department || ''}
                        onChange={(e) => handleUpdate(idx, 'department', e.target.value)}
                        placeholder="Bagian..."
                        className="w-full text-xs p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-700"
                      />
                    </td>
                    <td className="py-1.5 px-2 border border-slate-300">
                      <input
                        type="number"
                        step={100000}
                        value={emp.basicTpp || 0}
                        onChange={(e) => handleUpdate(idx, 'basicTpp', Number(e.target.value))}
                        className="w-full text-xs font-mono text-right font-bold p-1 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDelete(idx)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            id="btn-save-master-positions"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan Master</span>
          </button>
        </div>
      </div>
    </div>
  );
};
