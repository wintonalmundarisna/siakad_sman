<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ekstrakurikuler;
use App\Models\PelatihEkskul;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
// use Illuminate\Support\Facades\Validator;
// use App\Models\Kepegawaian;
// use App\Models\TahunAkademik;

class EkstrakurikulerController extends Controller
{
    // ✅ get all ekskul untuk spa
    public function index()
    {
        $ekskul = Ekstrakurikuler::get();

        $formatted = $ekskul->map(function ($item) {

            return [
                'id'            => $item->id,
                'nama_ekskul'   => $item->nama_ekstrakurikuler,
                'anggaran'      => $item->anggaran ?? 0,
                'status'        => $item->status,
                'status_aktif'  => $item->status_aktif,
            ];
        })->values();

        return ApiResponse::success(
            $formatted,
            'Daftar Ekstrakurikuler berhasil diambil'
        );
    }

    // ✅ show semua ekskul milik pegawai
    public function showEkskulSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user();

        $pelatihEkskul = PelatihEkskul::with([
                'pelatih:id,nama',
                'ekstrakurikuler:id,nama_ekstrakurikuler,anggaran,status',
                'ekstrakurikuler.siswas:id,nama',
                'tahunAkademik:id,tahun,status'
            ])
            ->where('pelatih_id', $pegawai->id)
            ->get();

        if ($pelatihEkskul->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $formatted = $pelatihEkskul
            ->groupBy('pelatih_id')
            ->map(function ($items) {

                $pelatih = $items->first()->pelatih;

                return [
                    'pelatih_id'   => $pelatih->id,
                    'guru_id'      => $pelatih->id,
                    'nama_pelatih' => $pelatih->nama,

                    'tahun_akademik' => $items
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($perTahun) {

                            $row   = $perTahun->first();
                            $ekskul = $row->ekstrakurikuler;

                            return [
                                'tahun_akademik_id'     => $row->tahunAkademik->id,
                                'tahun_akademik'        => $row->tahunAkademik->tahun,
                                'status_tahun_akademik' => $row->tahunAkademik->status,

                                'nama_ekskul'  => $ekskul->nama_ekstrakurikuler,
                                'anggaran'     => $ekskul->anggaran,
                                'status_ekskul'=> $ekskul->status,

                                'anggota' => $ekskul->siswas
                                    ->where(
                                        'pivot.tahun_akademik_id',
                                        $row->tahun_akademik_id
                                    )
                                    ->map(function ($siswa) {
                                        return [
                                            'pivot_id'   => $siswa->pivot->id ?? null,
                                            'siswa_id'   => $siswa->id,
                                            'nama_siswa' => $siswa->nama,                                            
                                            'status_aktif' => $siswa->pivot->status,
                                            'sikap'      => $siswa->pivot->sikap,
                                            'tahun_akademik_id' => $siswa->pivot->tahun_akademik_id
                                        ];
                                    })
                                    ->values()
                            ];
                        })
                        ->values()
                ];
            })
            ->values();

