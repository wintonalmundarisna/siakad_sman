<?php

namespace App\Exports;

use Carbon\Carbon;
use App\Models\DataBerkas;
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
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class BerkasAdministrasiExport implements
    FromCollection,
    WithHeadings,
    WithEvents,
    WithCustomStartCell,
    ShouldAutoSize
{
    use Exportable;

    protected $tahun_id;

    public function __construct($tahun_id = null)
    {
        $this->tahun_id = $tahun_id;
    }

    public function startCell(): string
    {
        return 'A4';
    }

    public function collection()
    {
        $query = DataBerkas::with(['tahunAkademik', 'semester']);

        if ($this->tahun_id) {
            $query->where('tahun_akademik_id', $this->tahun_id);
        }

        $data = $query->get();

        return $data->values()->map(function ($item, $index) {
            return [
                $index + 1,
                $item->nama_berkas,
                $item->berkas ? basename($item->berkas) : null,
                $item->hari
                    ? Carbon::parse($item->hari)->translatedFormat('l, d F Y')
                    : null,
                $item->tahunAkademik->tahun_akademik ?? null,
                $item->semester->semester ?? null
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Berkas',
            'Berkas',
            'Hari',
            'Tahun Akademik',
            'Semester'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                /*
                =========================
                PAGE SETUP
                =========================
                */

                $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
                $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

                $sheet->getPageSetup()->setFitToWidth(1);
                $sheet->getPageSetup()->setFitToHeight(false);

                $sheet->getPageSetup()->setHorizontalCentered(true);
                $sheet->getPageSetup()->setVerticalCentered(false);

                $sheet->getPageMargins()->setTop(0.5);
                $sheet->getPageMargins()->setBottom(0.5);
                $sheet->getPageMargins()->setLeft(0.4);
                $sheet->getPageMargins()->setRight(0.4);

                /*
                TITLE
                */

                $sheet->setCellValue('A1', 'Data Berkas Administrasi');
                $sheet->mergeCells('A1:F1');

                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

                $sheet->getStyle('A1')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                SUB TITLE
                */

                $sheet->setCellValue('A2', 'SMA Negeri 42 Jakarta');
                $sheet->mergeCells('A2:F2');

                $sheet->getStyle('A2')->getFont()->setSize(12);

                $sheet->getStyle('A2')->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                HEADER TABLE
                */

                $sheet->getStyle('A4:F4')->applyFromArray([
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
                ALIGNMENT
                */

                $sheet->getStyle('A5:A' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle('B5:B' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle('C5:D' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                $sheet->getStyle('E5:F' . $highestRow)
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                BORDER
                */

                $sheet->getStyle('A4:F' . $highestRow)
                    ->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN
                            ]
                        ]
                    ]);

                /*
                FREEZE HEADER
                */

                $sheet->freezePane('A5');

                /*
                PRINT AREA
                */

                $sheet->getPageSetup()->setPrintArea("A1:F$highestRow");
            }
        ];
    }
}