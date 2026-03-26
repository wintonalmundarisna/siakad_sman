<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">

    {{-- <style>
        @page {
            margin: 40px;
        }

        body {
            font-family: "Times New Roman";
            font-size: 12px;

            background-image: url("{{ public_path('storage/logo/watermark_sma42.png') }}");
            background-repeat: no-repeat;
            background-position: center;
            background-size: 600px;
        }        

        .header {
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        table th,
        table td {
            border: 1px solid black;
            padding: 5px;
        }

        .page-break {
            page-break-after: always;
        }
    </style> --}}

    <style>

        @page {
            margin: 40px;
        }
        
        body{
            font-family: "Times New Roman";
            font-size: 12px;
        }
        
        /* WATERMARK */        
        .watermark{
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-57%, -60%);
            opacity: 0.40;
            z-index: -1;
        }
        
        .header{
            text-align:center;
        }
        
        table{
            width:100%;
            border-collapse:collapse;
        }
        
        table th, table td{
            border:1px solid black;
            padding:5px;
        }
        
        .page-break{
            page-break-after: always;
        }
        
        </style>

</head>

<body>
    <!-- Watermark muncul di semua halaman -->
    <img src="{{ public_path('storage/logo/watermark_sma42.png') }}" class="watermark" width="660">

    @foreach ($data as $d)

        <!-- HEADER -->

        <table style="border:none">
            <tr style="border:none">

                <td style="border:none;width:80px">
                    <img src="{{ public_path('storage/logo/kiri.JPG') }}" width="80">
                </td>

                <td style="border:none;text-align:center">

                    PEMERINTAH PROVINSI DAERAH KHUSUS IBU KOTA JAKARTA<br>
                    DINAS PENDIDIKAN<br>
                    <b>SMA NEGERI 42 JAKARTA</b><br>

                    Jl. Rajawali Halim Perdana Kusuma - Jakarta Timur 13610 <br>
                    Telp. 021.809 3926 Fax.: 021.8088 7233<br>
                    E-Mail : sman42jkt@yahoo.co.id Website :
                    <a href="http://sapmai.id" style="color: blue; text-decoration: underline;">
                        http://www.sman42-jkt.sch.id
                    </a>
                    <br>

                </td>

                <td style="border:none;width:80px;text-align:right">
                    <img src="{{ public_path('storage/logo/kanan.png') }}" width="80">
                </td>

            </tr>
        </table>

        <hr style="background-color: black">

        <h3 style="text-align:center">
            <?php
            if ($semester->semester == 'Ganjil') {
                $tulisanSemester = 'TENGAH SEMESTER';
            } else {
                $tulisanSemester = 'AKHIR SEMESTER';
            }
            ?>
            LAPORAN HASIL BELAJAR {{ $tulisanSemester }}<br>
            TAHUN AJARAN {{ $tahun->tahun_akademik }}
        </h3>        

        <?php
        if ($semester->semester == 'Ganjil') {
            $tulisanSemesterDua = '1 (' . $semester->semester . ')';
        } else {
            $tulisanSemesterDua = '2 (' . $semester->semester . ')';
        }
        ?>

        <table style="width:100%; border:none;">

            <tr>

                <!-- KIRI -->
                <td style="width:65%; border:none; vertical-align:top;">

                    <table style="border:none;">
                        <tr>
                            <td style="border:none; width:90px;"><b>Nama</b></td>
                            <td style="border:none; width:10px;">:</td>
                            <td style="border:none;"><b>{{ $d['siswa']->nama }}</b></td>
                        </tr>

                        <tr>
                            <td style="border:none;"><b>NIS</b></td>
                            <td style="border:none;">:</td>
                            <td style="border:none;"><b>{{ $d['siswa']->nis }}</b></td>
                        </tr>
                    </table>

                </td>


                <!-- KANAN -->
                <td style="border:none; vertical-align:top;">

                    <table style="width:100%; border:none;">

                        <tr>
                            <td style="border:none; width:120px;"><b>Kelas</b></td>
                            <td style="border:none; width:10px;">:</td>
                            <td style="border:none;"><b>{{ $rombel->nama_rombel }}</b></td>
                        </tr>

                        <tr>
                            <td style="border:none;"><b>Semester</b></td>
                            <td style="border:none;">:</td>
                            <td style="border:none;"><b>{{ $tulisanSemesterDua }}</b></td>
                        </tr>

                    </table>

                </td>

            </tr>

        </table>

        <br>

        <table>

            <thead>

                <tr>

                    <th width="20">No</th>
                    <th>Mata Pelajaran</th>
                    <?php
                    if ($semester->semester == 'Ganjil') {
                        $tulisanSemesterTiga = 'Nilai Tengah Semester';
                    } else {
                        $tulisanSemesterTiga = 'Nilai Akhir Semester';
                    }
                    ?>
                    <th width="120">{{ $tulisanSemesterTiga }}</th>
                    <th>Keterangan</th>

                </tr>

            </thead>

            <tbody>

                @foreach ($d['nilai'] as $i => $n)
                    <tr>

                        <td align="center">{{ $i + 1 }}</td>
                        <td>{{ $n->nama_pelajaran }}</td>
                        <td align="center">{{ $n->nilai_akhir }}</td>
                        <td></td>

                    </tr>
                @endforeach

            </tbody>

        </table>

        <br><br>

        <b>Ketidakhadiran</b>

        <table style="width:250px">

            <tr>
                <td align="center">Sakit</td>
                <td align="center">{{ $d['absensi']->sakit ?? 0 }} hari</td>
            </tr>

            <tr>
                <td align="center">Izin</td>
                <td align="center">{{ $d['absensi']->izin ?? 0 }} hari</td>
            </tr>

            <tr>
                <td align="center">Alpa</td>
                <td align="center">{{ $d['absensi']->alpa ?? 0 }} hari</td>
            </tr>

        </table>

        <br><br>

        <table style="border:none">

            <tr style="border:none; text-align:center;">

                <td style="border:none; vertical-align:middle;">
                    <div style="display:inline-block; text-align:left;">
                        Mengetahui,<br>
                        Kepala {{ $kepsek->nama_sekolah }}<br><br><br><br><br><br>

                        {{ $kepsek->kepala_sekolah }}<br>
                        NIP {{ $kepsek->nip_kepala_sekolah }}
                    </div>
                </td>

                <td style="border:none; vertical-align:middle;">
                    <div style="display:inline-block; text-align:left;">
                        {{ $tanggal }}<br>
                        Wali Kelas<br><br><br><br><br><br>

                        {{-- {{ $rombel->waliRombelByTahun($tahun->id)->wali->nama ?? '-' }}<br>
                        NIP {{ $rombel->waliRombelByTahun($tahun->id)->wali->nip ?? '-' }} --}}

                        {{ optional(optional($rombel->waliRombelByTahun($tahun->id))->wali)->nama ?? '-' }}
                        <br>
                        {{ optional(optional($rombel->waliRombelByTahun($tahun->id))->wali)->nip ?? '-' }}
                    </div>
                </td>

            </tr>

        </table>

        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach

</body>

</html>
