<?php

namespace App\Exports;

use App\Models\Keuangan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class KeuanganExport implements
    FromCollection,
    WithHeadings,
    WithEvents,
    WithCustomStartCell,
    ShouldAutoSize
{
    use Exportable;

    protected $ids;

    public function __construct($ids = null)
    {
        $this->ids = $ids;
    }

    public function startCell(): string
    {
        return 'A4'; // ⬅️ naik (biar jarak cuma 1 baris)
    }

    public function collection()
    {
        $query = $this->ids
            ? Keuangan::whereIn('id', $this->ids)->get()
            : Keuangan::get();

        return $query->values()->map(function ($item, $index) {
            return [
                $index + 1,
                $item->nama_akun,
                (float) $item->debit,
                (float) $item->kredit,
                $item->keterangan,
            ];
        });
    }

    public function headings(): array
    {
        return ['No', 'Nama Akun', 'Debit', 'Kredit', 'Keterangan'];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                /*
                =========================
                PAGE SETUP (PRINT & PDF)
                =========================
                */

                $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
                $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

                $sheet->getPageSetup()->setFitToWidth(1);
                $sheet->getPageSetup()->setFitToHeight(false);

                // ⬅️ INI YANG BIKIN CENTER SAAT PRINT                
                $sheet->getPageSetup()->setHorizontalCentered(true);
                $sheet->getPageSetup()->setVerticalCentered(false);

                // margin biar rapi
                $sheet->getPageMargins()->setTop(0.5);
                $sheet->getPageMargins()->setBottom(0.5);
                $sheet->getPageMargins()->setLeft(0.4);
                $sheet->getPageMargins()->setRight(0.4);

                /*
                TITLE
                */

                $sheet->setCellValue('A1', 'Rekap Data Keuangan');
                $sheet->mergeCells('A1:E1');

                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                SUB TITLE
                */

                $sheet->setCellValue('A2', 'SMA Negeri 42 Jakarta');
                $sheet->mergeCells('A2:E2');

                $sheet->getStyle('A2')->getFont()->setSize(12);
                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                HEADER TABLE (sekarang di row 4)
                */

                $sheet->getStyle('A4:E4')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '008000']
                    ]
                ]);

                /*
                FORMAT RUPIAH
                */

                $sheet->getStyle('C5:C' . $highestRow)
                    ->getNumberFormat()
                    ->setFormatCode('"Rp" #,##0');

                $sheet->getStyle('D5:D' . $highestRow)
                    ->getNumberFormat()
                    ->setFormatCode('"Rp" #,##0');

                /*
                ALIGNMENT
                */

                // NO
                $sheet->getStyle('A5:A' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // nama akun dan keterangan
                $sheet->getStyle('B5:B' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle('E5:E' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                // debit dan kredit
                $sheet->getStyle('C5:D' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                /*
                BORDER
                */

                $sheet->getStyle('A4:E' . $highestRow)
                    ->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN
                            ]
                        ]
                    ]);

                /*
                FREEZE
                */

                $sheet->freezePane('A5');

                /*
                PRINT AREA
                */

                $sheet->getPageSetup()->setPrintArea("A1:E$highestRow");
            }
        ];
    }
}