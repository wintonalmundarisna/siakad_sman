<?php

namespace App\Exports;

use App\Models\Psb;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;

class PsbExport implements 
    FromCollection, 
    WithHeadings, 
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents
{
    protected $ids;

    public function __construct(array $ids = null)
    {
        $this->ids = $ids;
    }

    private function cekIsi($path)
    {
        if (!$path) {
            return '';
        }

        if (Str::startsWith($path, 'public/foto_siswa')) {
            return $path;
        }

        if (
            Str::startsWith($path, 'private/berkas_') ||
            Str::startsWith($path, 'private/suket_pindah')
        ) {
            return $path;
        }

        return $path;
    }

    public function startCell(): string
    {
        return 'A4';
    }

    public function collection()
    {
        $query = $this->ids 
            ? Psb::whereIn('id', $this->ids)
            : Psb::query();

        $data = $query->orderBy('nama_siswa', 'asc')->get();

        return $data->values()->map(function ($item, $index) {
            return [
                $index + 1,
                $this->cekIsi($item->foto_siswa),
                $item->nama_siswa,
                $this->cekIsi("' ".$item->nisn),
                $item->jk,
                $item->tempat_lahir,
                $item->tanggal_lahir,
                $item->agama,
                $item->alamat,
                $this->cekIsi("' ".$item->no_hp_siswa),
                $item->nama_ayah,
                $item->pekerjaan_ayah,
                $this->cekIsi("' ".$item->no_hp_ayah),
                $item->nama_ibu,
                $item->pekerjaan_ibu,
                $this->cekIsi("' ".$item->no_hp_ibu),
                $item->nama_wali,
                $item->pekerjaan_wali,
                $this->cekIsi("' ".$item->no_hp_wali),
                $item->sekolah_asal,
                $item->alamat_sekolah_asal,
                $item->kelas_terakhir,
                $this->cekIsi("' ".$item->nilai_raport_terakhir),
                $item->alasan_pindah,
                $this->cekIsi($item->berkas_raport),
                $this->cekIsi($item->suket_pindah),
                $this->cekIsi($item->berkas_kartu_keluarga),
                $this->cekIsi($item->berkas_akta_lahir),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'No',
            'Foto Siswa',
            'Nama Siswa',
            'NISN',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Alamat',
            'No HP Siswa',
            'Nama Ayah',
            'Pekerjaan Ayah',
            'No HP Ayah',
            'Nama Ibu',
            'Pekerjaan Ibu',
            'No HP Ibu',
            'Nama Wali',
            'Pekerjaan Wali',
            'No HP Wali',
            'Sekolah Asal',
            'Alamat Sekolah Asal',
            'Kelas Terakhir',
            'Nilai Raport Terakhir',
            'Alasan Pindah',
            'Berkas Raport',
            'Surat Keterangan Pindah',
            'Berkas KK',
            'Berkas Akta Lahir',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();
                $tahun = now()->year;

                // Judul kiri
                $sheet->setCellValue('A1', "Penerimaan Siswa Baru Tahun {$tahun}");
                $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);

                $sheet->setCellValue('A2', "SMA Negeri 42 Jakarta");
                $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(12);

                // Kecilkan kolom No
                $sheet->getColumnDimension('A')->setAutoSize(false);
                $sheet->getColumnDimension('A')->setWidth(5);

                // Header style (Hijau + Putih + Bold)
                $sheet->getStyle('A4:AB4')->applyFromArray([
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
    ],
    'alignment' => [
        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
        'vertical'   => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => [
            'rgb' => '008000',
        ],
    ],
]);

                // Border seluruh tabel
                $lastRow = $sheet->getHighestRow();
                $lastColumn = $sheet->getHighestColumn();
                $range = "A4:{$lastColumn}{$lastRow}";

                $sheet->getStyle($range)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                $sheet->getStyle('A5:A' . $sheet->getHighestRow())
                ->getAlignment()
                ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            }
        ];
    }
}