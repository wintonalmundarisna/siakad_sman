<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataBerkas;
use App\Helpers\ApiResponse;
use Carbon\Carbon;
// use Illuminate\Validation\Rule;
// use Illuminate\Validation\ValidationException;

class DataBerkasController extends Controller
{
    /**
     * ✅ SPA/TU
     */
    public function index(Request $request)
    {
        $dataBerkas = DataBerkas::with(['tahunAkademik', 'semester'])
        ->where('tahun_akademik_id', $request->tahun_akademik_id)
        ->get();

        if ($dataBerkas->isEmpty()) {
            return ApiResponse::error('Tidak ada data berkas pada tahun ini');
        }

        $formatted = $dataBerkas->groupBy('tahun_akademik_id')
        ->map(function ($dBerkas) {
            $tahun = $dBerkas->first()->tahunAkademik;

            return [
                'tahun_akademik_id'      => $tahun->id,
                'tahun_akademik'         => $tahun->tahun_akademik,
                'status_tahun_akademik'  => $tahun->status,
                'semester'  => $dBerkas->groupBy('semester_id')
                ->map(function ($berkas) {
                    $semester = $berkas->first()->semester;

                    return [
                        'semester_id'       => $semester->id,
                        'semester'          => $semester->semester,
                        'status_semester'   => $semester->status,
                        'berkas'            => $berkas->map(function ($b) {
                            return [
                                'berkas_id'     => $b->id,
                                'nama_berkas'   => $b->nama_berkas,
                                'berkas'        => $b->berkas,
                                'hari'          => Carbon::parse($b->tanggal)->translatedFormat('l, d F Y') ?? null,
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success(
            $formatted,
            'Data berkas '.$formatted->first()['tahun_akademik'].' berhasil diambil'
        );
        
    }

    /**
     * ! SPA/TU (MASUK SINI)
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
        //
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
