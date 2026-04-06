<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\Materi;
use Carbon\Carbon;

class MateriPertemuanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $materi = Materi::with([
            'pertemuan.jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'pertemuan.jadwalPelajaran.tahunAkademik',
            'pertemuan.jadwalPelajaran.semester',
            'pertemuan.jadwalPelajaran.guru',
            'pertemuan.jadwalPelajaran.rombel',
        ])
        ->where('pertemuan_id', $id)
        ->first();

        if (!$materi) {
            return ApiResponse::error('Materi tidak ditemukan');
        }

        $formatted = [
            'pertemuan_id'      => $materi->pertemuan->id,
            'judul_pertemuan'   => $materi->pertemuan->judul ?? null,
            'pertemuan_ke'      => $materi->pertemuan->pertemuan_ke,
            'tanggal_pertemuan' => Carbon::parse($materi->pertemuan->tanggal)->translatedFormat('l, d F Y') ?? null,
            'jenis_pertemuan'   => $materi->pertemuan->jenis,
            'tahun_akademik'    => $materi->pertemuan->jadwalPelajaran->tahunAkademik->tahun_akademik,
            'semester'          => $materi->pertemuan->jadwalPelajaran->semester->semester,
            'mata_pelajaran'    => $materi->pertemuan->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'rombel'            => $materi->pertemuan->jadwalPelajaran->rombel->nama_rombel,
            'guru'              => $materi->pertemuan->jadwalPelajaran->guru->nama,
            'materi'        => [
                'materi_id'   => $materi->id,
                'judul'       => $materi->judul,
                'deskripsi'   => $materi->deskripsi ?? null,
                'file'        => $materi->file ? asset(str_replace('public/', 'storage/', $materi->file)) : null,
                'link_video'  => $materi->link_video ?? null,
            ],
        ];

        return ApiResponse::success($formatted, 'Materi berhasil ditampilkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
