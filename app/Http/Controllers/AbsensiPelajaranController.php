<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPelajaran;
use App\Models\JadwalPelajaran;
use App\Models\Kelas;
use App\Models\TahunAkademik;
use App\Models\Semester;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
// use File;
// use Illuminate\Support\Str;
// use Illuminate\Support\Facades\Response;
// use Illuminate\Support\Facades\Validator;
use App\Exports\AbsensiPelajaranExport;

class AbsensiPelajaranController extends Controller
{
    /**
     * ✅ Untuk super admin
     */    
    public function index(Request $request)
    {
        $request->validate([
            'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            'semester_id'       => 'required|exists:semester,id',
        ], [
            'tahun_akademik_id.required' => 'Tahun akademik harus ditentukan terlebih dahulu',
            'tahun_akademik_id.exists'   => 'Tahun akademik tidak ditemukan',
            'semester_id.required'       => 'Semester harus ditentukan terlebih dahulu',
            'semester_id.exists'         => 'Semester tidak ditemukan',
        ]);

        $absen = AbsensiPelajaran::with([
                'guru',
                'tahunAkademik',
                'semester',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            ])
            ->where('tahun_akademik_id', $request->tahun_akademik_id)
            ->where('semester_id', $request->semester_id)
            ->orderBy('hari', 'asc')
            ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                'Data absensi tidak ditemukan'
            );
        }

        $formatted = $absen
            ->groupBy('tahun_akademik_id')
            ->map(function ($tahunItems) {

                $tahunAkademik = $tahunItems->first()->tahunAkademik;

                return [
                    'tahun_akademik_id'       => $tahunAkademik->id ?? null,
                    'tahun_akademik'          => $tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik'   => $tahunAkademik->status ?? null,

                    'semesters' => $tahunItems
                        ->groupBy('semester_id')
                        ->map(function ($semesterItems) use ($tahunItems) {

                            $semester = $semesterItems->first()->semester;

                            return [
                                'semester_id'     => $semester->id ?? null,
                                'semester'        => $semester->semester ?? null,
                                'status_semester' => $semester->status ?? null,

                                'guru' => $semesterItems
                                    ->groupBy('guru_pengajar_id')
                                    ->map(function ($guruItems) use ($tahunItems) {

                                        $guru = $guruItems->first()->guru;

                                        return [
                                            'guru_pengajar_id'   => $guru->id ?? null,
                                            'nama_guru' => $guru->nama ?? null,
                                            'nip'       => $guru->nip ?? null,
                                            'nuptk'     => $guru->nuptk ?? null,
                                            'role'      => $guru->role ?? null,

                                            // total per tahun (semua semester dalam tahun tsb)
                                            'hadir_per_tahun' =>
                                                $tahunItems
                                                    ->where('guru_pengajar_id', $guru->id)
                                                    ->where('status', 'hadir')
                                                    ->count(),

                                            'tidak_hadir_per_tahun' =>
                                                $tahunItems
                                                    ->where('guru_pengajar_id', $guru->id)
                                                    ->where('status', 'tidak hadir')
                                                    ->count(),

                                            // total per semester
                                            'hadir_per_semester' =>
                                                $guruItems
                                                    ->where('status', 'hadir')
                                                    ->count(),

                                            'tidak_hadir_per_semester' =>
                                                $guruItems
                                                    ->where('status', 'tidak hadir')
                                                    ->count(),

                                            'absensi' => $guruItems
                                                ->sortBy('hari')
                                                ->map(function ($abs) {

                                                    $mataPelajaran =
                                                        $abs->jadwalPelajaran
                                                            ?->kurikulumMataPelajaran
                                                            ?->mataPelajaran;

                                                    return [
                                                        'absensi_id' => $abs->id ?? null,
                                                        'hari'      => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                                                        'status'     => $abs->status ?? null,
                                                        'mengajar'   => $mataPelajaran->nama_pelajaran ?? null,
                                                    ];
                                                })
                                                ->values(),
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return ApiResponse::success(
            $formatted,
            'Absensi berhasil diambil'
        );
    }


    /**
     * ✅ Untuk pegawai
     */
    public function store(Request $request)
    {
        Carbon::setLocale('id');

        $pegawai = Auth::guard('kepegawaian')->user();

        if ($pegawai->role != 'guru') {
            return ApiResponse::error('Tidak valid', ['pesan' => 'Anda bukan guru']);
        }

        try {
            $validated = $request->validate([                
                'status' => 'required|in:hadir,tidak hadir',
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id'
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir',
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
            ]);            

            // ambil id pada jadwal pelajaran
            $mataPelajaran = JadwalPelajaran::with('kurikulumMataPelajaran.mataPelajaran')->where('guru_id', $pegawai->id)->first();

            if ($mataPelajaran == null) {
                return ApiResponse::error('Tidak valid', ['pesan' => 'Anda belum memiliki jadwal pelajaran']);
            }

            $kelas = Kelas::where('id', $validated['kelas_id'])->first();

            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiPelajaran::where('guru_pengajar_id', $pegawai->id)
            ->where('jadwal_pelajaran_id', $mataPelajaran->mata_pelajaran_id)
            ->where('kelas_id', $validated['kelas_id'])
            ->whereDate('hari', today())
            ->first();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen di kelas '.$kelas->nama_kelas.' hari ini'], 422);
            }
           
            $absensi = AbsensiPelajaran::create(
                [
                    'guru_pengajar_id' => $pegawai->id,
                    'jadwal_pelajaran_id' => $mataPelajaran->mata_pelajaran_id,
                    'hari' => Carbon::today()->toDateString(),
                    'status' => $validated['status'],
                    'tahun_akademik_id' => $validated['tahun_akademik_id'],
                ]
            );

            $absensi->load('jadwalPelajaran.mataPelajaran', 'guru');           

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_pengajar_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran' => $mataPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,               
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
                'status_kehadiran' => $absensi->status ?? null,                       
                'tahun_akademik_id' => $absensi->jadwalPelajaran->tahunAkademik->id ?? null,                       
                'tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->tahun_akademik ?? null,                       
                'status_tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
                'semester' => $absensi->jadwalPelajaran->tahunAkademik->semester ?? null,                       
                'status_semester' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
            ], 'Data absensi pelajaran '.$mataPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    // ✅ spa: get guru dan seluruh absennya
    public function show($id, Request $request)
    {
        $request->validate([
            'tahun_akademik_id'  => 'required|exists:tahun_akademik,id',
        ], [
            'tahun_akademik_id.required' => 'Tahun akademik wajib ditentukan terlebih dahulu',
            'tahun_akademik_id.exists'  => 'Tahun akademik tidak ditemukan'
        ]);

        $absens = AbsensiPelajaran::with([
            'guru',
            'tahunAkademik',
            'semester',
            'jadwalPelajaran.rombel',
            'jadwalPelajaran.ruangan',
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajaran.semester',
        ])
        ->where('guru_pengajar_id', $id)
        ->where('tahun_akademik_id', $request->tahun_akademik_id)
        ->orderBy('hari', 'asc')
        ->get();

        if ($absens->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $formatted = $absens
            ->groupBy('guru_pengajar_id')
            ->map(function ($guruAbsens) {

                $guru = $guruAbsens->first()->guru;

                return [
                    'guru_id'   => $guru->id ?? null,
                    'nama_guru' => $guru->nama ?? null,
                    'nip'       => $guru->nip ?? null,
                    'nuptk'     => $guru->nuptk ?? null,

                    'periode' => $guruAbsens
                        ->groupBy('tahun_akademik_id')
                        ->sortKeys()
                        ->map(function ($tahunAbsens) {

                            $ta = $tahunAbsens->first()->tahunAkademik;

                            $totalHadirTahun = $tahunAbsens
                                ->where('status', 'hadir')
                                ->count();

                            $totalTidakHadirTahun = $tahunAbsens
                                ->whereIn('status', ['izin', 'sakit', 'alfa', 'tidak hadir'])
                                ->count();

                            return [
                                'tahun_akademik_id'        => $ta->id ?? null,
                                'tahun_akademik'           => $ta->tahun_akademik ?? null,
                                'status_tahun_akademik'    => $ta->status ?? null,
                                'total_hadir_pertahun'     => $totalHadirTahun,
                                'total_tidak_hadir_pertahun' => $totalTidakHadirTahun,

                                'semesters' => $tahunAbsens
                                    ->groupBy('semester_id')
                                    ->sortBy(function ($semesterAbsens) {
                                        return $semesterAbsens->first()->semester->semester === 'Ganjil' ? 1 : 2;
                                    })
                                    ->map(function ($semesterAbsens) {

                                        $smt = $semesterAbsens->first()->semester;

                                        $totalHadirSemester = $semesterAbsens
                                            ->where('status', 'hadir')
                                            ->count();

                                        $totalTidakHadirSemester = $semesterAbsens
                                            ->whereIn('status', ['izin', 'sakit', 'alfa', 'tidak hadir'])
                                            ->count();

                                        return [
                                            'semester_id'   => $smt->id ?? null,
                                            'semester'      => $smt->semester ?? null,
                                            'status_semester' => $smt->status ?? null,
                                            'total_hadir_persemester' => $totalHadirSemester,
                                            'total_tidak_hadir_persemester' => $totalTidakHadirSemester,

                                            'jadwal_pelajarans' => $semesterAbsens
                                                ->groupBy('jadwal_pelajaran_id')
                                                ->map(function ($jadwalAbsens) {

                                                    $first = $jadwalAbsens->first();
                                                    $jp    = $first->jadwalPelajaran;
                                                    $mapel = $jp->kurikulumMataPelajaran->mataPelajaran ?? null;
                                                    $rombel = $jp->rombel ?? null;

                                                    return [
                                                        'jadwal_pelajaran_id'  => $jp->id ?? null,
                                                        'mata_pelajaran'       => $mapel->nama_pelajaran ?? null,
                                                        'hari'                 => $jp->hari ?? null,
                                                        'rombel'               => $rombel->nama_rombel ?? null,
                                                        'jam_mulai'            => $jp->jam_mulai ?? null,
                                                        'jam_selesai'          => $jp->jam_selesai ?? null,
                                                        'ruangan'              => $jp->ruangan->nama_ruangan ?? null,
                                                        'link_opsional'        => $jp->link_opsional ?? null,

                                                        'absensi' => $jadwalAbsens
                                                            ->map(function ($absen) {
                                                                return [
                                                                    'absensi_id' => $absen->id,
                                                                    'hari'       => \Carbon\Carbon::parse($absen->hari)
                                                                        ->translatedFormat('l, d F Y'),
                                                                    'status'     => $absen->status,
                                                                ];
                                                            })
                                                            ->values()
                                                    ];
                                                })
                                                ->values()
                                        ];
                                    })
                                    ->values()
                            ];
                        })
                        ->values()
                ];
            })
            ->values();

        return ApiResponse::success($formatted, 'Data absensi guru berhasil diambil');
    }
    

    // ✅ show all absen sendiri (untuk pegawai)
    public function showAbsenPelajaranSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();

        $absen = AbsensiPelajaran::with([
            'jadwalPelajaran.kelas',
            'jadwalPelajaran.mataPelajaran',
            'guru.kelas',
            'tahunAkademik'
        ])
        ->where('guru_pengajar_id', $user->id)
        ->orderBy('hari', 'desc')
        ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $first = $absen->first();
        $guru  = $first->guru;

        $result = [
            'guru_id'    => $guru->id ?? null,
            'nama_guru'  => $guru->nama ?? null,
            'wali_kelas' => $guru->kelas->nama_kelas ?? null,

            // aturan: 1 guru = 1 mapel
            'mata_pelajaran' =>
                $first->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,

            // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
            'tahun_akademik' => $absen
                ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                ->map(function ($absenPerTahun, $tahunAkademik) {

                    // total tahunan (gabungan ganjil + genap)
                    $totalHadir = $absenPerTahun->where('status', 'hadir')->count();
                    $totalTidakHadir = $absenPerTahun->where('status', 'tidak hadir')->count();

                    // 🔹 GROUP PER SEMESTER (DARI DB)
                    $semester = $absenPerTahun
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                        ->map(function ($absenSemester, $semester) {

                            // 🔹 GROUP PER KELAS
                            $kelas = $absenSemester
                                ->groupBy('jadwalPelajaran.kelas_id')
                                ->map(function ($absenKelas) {

                                    $kelasData = $absenKelas->first()
                                        ->jadwalPelajaran
                                        ->kelas;

                                    return [
                                        'kelas' => $kelasData->nama_kelas ?? null,
                                        'rincian' => $absenKelas->map(function ($abs) {
                                            return [
                                                'absensi_id' => $abs->id,
                                                'hari' => Carbon::parse($abs->hari)
                                                    ->translatedFormat('l, d F Y'),
                                                'status_kehadiran' => $abs->status,
                                            ];
                                        })->values(),
                                    ];
                                })->values();

                            return [
                                'semester' => $semester,
                                'kelas' => $kelas,
                            ];
                        })->values();

                    return [
                        'tahun_akademik' => $tahunAkademik,
                        'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,

                        'total' => [
                            'hadir' => $totalHadir,
                            'tidak_hadir' => $totalTidakHadir,
                        ],

                        'semester' => $semester,
                        'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                    ];
                })->values(),
        ];

        // data untuk select
        // $tahun_akademik = TahunAkademik::where('status', 'aktif')->get();

        return ApiResponse::success(
            [
                'data' => $result,
                // 'data_untuk_select' => $tahun_akademik,
            ],
            'Absensi berhasil diambil'
        );
    }

    /**
     * ✅ untuk super admin
     */
    public function update(Request $request, string $id)
    {
        $absensi = AbsensiPelajaran::with('tahunAkademik', 'semester')->find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        // jika tahun_akademik dan semester pada jadwal sudah arsip maka tidak boleh
         if (!$absensi->semester || $absensi->semester->status === 'arsip') {
            return ApiResponse::error(
                'Not supported',
                'Semester sudah tidak aktif',
                404
            );
        }     
        
        //  if (!$absensi->tahunAkademik || $absensi->tahunAkademik->status === 'arsip') {
        //     return ApiResponse::error(
        //         'Not supported',
        //         'Tahun akademik sudah tidak aktif',
        //         404
        //     );
        // }     

        $validated = $request->validate([            
            'status' => 'sometimes|required|in:hadir,tidak hadir',            
        ], [            
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir atau tidak hadir',                        
        ]);        

        $absensi->update($validated);

        $absensi->load([
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajaran.rombel',
            'guru',
            'tahunAkademik',
            'semester'
        ]);             

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_pengajar' => $absensi->guru->nama ?? null,                
            'mata_pelajaran' => $absensi->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,               
            'rombel' => $absensi->jadwalPelajaran->rombel->nama_rombel ?? null,               
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
            'status_kehadiran' => $absensi->status ?? null,                       
            'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,                       
            'status_tahun_akademik' => $absensi->tahunAkademik->status ?? null,                       
            'semester' => $absensi->semester->semester ?? null,                       
            'status_semester' => $absensi->semester->status ?? null,                       
        ], 'Data absensi berhasil diperbarui');
    }

    /**
     * ✅ untuk super admin
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /absensi/pegawai/pelajaran/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /absensi/pegawai/pelajaran/destroy?ids=7
     */
    public function destroyData(Request $request)
    {
        $ids = $request->ids;

        // VALIDASI FORMAT IDS
        if (!is_array($ids) && !is_numeric($ids)) {
            return response()->json([
                'message' => 'Parameter ids tidak valid. Kirimkan satu id atau array id.'
            ], 422);
        }

        // NORMALISASI JADI ARRAY
        $ids = is_array($ids) ? $ids : [$ids];

        // AMBIL DATA + RELASI
        $absensis = AbsensiPelajaran::with(['tahunAkademik', 'semester'])
            ->whereIn('id', $ids)
            ->get();

        // CEK ID TIDAK DITEMUKAN
        $foundIds   = $absensis->pluck('id')->toArray();
        $invalidIds = array_diff($ids, $foundIds);

        if (!empty($invalidIds)) {
            return response()->json([
                'message' => 'Beberapa ID tidak ditemukan.',
                'invalid_ids' => array_values($invalidIds)
            ], 404);
        }

        // 🔴 CEK JIKA ADA SATU SAJA YANG ARSIP → BATAL SEMUA
        $adaArsip = $absensis->contains(function ($absen) {
            return
                !$absen->tahunAkademik ||
                !$absen->semester ||
                $absen->tahunAkademik->status === 'arsip' ||
                $absen->semester->status === 'arsip';
        });

        if ($adaArsip) {
            return ApiResponse::error(
                'Not supported',
                'Penghapusan dibatalkan. Terdapat absensi dengan tahun akademik atau semester berstatus arsip',
                403
            );
        }

        // 🟢 SEMUA AMAN → HAPUS
        AbsensiPelajaran::whereIn('id', $foundIds)->delete();

        return response()->json([
            'message' => 'Data absensi berhasil dihapus.',
            'deleted_ids' => $foundIds
        ]);
    }


    // ✅ export data ke excel
    /**
     * php artisan make:export AbsensiPegawaiExport --model=AbsensiPegawai
     * Semua data = GET /absensi/pegawai/pelajaran/export
     * Beberapa data = GET /absensi/pegawai/pelajaran/export?ids[]=3&ids[]=5&ids[]=10
     * Satu data = GET /absensi/pegawai/pelajaran/export?ids[]=7
     */
    // ! Masuk sini dan exportnya, tinggal run dan periksa
    public function export(Request $request)
    {
        $ids = $request->input('ids'); 
        $tahun_id = $request->input('tahun_akademik_id');
        $semester_id = $request->input('semester_id');

        // Validasi jika export berdasarkan ID
        if ($ids) {

            $validIds = AbsensiPelajaran::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        $tahunAkademik = TahunAkademik::find($tahun_id);
        $tahun = str_replace(['/','\\',' '], '_', $tahunAkademik->tahun_akademik);

        if (!$tahunAkademik) {
            return ApiResponse::error('Tahun akademik tidak ditemukan');
        }

        $semester = Semester::find($semester_id);

        if (!$semester) {
            return ApiResponse::error('Semester tidak ditemukan');
        }

        return Excel::download(
            new AbsensiPelajaranExport($tahun_id, $semester_id),
            'Absensi_Guru_'.$semester->semester.'_'.$tahun.'.xlsx'
        );
    }

    public function dataSelect() {        

        $data2 = Semester::with('tahunAkademik')->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Belum ada data tahun dan semester');
        }

        $formatted = $data2->groupBy('tahun_akademik_id')
        ->map(function ($tasem) {
            return [
                'tahun_akademik_id' => $tasem->first()->tahunAkademik->id,
                'tahun_akademik'    => $tasem->first()->tahunAkademik->tahun_akademik,
                'status'            => $tasem->first()->tahunAkademik->status,
                'semester'          => $tasem->map(function ($semester) {
                    return [
                        'semester_id'   => $semester->id,
                        'semester'      => $semester->semester,
                        'status'        => $semester->status,
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success([
            'tahun_semester' => $formatted,
        ], 'Data select berhasil diambil');
    }
}
