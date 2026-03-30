<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Pertemuan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PertemuanController extends Controller
{
    /**
     * show sudah menukupi
     */
    public function index()
    {
        
    }


    /**
     * Sudah otomatis terbuat 16 per semester saat jadwal perlajaran dibuat
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * SPA/GURU
     */
    public function show(string $id)
    {
        $pertemuan = Pertemuan::with([
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajaran.tahunAkademik',
            'jadwalPelajaran.semester',
            'jadwalPelajaran.rombel',
            'jadwalPelajaran.guru',
            'jadwalPelajaran.ruangan'
        ])
        ->where('jadwal_pelajaran_id', $id)
        ->orderBy('pertemuan_ke')
        ->get();

        if ($pertemuan->isEmpty()) {
            return ApiResponse::error('Belum ada pertemuan');
        }

        $jadwal = $pertemuan->first()->jadwalPelajaran;

        $formatted = [
            'jadwal_pelajaran_id'   => $jadwal->id,
            'mata_pelajaran'        => $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'tahun_akademik'        => $jadwal->tahunAkademik->tahun_akademik,
            'semester'              => $jadwal->semester->semester,
            'rombel'                => $jadwal->rombel->nama_rombel,
            'guru'                  => $jadwal->guru->nama,
            'hari'                  => $jadwal->hari,
            'jam_mulai'             => $jadwal->jam_mulai,
            'jam_selesai'           => $jadwal->jam_selesai,
            'ruangan'               => optional($jadwal->ruangan)->nama_ruangan,
            'link_opsional'         => $jadwal->link_opsional,

            'pertemuan' => $pertemuan->map(function ($p) {
                return [
                    'pertemuan_id'  => $p->id,
                    'pertemuan_ke'  => $p->pertemuan_ke,
                    'judul'         => $p->judul,
                    'tanggal'       => Carbon::parse($p->tanggal)->translatedFormat('l, d F Y') ?? null,
                    'jenis'         => $p->jenis,
                ];
            })->values()
        ];

        return ApiResponse::success($formatted, 'Pertemuan berhasil ditampilkan');
    }

    /**
     * ! SPA/GURU (MASUK SINI)
     */
    public function update(Request $request, string $id)
    {
        // hanya bisa update judul


        // tanggal harus diupdate otomatis pada hari itu
    }

    /**
     * Tidak ada delete, karna biar 16
     */
    public function destroy(string $id)
    {
        //
    }
}
