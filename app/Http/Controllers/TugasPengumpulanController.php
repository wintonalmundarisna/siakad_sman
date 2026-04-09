<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TugasPengumpulan;
use App\Models\Tugas;

class TugasPengumpulanController extends Controller
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

    public function show($tugasId)
    {
        // ambil tugas
        $tugas = Tugas::find($tugasId);

        if (!$tugas) {
            return response()->json([
                'message' => 'Tugas tidak ditemukan'
            ], 404);
        }

        // ================================
        // JIKA TUGAS MANUAL
        // ================================
        if ($tugas->tipe_tugas === 'manual') {

            $pengumpulan = TugasPengumpulan::with('siswa')
                ->where('tugas_id', $tugasId)
                ->get([
                    'id',
                    'tugas_id',
                    'siswa_id',
                    'file_jawaban',
                    'waktu_kumpul'
                ]);

            $data = $pengumpulan->map(function ($item) {
                return [
                    'pengumpulan_id' => $item->id,
                    'siswa' => [
                        'id' => $item->siswa->id,
                        'nama' => $item->siswa->nama
                    ],
                    'file_jawaban' => $item?->file_jawaban,
                    'waktu_kumpul' => $item?->waktu_kumpul
                ];
            });
        }

        // ================================
        // JIKA TUGAS CBT
        // ================================
        else {

            $pengumpulan = TugasPengumpulan::with('siswa')
                ->where('tugas_id', $tugasId)
                ->get([
                    'id',
                    'tugas_id',
                    'siswa_id',
                    'jawaban_cbt',
                    'nilai',
                    'waktu_mulai',
                    'waktu_kumpul'
                ]);

            $data = $pengumpulan->map(function ($item) {
                return [
                    'pengumpulan_id' => $item->id,
                    'siswa' => [
                        'id' => $item->siswa->id,
                        'nama' => $item->siswa->nama
                    ],
                    'jawaban_cbt' => $item?->jawaban_cbt,
                    'nilai' => $item?->nilai,
                    'waktu_mulai' => $item?->waktu_mulai,
                    'waktu_kumpul' => $item?->waktu_kumpul
                ];
            });
        }

        return response()->json([
            'tugas' => [
                'tugas_id' => $tugas->id,
                'judul' => $tugas->judul,
                'tipe_tugas' => $tugas->tipe_tugas,
                'deadline' => $tugas->deadline
            ],
            'pengumpulan' => $data
        ]);
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
