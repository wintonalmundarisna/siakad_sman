<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use Illuminate\Validation\ValidationException;
use App\Helpers\ApiResponse;
use Carbon\Carbon;
use App\Models\JurnalKbm;

class JurnalKbmController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Sudah dibuat otomatis di JadwalPelajaranController::store
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
        $jurnal = JurnalKbm::with([
            'pertemuan.jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'pertemuan.jadwalPelajaran.tahunAkademik',
            'pertemuan.jadwalPelajaran.semester',
            'pertemuan.jadwalPelajaran.guru',
            'pertemuan.jadwalPelajaran.rombel',
        ])
        ->where('pertemuan_id', $id)
        ->first();

        if (!$jurnal) {
            return ApiResponse::error('Jurnal KBM tidak ditemukan');
        }

        $formatted = [
            'pertemuan_id'      => $jurnal->pertemuan->id,
            'judul_pertemuan'   => $jurnal->pertemuan->judul ?? null,
            'pertemuan_ke'      => $jurnal->pertemuan->pertemuan_ke,
            'tanggal_pertemuan' => Carbon::parse($jurnal->pertemuan->tanggal)->translatedFormat('l, d F Y') ?? null,
            'jenis_pertemuan'   => $jurnal->pertemuan->jenis,
            'tahun_akademik'    => $jurnal->pertemuan->jadwalPelajaran->tahunAkademik->tahun_akademik,
            'semester'          => $jurnal->pertemuan->jadwalPelajaran->semester->semester,
            'mata_pelajaran'    => $jurnal->pertemuan->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'rombel'            => $jurnal->pertemuan->jadwalPelajaran->rombel->nama_rombel,
            'guru'              => $jurnal->pertemuan->jadwalPelajaran->guru->nama,
            'jurnal_kbm'        => [
                'jurnal_kbm_id'                => $jurnal->id,
                'uraian_kegiatan'   => $jurnal->uraian_kegiatan ?? null,
                'metode'            => $jurnal->metode ?? null,
                'catatan'           => $jurnal->catatan ?? null,
            ],
        ];

        return ApiResponse::success($formatted, 'Jurnal KBM berhasil ditampilkan');
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
