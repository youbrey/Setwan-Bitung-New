import { useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { ImportSection } from './components/ImportSection';
import { ControlsBar, ViewMode } from './components/ControlsBar';
import { AttendanceTable } from './components/AttendanceTable';
import { FooterBar } from './components/FooterBar';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { PositionEditorModal } from './components/PositionEditorModal';
import { PrintSummaryModal } from './components/PrintSummaryModal';
import { RuleNotesModal } from './components/RuleNotesModal';
import { SignerConfigModal } from './components/SignerConfigModal';
import { DayOverride, Employee, ImportResult, SignerProfile, SpecialCode } from './types';
import { generateSampleImportResult } from './domain/sampleData';
import { parsePdfFile } from './infrastructure/pdfParser';
import { exportRecapToExcel } from './infrastructure/excelExporter';
import {
  DEFAULT_SIGNER,
  computeMonthlySummaries,
  loadOverridesFromStorage,
  saveOverridesToStorage,
} from './application/services';

export function App() {
  // Main Data States
  const [importResult, setImportResult] = useState<ImportResult | null>(() => {
    return generateSampleImportResult();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Record<string, DayOverride>>>(() => {
    return loadOverridesFromStorage('2026-08');
  });
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [signer, setSigner] = useState<SignerProfile>(DEFAULT_SIGNER);

  // Filters & View Mode States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('daily_table');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Modals state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | undefined>(undefined);
  const [showPositionsModal, setShowPositionsModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSignerModal, setShowSignerModal] = useState(false);

  // Dynamic Status Label state
  const [statusMessage, setStatusMessage] = useState<string>('Pilih PDF untuk memulai.');

  // Compute monthly calculations and summaries
  const { summaries, dates } = useMemo(() => {
    if (!importResult) {
      return { summaries: [], dates: [], totalWorkdays: 0 };
    }
    return computeMonthlySummaries(importResult, overrides, customHolidays);
  }, [importResult, overrides, customHolidays]);

  // Total review issues count across all entries
  const totalReviewCount = useMemo(() => {
    let count = 0;
    summaries.forEach((sum) => {
      dates.forEach((dateStr) => {
        const calc = sum.dailyCalculations[dateStr];
        if (calc && (!calc.finalizable || calc.issues.length > 0)) {
          count++;
        }
      });
    });
    return count;
  }, [summaries, dates]);

  // Update status message when data changes
  useMemo(() => {
    if (importResult) {
      setStatusMessage(
        `Selesai memproses ${importResult.employees.length} pegawai. ${totalReviewCount} baris memerlukan review.`
      );
    } else {
      setStatusMessage('Pilih PDF untuk memulai.');
    }
  }, [importResult, totalReviewCount]);

  // Filter summaries based on user query and filter mode
  const filteredSummaries = useMemo(() => {
    if (!importResult) return [];

    return summaries.filter((sum) => {
      // 1. Search Query filter (name, NIP, fingerId, status)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = sum.employee.name.toLowerCase().includes(q);
        const matchNip = sum.employee.nip?.toLowerCase().includes(q) || false;
        const matchId = sum.employee.fingerId.toLowerCase().includes(q);
        const matchStatus = dates.some((d) => {
          const calc = sum.dailyCalculations[d];
          return (
            calc?.status.toLowerCase().includes(q) ||
            calc?.issues.some((i) => i.message.toLowerCase().includes(q))
          );
        });

        if (!matchName && !matchNip && !matchId && !matchStatus) return false;
      }

      // 2. Status filter
      if (statusFilter === 'issues') {
        return sum.hasIssues;
      }
      if (statusFilter === 'deduction') {
        return sum.totalDeductionPct > 0;
      }
      if (statusFilter === 'incomplete') {
        return dates.some((d) => {
          const state = sum.dailyCalculations[d]?.entry.state;
          return state === 'MISSING_IN' || state === 'MISSING_OUT' || state === 'MISSING_BOTH';
        });
      }

      return true;
    });
  }, [summaries, searchQuery, statusFilter, dates, importResult]);

  // Handle PDF file upload
  const handlePdfUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parsePdfFile(file);
      setImportResult(result);
      const storageKey = result.periodStart.slice(0, 7);
      setOverrides(loadOverridesFromStorage(storageKey));
      setSelectedKeys(new Set());
      setStatusMessage(`Selesai memproses ${result.employees.length} pegawai.`);
    } catch (err: any) {
      alert(`Gagal memproses file PDF: ${err.message || 'Format tidak dikenali'}`);
      setStatusMessage('Impor gagal. Periksa format PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sample Load
  const handleLoadSample = () => {
    const sample = generateSampleImportResult();
    setImportResult(sample);
    setOverrides(loadOverridesFromStorage('2026-08'));
    setSelectedKeys(new Set());
    setStatusMessage(`Selesai memproses ${sample.employees.length} pegawai dari sampel data.`);
  };

  // Handle Reset
  const handleResetSession = () => {
    if (confirm('Kosongkan dokumen aktif dan mulai ulang?')) {
      setImportResult(null);
      setOverrides({});
      setSelectedKeys(new Set());
      setStatusMessage('Pilih PDF untuk memulai.');
    }
  };

  // Selection toggle callbacks
  const handleToggleKey = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleSelectAllKeys = useCallback((keys: string[]) => {
    setSelectedKeys(new Set(keys));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  // Handle Save Override for an employee on a specific date
  const handleSaveOverride = (fingerId: string, workDate: string, override: DayOverride) => {
    const updated = {
      ...overrides,
      [fingerId]: {
        ...(overrides[fingerId] || {}),
        [workDate]: override,
      },
    };
    setOverrides(updated);
    if (importResult) {
      saveOverridesToStorage(importResult.periodStart.slice(0, 7), updated);
    }
  };

  // Batch Apply Code (WFH, TL, I, S, etc.)
  const handleApplyCodeToSelected = (code: SpecialCode, inpatient?: boolean) => {
    if (selectedKeys.size === 0) return;

    const nextOverrides = { ...overrides };
    selectedKeys.forEach((key) => {
      const [fingerId, workDate] = key.split('|');
      if (!nextOverrides[fingerId]) {
        nextOverrides[fingerId] = {};
      }
      nextOverrides[fingerId][workDate] = {
        code,
        inpatient: code === 'S' ? Boolean(inpatient) : false,
      };
    });

    setOverrides(nextOverrides);
    if (importResult) {
      saveOverridesToStorage(importResult.periodStart.slice(0, 7), nextOverrides);
    }
    setStatusMessage(`Kode ${code || 'dihapus'} diterapkan ke ${selectedKeys.size} baris.`);
  };

  // Toggle Holiday status for dates of selected items
  const handleToggleHolidaysForSelected = () => {
    if (selectedKeys.size === 0) return;

    const datesToToggle = new Set<string>();
    selectedKeys.forEach((key) => {
      const [, workDate] = key.split('|');
      if (workDate) datesToToggle.add(workDate);
    });

    const isAllHoliday = Array.from(datesToToggle).every((d) => customHolidays.includes(d));
    let nextHolidays: string[];

    if (isAllHoliday) {
      nextHolidays = customHolidays.filter((d) => !datesToToggle.has(d));
      setStatusMessage(`${datesToToggle.size} tanggal dihapus dari hari libur.`);
    } else {
      nextHolidays = Array.from(new Set([...customHolidays, ...Array.from(datesToToggle)]));
      setStatusMessage(`${datesToToggle.size} tanggal ditandai sebagai hari libur.`);
    }

    setCustomHolidays(nextHolidays);
  };

  // Handle Save Employees from Position Editor Modal
  const handleSaveEmployees = (updatedEmployees: Employee[]) => {
    if (!importResult) return;
    setImportResult({
      ...importResult,
      employees: updatedEmployees,
    });
    setStatusMessage(`Master data diperbarui untuk ${updatedEmployees.length} pegawai.`);
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    if (!importResult) return;
    exportRecapToExcel(
      summaries,
      dates,
      importResult.periodStart,
      importResult.periodEnd,
      signer
    );
    setStatusMessage(`Ekspor selesai: Rekap_TPP_${importResult.periodStart.replace(/-/g, '')}_${importResult.periodEnd.replace(/-/g, '')}.xlsx`);
  };

  const selectedSummary = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return summaries.find((s) => s.employee.fingerId === selectedEmployeeId) || null;
  }, [summaries, selectedEmployeeId]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col font-sans selection:bg-[#1D73E8] selection:text-white">
      {/* App Header (Python Qt Style) */}
      <Header
        onReset={handleResetSession}
        onOpenPositions={() => setShowPositionsModal(true)}
        onOpenSigner={() => setShowSignerModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenPrint={() => setShowPrintModal(true)}
        onExportExcel={handleExportExcel}
        hasData={!!importResult}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        {/* Import Document Card (QFrame#Card) */}
        <ImportSection
          onFileSelect={handlePdfUpload}
          onLoadSample={handleLoadSample}
          isLoading={isLoading}
          fileName={importResult?.fileName}
          periodStart={importResult?.periodStart}
          periodEnd={importResult?.periodEnd}
          totalEmployees={importResult?.employees.length}
        />

        {importResult && (
          <>
            {/* 4 Stat Cards (QFrame#StatCard) */}
            <StatsCards
              summaries={summaries}
              totalDaysInPeriod={dates.length}
              totalEntriesCount={importResult.entries.length}
              totalReviewCount={totalReviewCount}
              activeFilter={statusFilter}
              onFilterChange={(f) => setStatusFilter(f)}
            />

            {/* Controls Bar with Batch Actions & View Switcher */}
            <ControlsBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedCount={selectedKeys.size}
              onApplyCodeToSelected={handleApplyCodeToSelected}
              onOpenPositionsModal={() => setShowPositionsModal(true)}
              onToggleHolidaysForSelected={handleToggleHolidaysForSelected}
            />

            {/* Result Table (QTableView#ResultTable) */}
            <AttendanceTable
              summaries={filteredSummaries}
              dates={dates}
              viewMode={viewMode}
              selectedKeys={selectedKeys}
              onToggleKey={handleToggleKey}
              onSelectAllKeys={handleSelectAllKeys}
              onClearSelection={handleClearSelection}
              onSelectEmployeeDate={(fingerId, dateStr) => {
                setSelectedEmployeeId(fingerId);
                setSelectedDateForDetail(dateStr);
              }}
              onQuickApplyCode={(fingerId, dateStr, code, inpatient) => {
                handleSaveOverride(fingerId, dateStr, { code, inpatient });
              }}
            />
          </>
        )}
      </main>

      {/* Footer Bar (Python Qt Style Status & Printers) */}
      <FooterBar
        statusMessage={statusMessage}
        hasData={!!importResult}
        onPrint={() => setShowPrintModal(true)}
        onExportExcel={handleExportExcel}
      />

      {/* Employee Detail & Override Modal */}
      {selectedSummary && (
        <EmployeeDetailModal
          summary={selectedSummary}
          dates={dates}
          initialDate={selectedDateForDetail}
          onSaveOverride={handleSaveOverride}
          onClose={() => {
            setSelectedEmployeeId(null);
            setSelectedDateForDetail(undefined);
          }}
        />
      )}

      {/* Position and Master Employee Editor Modal */}
      {showPositionsModal && importResult && (
        <PositionEditorModal
          employees={importResult.employees}
          onSaveEmployees={handleSaveEmployees}
          onClose={() => setShowPositionsModal(false)}
        />
      )}

      {/* Print Summary Modal */}
      {showPrintModal && importResult && (
        <PrintSummaryModal
          summaries={summaries}
          periodStart={importResult.periodStart}
          periodEnd={importResult.periodEnd}
          signer={signer}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Rule Notes Modal */}
      {showRulesModal && (
        <RuleNotesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* Signer Profile Configuration Modal */}
      {showSignerModal && (
        <SignerConfigModal
          signer={signer}
          onSaveSigner={setSigner}
          onClose={() => setShowSignerModal(false)}
        />
      )}
    </div>
  );
}

export default App;