        return ApiResponse::success(
            $formatted,
            'Detail ekstrakurikuler berhasil diambil'
        );
    }


    // ✅ SPA dan guru    
    public function show($id, Request $request)
    {
        $request->validate([
            'tahun_akademik_id'  => 'required|exists:tahun_akademik,id',
        ], [
            'tahun_akademik_id.required' => 'Tahun akademik wajib ditentukan terlebih dahulu',
            'tahun_akademik_id.exists'  => 'Tahun akademik tidak ditemukan'
        ]);

        $ekskul = Ekstrakurikuler::with([
            'pembinaEkskul' => function ($q) use ($request) {
                $q->where('tahun_akademik_id', $request->tahun_akademik_id)
                ->with(['pembina', 'tahunAkademik']);
            },
            'pelatihEkskul' => function ($q) use ($request) {
                $q->where('tahun_akademik_id', $request->tahun_akademik_id)
                ->with(['pelatih', 'tahunAkademik']);
            },
            'siswaEkskul' => function ($q) use ($request) {
                $q->where('tahun_akademik_id', $request->tahun_akademik_id)
                ->with(['siswa', 'tahunAkademik']);
            },
        ])
        ->where('id', $id)
        ->where(function ($q) use ($request) {
            $q->whereHas('pembinaEkskul', function ($sub) use ($request) {
                $sub->where('tahun_akademik_id', $request->tahun_akademik_id);
            })
            ->orWhereHas('pelatihEkskul', function ($sub) use ($request) {
                $sub->where('tahun_akademik_id', $request->tahun_akademik_id);
            })
            ->orWhereHas('siswaEkskul', function ($sub) use ($request) {
                $sub->where('tahun_akademik_id', $request->tahun_akademik_id);
            });
        })
        ->first();

        if (!$ekskul) {
            return ApiResponse::error('Not found', ['id' => 'Id tidak ditemukaan']);
        }

        // ambil hanya tahun yang dipilih
        $tahunAkademikIds = collect([$request->tahun_akademik_id]);

        $periode = $tahunAkademikIds->map(function ($taId) use ($ekskul) {

            $pembina = $ekskul->pembinaEkskul
                ->firstWhere('tahun_akademik_id', $taId);

            $pelatih = $ekskul->pelatihEkskul
                ->firstWhere('tahun_akademik_id', $taId);

            $siswa = $ekskul->siswaEkskul
                ->where('tahun_akademik_id', $taId)
                ->map(function ($item) {
                    return [
                        'siswa_id'   => $item->siswa->id,
                        'siswa_pivot_id' => $item->id,
                        'nama_siswa' => $item->siswa->nama,
                        'nisn' => $item->siswa->nisn,
                        'nis' => $item->siswa->nis,
                        'sikap' => $item->sikap ?? null,
                        'status' => $item->status ?? null,
                        'tahun_akademik' => $item->tahunAkademik->tahun_akademik,
                    ];
                })
                ->values();

            return [
                'tahun_akademik_id' => $taId,
                'tahun_akademik'    => optional($pembina?->tahunAkademik ?? $pelatih?->tahunAkademik)->tahun_akademik,
                'status_tahun_akademik'    => optional($pembina?->tahunAkademik ?? $pelatih?->tahunAkademik)->status,
                'anggota' => [
                    'pembina' => [
                        'pembina_id'   => $pembina?->pembina->id,
                        'pembina_pivot_id' => $pembina?->id,
                        'nama_pembina' => $pembina?->pembina->nama,
                        'tahun_membina'=> $pembina?->tahunAkademik?->tahun_akademik,
                    ],
                    'pelatih' => [
                        'pelatih_id'   => $pelatih?->pelatih->id,
                        'pelatih_pivot_id'   => $pelatih?->id,
                        'nama_pelatih' => $pelatih?->pelatih->nama,
                        'tahun_melatih'=> $pelatih?->tahunAkademik?->tahun_akademik,
                    ],
                    'siswa'        => $siswa ?? null,
                ],
            ];
    });

    return response()->json([
        'data' => [
            [
                'id'           => $ekskul->id,
                'nama_ekskul'  => $ekskul->nama_ekstrakurikuler,
                'anggaran'     => $ekskul->anggaran ?? 0,
                'status'       => $ekskul->status,
                'status_aktif' => $ekskul->status_aktif,
                'periode'      => $periode,
            ]
        ]
    ]);
}


    // ✅ store ekskul untuk spa (pegawai tidak karena tidak terkait anggota)
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_ekstrakurikuler' => 'required|unique:ekstrakurikulers,nama_ekstrakurikuler',                
                'anggaran' => 'nullable|numeric',
                'status' => 'required|in:wajib,pilihan,jurusan',
            ], [
                'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
                'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',                                                
                'anggaran.required' => 'Anggaran wajib diisi',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya wajib, pilihan, dan jurusan'
            ]);           

            $ekstrakurikuler = Ekstrakurikuler::create($validated);            

            return ApiResponse::success([
                'id' => $ekstrakurikuler->id,
                'nama_ekstrakurikuler' => $ekstrakurikuler->nama_ekstrakurikuler,                
                'anggaran' => $ekstrakurikuler->anggaran ?? 0,
                'status' => $ekstrakurikuler->status,
                'status_aktif' => 'aktif',
            ], 'Ekstrakurikuler berhasil dibuat');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }
    
    // ✅ update ekskul untuk spa (pegawai tidak karna tidak terkait anggota)
    public function update(Request $request, $id)
    {
        $ekskul = Ekstrakurikuler::find($id);
        if (!$ekskul) {
            return ApiResponse::error('Ekstrakurikuler tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }
        
        // if ($ekskul->status_aktif == 'arsip') {
        //     return ApiResponse::error('Tidak bisa diubah', ['id' => ['Status aktif sudah menjadi arsip']], 404);
        // }

        $validated = $request->validate([
            'nama_ekstrakurikuler' => [
                'sometimes',
                'required',
                Rule::unique('ekstrakurikulers')->ignore($id)
            ],            
            'anggaran' => 'sometimes|required|numeric',
            'status' => 'sometimes|required|in:wajib,pilihan,jurusan',
            'status_aktif' => 'sometimes|required|in:aktif,arsip'
        ], [
            'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
            'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',            
            'anggaran.required' => 'Anggaran wajib diisi',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya wajib, pilihan, dan jurusan',
            'status.required' => 'Status aktif wajib diisi',
            'status.in' => 'Pilihan hanya aktif dan arsip'
        ]);

        $ekskul->update($validated);        

        return ApiResponse::success(
            [
                'id' => $ekskul->id,
                'nama_ekstrakurikuler' => $ekskul->nama_ekstrakurikuler,                
                'anggaran' => $ekskul->anggaran,
                'status' => $ekskul->status,
                'status_aktif' => $ekskul->status_aktif,
            ],
            'Ekstrakurikuler berhasil diperbarui'
        );
    }

    
    public function destroy($id) 
    {
        $ekskul = Ekstrakurikuler::find($id);

        if (!$ekskul) {
            return ApiResponse::error('Not found', ['id' => 'id tidak ditemukan']);
        }

        if ($ekskul->status_aktif == 'arsip') {
            return ApiResponse::error('Tidak bisa dihapus', ['status' => 'Status arsip sebaiknya jangan dihapus']);
        }

        if ($ekskul->siswaEkskul()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['siswa' => 'Ekstrakurikuler masih memiliki siswa'],
                403
            );
        }

        if ($ekskul->pembinaEkskul()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['pembina' => 'Ekstrakurikuler masih memiliki pembina'],
                403
            );
        }

        if ($ekskul->pelatihEkskul()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['pelatih' => 'Ekstrakurikuler masih memiliki pelatih'],
                403
            );
        }

        $ekskul->delete();

        return ApiResponse::success(null, 'Data ekstrakurikuler berhasil dihapus');
    }
}