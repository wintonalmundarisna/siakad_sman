<?php

namespace App\Exports;

use App\Models\AbsensiSiswa;
use App\Models\Rombel;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

class AbsensiSiswaExport implements WithMultipleSheets
{
    protected $tahun_id;
    protected $semester_id;

    public function __construct($tahun_id,$semester_id)
    {
        $this->tahun_id = $tahun_id;
        $this->semester_id = $semester_id;
    }

    public function sheets(): array
    {
        $sheets = [];

        $rombels = Rombel::orderBy('nama_rombel','asc')->get();

        foreach ($rombels as $rombel) {

            $sheets[] = new class($rombel,$this->tahun_id,$this->semester_id)
            implements FromCollection, WithHeadings, WithTitle, WithEvents, WithCustomStartCell, ShouldAutoSize {

                protected $rombel;
                protected $tahun_id;
                protected $semester_id;

                protected $tahun;
                protected $semester;

                public function __construct($rombel,$tahun_id,$semester_id)
                {
                    $this->rombel = $rombel;
                    $this->tahun_id = $tahun_id;
                    $this->semester_id = $semester_id;
                }

                public function title(): string
                {
                    return $this->rombel->nama_rombel;
                }

                public function startCell(): string
                {
                    return 'A5';
                }

                public function collection()
                {
                    $data = AbsensiSiswa::with([
                        'siswa',
                        'siswaRombel.rombel',
                        'tahunAkademik',
                        'semester'
                    ])
                    ->whereHas('siswaRombel', function($q){
                        $q->where('rombel_id',$this->rombel->id);
                    })
                    ->where('tahun_akademik_id',$this->tahun_id)
                    ->where('semester_id',$this->semester_id)
                    ->get();

                    if($data->count()){
                        $this->tahun = $data->first()->tahunAkademik->tahun_akademik;
                        $this->semester = $data->first()->semester->semester;
                    }

                    $grouped = $data->groupBy('siswa_id');

                    $rows = $grouped->map(function($items){

                        $nama = $items->first()->siswa->nama ?? '';

                        $hadir = $items->where('status','hadir')->count();
                        $sakit = $items->where('status','sakit')->count();
                        $izin  = $items->where('status','izin')->count();
                        $alpa  = $items->where('status','alpa')->count();


                        // Pengaturan berikut menyebabkan tidak bisa import karna cut path
                        $bukti = $items->pluck('bukti')
                        ->filter()
                        ->map(function ($item) {
                            return basename($item);
                        })
                        ->unique()
                        ->implode("\n");

                        return [
                            'nama'=>$nama,
                            'hadir'=>$hadir,
                            'sakit'=>$sakit,
                            'izin'=>$izin,
                            'alpa'=>$alpa,
                            'bukti'=>$bukti
                        ];

                    })->sortBy('nama')->values();

                    return $rows->map(function($item,$index){
                        return [
                            $index+1,
                            $item['nama'],
                            $item['hadir'],
                            $item['sakit'],
                            $item['izin'],
                            $item['alpa'],
                            $item['bukti'],
                        ];
                    });
                }

                public function headings(): array
                {
                    return [
                        'No',
                        'Nama Siswa',
                        'Hadir',
                        'Sakit',
                        'Izin',
                        'Alpa',
                        'Bukti',
                    ];
                }

                public function registerEvents(): array
                {
                    return [

                        AfterSheet::class => function (AfterSheet $event) {

                            $sheet = $event->sheet->getDelegate();
                            $highestRow = $sheet->getHighestRow();

                            /*
                            ===============================
                            PAGE SETUP (AGAR FIT HALAMAN)
                            ===============================
                            */

                            $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
                            $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

                            $sheet->getPageSetup()->setFitToWidth(1);
                            $sheet->getPageSetup()->setFitToHeight(false);

                            $sheet->getPageMargins()->setTop(0.5);
                            $sheet->getPageMargins()->setBottom(0.5);
                            $sheet->getPageMargins()->setLeft(0.3);
                            $sheet->getPageMargins()->setRight(0.3);

                            /*
                            ===============================
                            JUDUL
                            ===============================
                            */

                            $sheet->setCellValue(
                                'A1',
                                "Absensi Siswa Semester {$this->semester} Tahun {$this->tahun}"
                            );

                            $sheet->setCellValue(
                                'A2',
                                "Kelas: {$this->rombel->nama_rombel}"
                            );

                            $sheet->mergeCells('A1:G1');
                            $sheet->mergeCells('A2:G2');

                            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
                            $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);

                            /*
                            ===============================
                            HEADER TABLE
                            ===============================
                            */

                            $sheet->getStyle('A5:G5')->applyFromArray([
                                'font'=>[
                                    'bold'=>true,
                                    'color'=>['rgb'=>'FFFFFF']
                                ],
                                'alignment'=>[
                                    'horizontal'=>Alignment::HORIZONTAL_CENTER,
                                    'vertical'=>Alignment::VERTICAL_CENTER
                                ],
                                'fill'=>[
                                    'fillType'=>Fill::FILL_SOLID,
                                    'startColor'=>['rgb'=>'008000']
                                ]
                            ]);

                            /*
                            ===============================
                            ALIGNMENT
                            ===============================
                            */

                            $sheet->getStyle('A6:A'.$highestRow)
                                ->getAlignment()
                                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                            $sheet->getStyle('C6:F'.$highestRow)
                                ->getAlignment()
                                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                            /*
                            ===============================
                            WRAP TEXT BUKTI
                            ===============================
                            */

                            $sheet->getStyle('G6:G'.$highestRow)
                                ->getAlignment()
                                ->setWrapText(true);

                            /*
                            ===============================
                            BORDER
                            ===============================
                            */

                            $range='A5:G'.$highestRow;

                            $sheet->getStyle($range)->applyFromArray([
                                'borders'=>[
                                    'allBorders'=>[
                                        'borderStyle'=>Border::BORDER_THIN
                                    ]
                                ]
                            ]);

                        }

                    ];
                }

            };

        }

        return $sheets;
    }
}