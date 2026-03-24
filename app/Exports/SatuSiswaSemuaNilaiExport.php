<?php

namespace App\Exports;

use App\Models\Siswa;
use App\Models\Semester;
use App\Models\TahunAkademik;
use App\Models\Rombel;
use App\Models\SiswaRombel;
use App\Models\DataNilaiSiswa;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;

use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;

class SatuSiswaSemuaNilaiExport implements WithMultipleSheets
{

    protected $tahunAkademikId;
    protected $semesterId;
    protected $rombelId;
    protected $jenisPenilaian;

    public function __construct($tahunAkademikId,$semesterId,$rombelId,$jenisPenilaian)
    {
        $this->tahunAkademikId = $tahunAkademikId;
        $this->semesterId = $semesterId;
        $this->rombelId = $rombelId;
        $this->jenisPenilaian = $jenisPenilaian;
    }

    public function sheets(): array
    {

        $sheets = [];

        $siswaRombel = SiswaRombel::with('siswa')
        ->where('rombel_id',$this->rombelId)
        ->where('tahun_akademik_id',$this->tahunAkademikId)
        ->get();

        foreach($siswaRombel as $sr){

            $sheets[] = new class(
                $sr->siswa_id,
                $this->tahunAkademikId,
                $this->semesterId,
                $this->rombelId,
                $this->jenisPenilaian
            ) implements FromCollection, WithTitle, WithEvents, WithCustomStartCell {

                private $siswaId;
                private $tahunAkademikId;
                private $semesterId;
                private $rombelId;
                private $jenisPenilaian;

                public function __construct($siswaId,$tahunAkademikId,$semesterId,$rombelId,$jenisPenilaian)
                {
                    $this->siswaId = $siswaId;
                    $this->tahunAkademikId = $tahunAkademikId;
                    $this->semesterId = $semesterId;
                    $this->rombelId = $rombelId;
                    $this->jenisPenilaian = $jenisPenilaian;
                }

                public function title(): string
                {
                    $siswa = Siswa::find($this->siswaId);
                    return substr($siswa->nama,0,30);
                }

                public function startCell(): string
                {
                    return 'A16'; // PERBAIKAN
                }

                public function collection()
                {

                    return DataNilaiSiswa::query()

                    ->join('siswa_rombel', function ($join) {
                        $join->on('data_nilai_siswa.siswa_id','=','siswa_rombel.siswa_id')
                            ->where('siswa_rombel.rombel_id',$this->rombelId)
                            ->where('siswa_rombel.tahun_akademik_id',$this->tahunAkademikId);
                    })

                    ->join(
                        'kurikulum_mata_pelajaran',
                        'data_nilai_siswa.kurikulum_mata_pelajaran_id',
                        '=',
                        'kurikulum_mata_pelajaran.id'
                    )

                    ->join(
                        'mata_pelajarans',
                        'kurikulum_mata_pelajaran.mata_pelajaran_id',
                        '=',
                        'mata_pelajarans.id'
                    )

                    ->where('data_nilai_siswa.siswa_id',$this->siswaId)
                    ->where('data_nilai_siswa.semester_id',$this->semesterId)
                    ->where('data_nilai_siswa.tahun_akademik_id',$this->tahunAkademikId)
                    ->where('data_nilai_siswa.jenis_penilaian',$this->jenisPenilaian)

                    // ->selectRaw("
                    //     ROW_NUMBER() OVER(ORDER BY kurikulum_mata_pelajaran.id) as no,
                    //     mata_pelajarans.nama_pelajaran as mata_pelajaran,
                    //     data_nilai_siswa.nilai_akhir,
                    //     data_nilai_siswa.deskripsi
                    // ")
                    ->selectRaw("
                        ROW_NUMBER() OVER(ORDER BY kurikulum_mata_pelajaran.id) as no,
                        mata_pelajarans.nama_pelajaran as mata_pelajaran,
                        data_nilai_siswa.nilai_akhir
                    ")

                    ->get();
                }

                public function registerEvents(): array
{
    return [

        AfterSheet::class => function(AfterSheet $event){

            $sheet = $event->sheet->getDelegate();

            $tahun = TahunAkademik::find($this->tahunAkademikId);
            $semester = Semester::find($this->semesterId);
            $rombel = Rombel::find($this->rombelId);
            $siswa = Siswa::find($this->siswaId);

            $dataCount = DataNilaiSiswa::where('siswa_id',$this->siswaId)
            ->where('semester_id',$this->semesterId)
            ->where('tahun_akademik_id',$this->tahunAkademikId)
            ->where('jenis_penilaian',$this->jenisPenilaian)
            ->count();

            $lastRow = 15 + $dataCount; // perbaikan

            /*
            |--------------------------------------------------------------------------
            | FONT
            |--------------------------------------------------------------------------
            */

            $sheet->getStyle('A1:D200')->getFont()
            ->setName('Times New Roman')
            ->setSize(11);

            /*
            |--------------------------------------------------------------------------
            | COLUMN WIDTH
            |--------------------------------------------------------------------------
            */

            // $sheet->getColumnDimension('A')->setWidth(5);
            // $sheet->getColumnDimension('B')->setWidth(45);
            // $sheet->getColumnDimension('C')->setWidth(20);
            // $sheet->getColumnDimension('D')->setWidth(40);
            $sheet->getColumnDimension('A')->setWidth(20);
            $sheet->getColumnDimension('B')->setWidth(30);
            $sheet->getColumnDimension('C')->setWidth(30);
            $sheet->getColumnDimension('D')->setWidth(20);

            /*
            |--------------------------------------------------------------------------
            | LOGO
            |--------------------------------------------------------------------------
            */

            $logoKiri = new Drawing();
            $logoKiri->setPath(public_path('storage/logo/kiri.JPG'));
            $logoKiri->setHeight(70);
            $logoKiri->setCoordinates('A1');
            $logoKiri->setWorksheet($sheet);
            $logoKiri->setOffsetX(40);
            
            $logoKanan = new Drawing();
            $logoKanan->setPath(public_path('storage/logo/kanan.JPG'));
            $logoKanan->setHeight(70);
            $logoKanan->setCoordinates('D1');
            $logoKanan->setWorksheet($sheet);
            $logoKanan->setOffsetX(40);

            /*
            |--------------------------------------------------------------------------
            | HEADER SEKOLAH
            |--------------------------------------------------------------------------
            */

            $sheet->mergeCells('B1:C1');
            $sheet->setCellValue('B1','PEMERINTAH PROVINSI DAERAH KHUSUS IBU KOTA JAKARTA');

            $sheet->mergeCells('B2:C2');
            $sheet->setCellValue('B2','DINAS PENDIDIKAN');

            $sheet->mergeCells('B3:C3');
            $sheet->setCellValue('B3','SMA NEGERI 42 JAKARTA');
            $sheet->getStyle('B3:C3')->getFont()->setBold(true);

            $sheet->mergeCells('B4:C4');
            $sheet->setCellValue('B4','Jl. Rajawali Halim Perdana Kusuma - Jakarta Timur 13610');

            $sheet->mergeCells('B5:C5');
            $sheet->setCellValue('B5','Telp. 021.809 3926 Fax.: 021.8088 7233');

            $sheet->mergeCells('B6:C6');
            $sheet->setCellValue('B6','E-Mail : sman42jkt@yahoo.co.id Website : http://www.sman42-jkt.sch.id');

            /*
            |--------------------------------------------------------------------------
            | GARIS PEMBATAS HEADER
            |--------------------------------------------------------------------------
            */

            $sheet->getStyle('A7:D7')->getBorders()->getBottom()
            ->setBorderStyle(Border::BORDER_MEDIUM);

            /*
            |--------------------------------------------------------------------------
            | JUDUL RAPOR
            |--------------------------------------------------------------------------
            */

            if ($semester->semester == 'Ganjil') {
                $hasilSemester = 'TENGAH SEMESTER';
            } else {
                $hasilSemester = 'AKHIR SEMESTER';
            }

            $sheet->mergeCells('A9:D9');
            $sheet->setCellValue('A9','LAPORAN HASIL BELAJAR '.$hasilSemester);
            $sheet->getStyle('A9:D9')->getFont()->setBold(true);
            
            $sheet->mergeCells('A10:D10');
            $sheet->setCellValue('A10','TAHUN AJARAN '.$tahun->tahun_akademik);
            $sheet->getStyle('A10:D10')->getFont()->setBold(true);

            /*
            |--------------------------------------------------------------------------
            | DATA SISWA
            |--------------------------------------------------------------------------
            */

            $sheet->setCellValue('A12','Nama       : '.$siswa->nama);
            $sheet->getStyle('A12')->getFont()->setBold(true);
            
            $sheet->setCellValue('A13','NIS          : '.$siswa->nis);
            $sheet->getStyle('A13')->getFont()->setBold(true);
            
            $sheet->setCellValue('D12','Kelas           : '.$rombel->nama_rombel);
            $sheet->getStyle('D12')->getFont()->setBold(true);
            
            if ($semester->semester == 'Ganjil') {
                $tulisan = '1 ('.$semester->semester.')';
            } else {            
                $tulisan = '2 ('.$semester->semester.')';
            }
            $sheet->setCellValue('D13','Semester     : '.$tulisan);
            $sheet->getStyle('D13')->getFont()->setBold(true);


            // $sheet->setCellValue('A12','Nama');
            // $sheet->setCellValue('B12',': '.$siswa->nama);

            // $sheet->setCellValue('A13','NIS');
            // $sheet->setCellValue('B13',': '.$siswa->nis);

            // $sheet->setCellValue('C12','Kelas');
            // $sheet->setCellValue('D12',': '.$rombel->nama_rombel);

            // $sheet->setCellValue('C13','Semester');
            // $sheet->setCellValue('D13',': '.$semester->semester);

            /*
            |--------------------------------------------------------------------------
            | HEADER TABEL
            |--------------------------------------------------------------------------
            */

            $sheet->setCellValue('A15','No');
            $sheet->setCellValue('B15','Mata Pelajaran');

            if ($semester->semester == 'Ganjil') {
                $C15 = 'Nilai Tengah Semester';
            } else {
                $C15 = 'Nilai Akhir Semester';
            }
            $sheet->setCellValue('C15',$C15);

            $sheet->setCellValue('D15','Keterangan');

            $sheet->getStyle('A15:D15')->getFont()->setBold(true);

            /*
            |--------------------------------------------------------------------------
            | BORDER TABEL
            |--------------------------------------------------------------------------
            */            

            // $sheet->getStyle("A15:D{$lastRow}")
            // ->getBorders()
            // ->getOutline()
            // ->setBorderStyle(Border::BORDER_THIN);

            $sheet->getStyle("A15:D{$lastRow}")
            ->getBorders()
            ->getAllBorders()
            ->setBorderStyle(
                \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN
            );

            /*
            |--------------------------------------------------------------------------
            | ALIGNMENT
            |--------------------------------------------------------------------------
            */

            $sheet->getStyle('A1:D10')
            ->getAlignment()
            ->setHorizontal('center');

            $sheet->getStyle('A15:D15')
            ->getAlignment()
            ->setHorizontal('center');

            $sheet->getStyle("A16:A{$lastRow}") // perbaikan
            ->getAlignment()
            ->setHorizontal('center');

            $sheet->getStyle("C16:C{$lastRow}") // perbaikan
            ->getAlignment()
            ->setHorizontal('center');

            /*
            |--------------------------------------------------------------------------
            | PRINT SETUP
            |--------------------------------------------------------------------------
            */

            $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
            $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

            $sheet->getPageSetup()->setFitToWidth(1);
            $sheet->getPageSetup()->setFitToHeight(false);

            $sheet->getPageMargins()->setTop(0.5);
            $sheet->getPageMargins()->setBottom(0.5);
            $sheet->getPageMargins()->setLeft(0.4);
            $sheet->getPageMargins()->setRight(0.4);

            $sheet->getPageSetup()->setHorizontalCentered(true);

        }

    ];
}

            };

        }
        return $sheets;
    }
}

// Tinggal nambah absensi
// nambah ttd
// nambah watermark