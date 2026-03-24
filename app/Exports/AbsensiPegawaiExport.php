<?php

namespace App\Exports;

use App\Models\AbsensiPegawai;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class AbsensiPegawaiExport implements
    FromCollection,
    WithEvents,
    WithCustomStartCell,
    ShouldAutoSize
{
    use Exportable;

    protected $tahun_id;
    protected $semester_id;

    protected $tahun;
    protected $semester;

    public function __construct($tahun_id, $semester_id)
    {
        $this->tahun_id = $tahun_id;
        $this->semester_id = $semester_id;
    }

    public function startCell(): string
    {
        return 'A4';
    }

    public function collection()
    {
        $data = AbsensiPegawai::with([
            'guru',
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'tahunAkademik',
            'semester'
        ])
        ->where('tahun_akademik_id', $this->tahun_id)
        ->where('semester_id', $this->semester_id)
        ->get();

        if ($data->count()) {
            $this->tahun = $data->first()->tahunAkademik->tahun_akademik;
            $this->semester = $data->first()->semester->semester;
        }

        $grouped = $data->groupBy(function ($item) {
            return ($item->guru->nama ?? '-') . '|' .
                ($item->jadwalPelajaran?->kurikulumMataPelajaran?->mataPelajaran?->nama_pelajaran ?? '-');
        });

        $rows = $grouped->map(function ($items) {

            $guru = $items->first()->guru->nama ?? '';
            $mapel = $items->first()
                ->jadwalPelajaran?->kurikulumMataPelajaran?->mataPelajaran?->nama_pelajaran ?? '-';
                
            $hadir = $items->where('status', 'hadir')->count();
            $tidak = $items->where('status', 'tidak hadir')->count();

            return [
                'guru' => $guru,
                'mapel' => $mapel,
                'hadir' => $hadir,
                'tidak' => $tidak
            ];
        })->values();

        return $rows->map(function ($item, $index) {
            return [
                $index + 1,
                $item['guru'],
                $item['mapel'],
                $item['hadir'],
                $item['tidak']
            ];
        });
    }

    public function registerEvents(): array
    {
        return [

            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                /*
                PAGE SETUP
                */

                $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
                $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

                $sheet->getPageSetup()->setFitToWidth(1);
                $sheet->getPageSetup()->setFitToHeight(false);

                // AGAR PRINT DI TENGAH
                $sheet->getPageSetup()->setHorizontalCentered(true);
                $sheet->getPageSetup()->setVerticalCentered(false);

                /*
                MARGIN PRINT
                */

                $sheet->getPageMargins()->setTop(0.5);
                $sheet->getPageMargins()->setBottom(0.5);
                $sheet->getPageMargins()->setLeft(0.4);
                $sheet->getPageMargins()->setRight(0.4);

                /*
                JUDUL
                */

                $sheet->setCellValue(
                    'A1',
                    "Rekap Absensi Pegawai Semester {$this->semester} Tahun {$this->tahun}"
                );

                $sheet->mergeCells('A1:E1');

                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

                $sheet->getStyle('A1')
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                HEADER TABLE
                */

                $sheet->setCellValue('A3', 'No');
                $sheet->setCellValue('B3', 'Nama Guru');
                $sheet->setCellValue('C3', 'Mata Pelajaran');
                $sheet->setCellValue('D3', 'Hadir');
                $sheet->setCellValue('E3', 'Tidak Hadir');

                /*
                HEADER STYLE
                */

                $sheet->getStyle('A3:E3')->applyFromArray([
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
                ALIGNMENT DATA
                */

                $sheet->getStyle('A4:A' . $highestRow)
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $sheet->getStyle('D4:E' . $highestRow)
                    ->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                /*
                FREEZE HEADER
                */

                $sheet->freezePane('A4');

                /*
                BORDER TABLE
                */

                $range = 'A3:E' . $highestRow;

                $sheet->getStyle($range)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN
                        ]
                    ]
                ]);

                /*
                SET PRINT AREA
                */

                $sheet->getPageSetup()->setPrintArea("A1:E$highestRow");

            }

        ];
    }
}