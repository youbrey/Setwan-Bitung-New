from __future__ import annotations

from collections import defaultdict
from datetime import timedelta
from html import escape

from PySide6.QtCore import QMarginsF
from PySide6.QtGui import QPageLayout, QPageSize, QTextDocument
from PySide6.QtPrintSupport import QPrinter, QPrinterInfo

from tpp_finger_scan.application.services import RecapSession
from tpp_finger_scan.domain.calendar import schedule_for
from tpp_finger_scan.domain.models import ZERO


class PrinterService:
    @staticmethod
    def available_printers() -> list[str]:
        return sorted(info.printerName() for info in QPrinterInfo.availablePrinters())

    def print_summary(self, session: RecapSession, printer_name: str) -> None:
        if not printer_name:
            raise RuntimeError("Pilih printer sebelum mencetak.")
        available = self.available_printers()
        if printer_name not in available:
            raise RuntimeError(f"Printer tidak lagi tersedia: {printer_name}")

        printer = QPrinter(QPrinter.PrinterMode.HighResolution)
        printer.setPrinterName(printer_name)
        printer.setDocName(
            f"Rekap TPP {session.import_result.period_start:%Y%m%d}-"
            f"{session.import_result.period_end:%Y%m%d}"
        )
        printer.setPageLayout(QPageLayout(
            QPageSize(QPageSize.PageSizeId.A4),
            QPageLayout.Orientation.Landscape,
            QMarginsF(8, 8, 8, 8),
            QPageLayout.Unit.Millimeter,
        ))

        document = QTextDocument()
        document.setDocumentMargin(18)
        document.setHtml(self._summary_html(session))
        document.print_(printer)

    @staticmethod
    def _summary_html(session: RecapSession) -> str:
        start = session.import_result.period_start
        end = session.import_result.period_end
        if (end - start).days >= 2:
            start += timedelta(days=1)
            end -= timedelta(days=1)
        report_dates = set()
        current = start
        while current <= end:
            if schedule_for(current).workday and current not in session.holidays:
                report_dates.add(current)
            current += timedelta(days=1)
        grouped = defaultdict(list)
        for calculation in session.calculations:
            if calculation.entry.work_date in report_dates:
                grouped[calculation.entry.employee.finger_id].append(calculation)

        rows = []
        for number, employee in enumerate(session.import_result.employees, start=1):
            calculations = grouped[employee.finger_id]
            absence = sum((item.deductions.absence for item in calculations), ZERO)
            late = sum((item.deductions.late for item in calculations), ZERO)
            early = sum((item.deductions.early for item in calculations), ZERO)
            review = sum(not item.finalizable for item in calculations)
            wfh_count = sum(
                bool(
                    session.overrides.get((employee.finger_id, item.entry.work_date))
                    and session.overrides[(employee.finger_id, item.entry.work_date)].code
                    in {"WFH", "W"}
                )
                for item in calculations
            )
            rows.append(
                "<tr>"
                f"<td>{number}</td><td>{escape(employee.finger_id)}</td>"
                f"<td style='text-align:left; font-weight:600;'>{escape(employee.name)}</td>"
                f"<td>{wfh_count}</td>"
                f"<td>{absence:.2f}%</td>"
                f"<td>{late:.2f}%</td><td>{early:.2f}%</td>"
                f"<td style='font-weight:bold;'>{absence + late + early:.2f}%</td><td>{review}</td>"
                "</tr>"
            )
        report_blocking_count = (
            sum(
                not calculation.finalizable
                for calculation in session.calculations
                if calculation.entry.work_date in report_dates
            )
            + len(session.import_result.issues)
        )
        draft = "DRAFT — PERLU REVIEW" if report_blocking_count else "FINAL"
        return f"""
        <html><head><style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; font-size: 9pt; }}
        .header {{ text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 12px; }}
        .header h2 {{ font-size: 13pt; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }}
        .header h1 {{ font-size: 15pt; margin: 2px 0; font-weight: bold; text-transform: uppercase; }}
        .header p {{ font-size: 8.5pt; margin: 0; color: #334155; }}
        .title {{ font-size: 11pt; font-weight: bold; margin: 10px 0 4px; text-align: center; text-transform: uppercase; }}
        .meta {{ margin: 4px 0 12px; text-align: center; color: #475569; font-size: 8.5pt; }}
        .draft {{ color: #b42318; font-weight: bold; }}
        table {{ border-collapse: collapse; width: 100%; border: 2px solid #000; }}
        th {{ background: #1e293b; color: white; padding: 6px 4px; font-size: 8pt; border: 1.5px solid #000; }}
        td {{ border: 1.5px solid #000; padding: 5px 4px; font-size: 8pt; }}
        td:nth-child(1), td:nth-child(2), td:nth-child(4), td:nth-child(5),
        td:nth-child(6), td:nth-child(7), td:nth-child(8), td:nth-child(9) {{ text-align: center; }}
        .signature-box {{ margin-top: 24px; float: right; width: 280px; text-align: center; font-size: 9pt; }}
        .signature-space {{ height: 55px; }}
        .signer-name {{ font-weight: bold; text-decoration: underline; }}
        </style></head><body>
        <div class="header">
            <h2>PEMERINTAH KOTA BITUNG</h2>
            <h1>SEKRETARIAT DEWAN PERWAKILAN RAKYAT DAERAH</h1>
            <p>Jl. Sam Ratulangi No. 45, Bitung · Sulawesi Utara</p>
        </div>
        <div class="title">REKAPITULASI PEMOTONGAN DISIPLIN KERJA PNS</div>
        <div class="meta">Periode: {start:%d-%m-%Y} s/d {end:%d-%m-%Y} · Status: <span class="draft">{draft}</span></div>
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>ID Finger</th>
                    <th>Nama Pegawai</th>
                    <th>WFH</th>
                    <th>Tidak Masuk</th>
                    <th>Terlambat</th>
                    <th>Pulang Cepat</th>
                    <th>Total Potongan</th>
                    <th>Review</th>
                </tr>
            </thead>
            <tbody>{''.join(rows)}</tbody>
        </table>
        <div class="signature-box">
            <div>Bitung, {end:%d %B %Y}</div>
            <div>Kepala Bagian Umum dan Keuangan</div>
            <div class="signature-space"></div>
            <div class="signer-name">SANTY N. MAMESAH, SS, M.Si</div>
            <div>NIP. 198109112003122005</div>
        </div>
        </body></html>
        """
