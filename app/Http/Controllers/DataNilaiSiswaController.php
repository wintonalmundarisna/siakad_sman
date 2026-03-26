<?php

namespace App\Http\Controllers;

use App\Exports\LegerExport;
// use App\Exports\SatuSiswaSemuaNilaiExport; // ini rapor versi excel (yang dipake versi pdf)
use Barryvdh\DomPDF\Facade\Pdf; // rapor versi pdf
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Rapor;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Models\Rombel;
use App\Models\SiswaRombel;
use App\Models\DataNilaiSiswa;
use App\Models\AbsensiSiswa;
use App\Models\IdentitasSekolah;
use App\Models\Kelas;
use Carbon\Carbon;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Validation\Rule;
// use App\Models\Siswa;
// use PDF;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
// use Maatwebsite\Excel\Excel as ExcelWriter;
use DateTime;
use IntlDateFormatter;

class DataNilaiSiswaController extends Controller
{
    // ✅ untuk spa/tu
    // Leger (wajib tentukan dulu tahun, semester dan kelas, biar ga berat)
    // Mengambil semua rombel + siswa + nilai + rapor pada tahun dan semester tertentu    
    public function index(Request $request)
    {
        $request->validate([
            'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            'semester_id'       => 'required|exists:semester,id',
            'kelas_id'          => 'required|exists:kelas,id',
        ], [
            'tahun_akademik_id.required'    => 'Tahun akademik harus ditentukan terlebih dahulu',
            'tahun_akademik_id.exists'      => 'Tahun akademik tidak ditemukan',
            'semester_id.required'          => 'Semester harus ditentukan terlebih dahulu',
            'semester_id.exists'            => 'Semester tidak ditemukan',
            'kelas_id.required'             => 'Kelas harus ditentukan terlebih dahulu',
            'kelas_id.exists'               => 'Kelas tidak ditemukan',
        ]);
    
        $tahun = TahunAkademik::select('id','tahun_akademik','status')
            ->findOrFail($request->tahun_akademik_id);
    
        $semester = Semester::select('id','semester','status')
            ->findOrFail($request->semester_id);
    
        $rombels = Rombel::query()
            ->where('kelas_id', $request->kelas_id)
            ->with([
                'jurusan:id,nama_jurusan',
                'waliRombels' => function ($q) use ($request) {
                    $q->where('tahun_akademik_id', $request->tahun_akademik_id)

                      ->with('wali:id,nama');
                },
                'siswaRombels' => function ($q) use ($request) {
                    $q->where('tahun_akademik_id', $request->tahun_akademik_id)
                      ->with('siswa:id,nama,nis,nisn');
                }
            ])
            ->orderBy('nama_rombel')
            ->get();
    
        if ($rombels->isEmpty()) {
            return ApiResponse::error('Not Found', 'Belum ada data rombel');
        }
    
        $siswaIds = $rombels->flatMap(fn($r) =>
            $r->siswaRombels->pluck('siswa_id')
        )->unique()->values();
    
        $allNilai = DataNilaiSiswa::query()
            ->whereIn('siswa_id', $siswaIds)
            ->where('tahun_akademik_id', $request->tahun_akademik_id)
            ->where('semester_id', $request->semester_id)
            ->with([
                'kurikulumMataPelajaran.mataPelajaran:id,nama_pelajaran',
                'guru:id,nama',
                'rapor'
            ])
            ->get()
            ->groupBy('siswa_id');
    
        $mapelList = $allNilai
            ->flatten()
            ->map(fn($n) => $n->kurikulumMataPelajaran?->mataPelajaran?->nama_pelajaran)
            ->filter()
            ->unique()
            ->values();
    
        $jumlahMapel = $mapelList->count();
    
        $absensiData = AbsensiSiswa::query()
            ->whereIn('siswa_id', $siswaIds)
            ->where('tahun_akademik_id', $request->tahun_akademik_id)
            ->where('semester_id', $request->semester_id)
            ->get()
            ->groupBy('siswa_id');
    
        $rombelsResult = $rombels->map(function ($rombel) use (
            $request, $allNilai, $mapelList, $jumlahMapel, $absensiData
        ) {
    
            $waliData = $rombel->waliRombels
                ->where('tahun_akademik_id', $request->tahun_akademik_id)
                ->first();
    
            $siswas = $rombel->siswaRombels
                ->sortBy(fn($sr) => strtolower($sr->siswa->nama))
                ->map(function ($siswaRombel) use (
                    $allNilai, $mapelList, $jumlahMapel, $absensiData
                ) {
    
                    $siswa = $siswaRombel->siswa;
    
                    // FIX AMBIL NILAI
                    $nilaiCollection = $allNilai->get($siswa->id, collect());
    
                    $rapor = $nilaiCollection->first()?->rapor;
    
                    $totalNilaiAkhir = 0;
                    

                    $dataNilaiPerMapel = [];

                    foreach ($mapelList as $mapel) {

                        $dataNilai = $nilaiCollection->firstWhere(
                            'kurikulumMataPelajaran.mataPelajaran.nama_pelajaran',
                            $mapel
                        );
                    
                        $nilaiAkhir = $dataNilai?->nilai_akhir ?? 0;
                    
                        // ✅ TAMBAHKAN KE TOTAL
                        $totalNilaiAkhir += $nilaiAkhir;
                    
                        $dataNilaiPerMapel[] = [
                            'mata_pelajaran' => $mapel,
                            'nilai_akhir'    => $dataNilai?->nilai_akhir, // tetap null kalau tidak ada
                        ];
                    }
    
                    $rerataNilaiAkhir = $jumlahMapel > 0
                        ? round($totalNilaiAkhir / $jumlahMapel, 2)
                        : 0;
    
                    $absen = $absensiData->get($siswa->id, collect());
    
                    return [
                        'siswa_id'   => $siswa->id,
                        'nama_siswa' => $siswa->nama,
                        'nisn'       => $siswa->nisn,
                        'nis'        => $siswa->nis,
    
                        'peringkat'  => [
                            'total_nilai_akhir' => $totalNilaiAkhir,
                            'rata_rata'         => $rerataNilaiAkhir,
                            'kelas'             => null,
                            'par'               => null,
                        ],
    
                        'absensi' => [
                            'hadir' => $absen->where('status', 'hadir')->count(),
                            'sakit' => $absen->where('status', 'sakit')->count(),
                            'izin'  => $absen->where('status', 'izin')->count(),
                            'alpa'  => $absen->where('status', 'alpa')->count(),
                        ],
    
                        'data_nilai_siswa' => collect($mapelList)->map(function ($mapelNama) use ($nilaiCollection) {

                            $nilai = $nilaiCollection->firstWhere(
                                'kurikulumMataPelajaran.mataPelajaran.nama_pelajaran',
                                $mapelNama
                            );
                        
                            if (!$nilai) {
                                return [
                                    'mata_pelajaran' => $mapelNama,
                                    'point'          => null,
                                ];
                            }
                        
                            $mapel = $nilai->kurikulumMataPelajaran->mataPelajaran;
                        
    
                            if (
                                $nilai->jenis_penilaian == 'PTS' ||
                                $nilai->jenis_penilaian == 'Susulan PTS' ||
                                $nilai->jenis_penilaian == 'Remedial PTS'
                            ) {
                                return [
                                    'data_nilai_siswa_id' => $nilai->id,
                                    'mata_pelajaran'      => $mapel->nama_pelajaran,
                                    'guru_pengajar'       => $nilai->guru->nama,
                                    'jenis_penilaian'     => $nilai->jenis_penilaian,
                                    'point' => [
                                        'absensi'     => $nilai->point_absensi,
                                        'tugas'       => $nilai->point_tugas,
                                        'uts'         => $nilai->point_uts,
                                        'nilai_akhir' => $nilai->nilai_akhir,
                                    ],
                                ];
                            }
    
                            return [
                                'data_nilai_siswa_id' => $nilai->id,
                                'mata_pelajaran'      => $mapel->nama_pelajaran,
                                'guru_pengajar'       => $nilai->guru->nama,
                                'jenis_penilaian'     => $nilai->jenis_penilaian,
                                'point' => [
                                    'absensi'     => $nilai->point_absensi,
                                    'tugas'       => $nilai->point_tugas,
                                    'uas'         => $nilai->point_uas,
                                    'nilai_akhir' => $nilai->nilai_akhir,
                                ],
                            ];
                        })->values(),
    
                        'rapor' => $rapor ? [
                            'rapor_id'          => $rapor->id,
                            'jenis_rapor'       => $rapor->jenis_rapor,
                            'sikap_spiritual'   => $rapor->sikap_spiritual ?? null,
                            'sikap_sosial'      => $rapor->sikap_sosial ?? null,
                            'deskripsi_sikap'   => $rapor->deskripsi_sikap ?? null,
                            'status'            => $rapor->status,
                            'tanggal_terbit'    => $rapor->tanggal_terbit ?? null,
                            'catatan_wali'      => $rapor->catatan_wali ?? null,
                        ] : null,
                    ];
                })
                ->values();
    
            // FIX RANKING KELAS (pakai rata_rata yang benar)
            $rank = 0;
            $lastScore = null;
    
            $siswas = $siswas
                ->sortByDesc(fn($s) => $s['peringkat']['rata_rata'])
                ->values()
                ->map(function ($siswa) use (&$rank, &$lastScore) {
    
                    $currentScore = $siswa['peringkat']['rata_rata'];
    
                    if ($lastScore === null) {
                        $rank = 1;
                    } elseif ($currentScore < $lastScore) {
                        $rank++;
                    }
    
                    $siswa['peringkat']['kelas'] = $rank;
                    $lastScore = $currentScore;
    
                    return $siswa;
                });
    
            return [
                'rombel_id'   => $rombel->id,
                'nama_rombel' => $rombel->nama_rombel,
                'jurusan'     => $rombel->jurusan->nama_jurusan ?? null,
                'wali_rombel' => optional($waliData?->wali)->nama,
                'siswas'      => $siswas->values(),
            ];
        });
    
        // FIX PAR GLOBAL
        $allStudents = $rombelsResult->flatMap(fn($r) => $r['siswas']);
    
        $rank = 0;
        $lastScore = null;
    
        $parRanked = $allStudents
            ->sortByDesc(fn($s) => $s['peringkat']['rata_rata'])
            ->values()
            ->map(function ($siswa) use (&$rank, &$lastScore) {
    
                $currentScore = $siswa['peringkat']['rata_rata'];
    
                if ($lastScore === null) {
                    $rank = 1;
                } elseif ($currentScore < $lastScore) {
                    $rank++;
                }
    
                $siswa['peringkat']['par'] = $rank;
                $lastScore = $currentScore;
    
                return $siswa;
            });
    
        $rombelsResult = $rombelsResult->map(function ($rombel) use ($parRanked) {
    
            $rombel['siswas'] = collect($rombel['siswas'])
                ->map(function ($siswa) use ($parRanked) {
    
                    $match = $parRanked->firstWhere('siswa_id', $siswa['siswa_id']);
    
                    if ($match) {
                        $siswa['peringkat']['par'] = $match['peringkat']['par'];
                    }
    
                    return $siswa;
                })
                ->sortBy(fn($s) => mb_strtolower(trim($s['nama_siswa']))) // ✅ SORT A-Z DI SINI
                ->values()
                ->toArray();
    
            return $rombel;
        });
    
        $result = [[
            'tahun_akademik_id' => $tahun->id,
            'tahun_akademik'    => $tahun->tahun_akademik,
            'status_tahun'      => $tahun->status,
            'semesters' => [[
                'semester_id'     => $semester->id,
                'semester'        => $semester->semester,
                'status_semester' => $semester->status,
                'rombels'         => array_values($rombelsResult->toArray())
            ]]
        ]];
    
        return ApiResponse::success($result, 'Data nilai siswa berhasil ditampilkan');
    }

    // cetak leger
    public function export(Request $request) {    
        $kelas          = Kelas::find($request->kelas_id);
        $semester       = Semester::find($request->semester_id);
        $tahunAkademik  = TahunAkademik::find($request->tahun_akademik_id);
        $tahun          = str_replace(['/','\\',' '], '_', $tahunAkademik->tahun_akademik);

        return Excel::download(
            new LegerExport(
                $request->tahun_akademik_id,
                $request->semester_id,
                $request->kelas_id
            ),            
            'Leger_'.$kelas->nama_kelas.'_'.$semester->semester.'_'.$tahun.'.xlsx'
        );
    }


    /**
     * ✅ untuk guru
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();        

        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'kurikulum_mata_pelajaran_id' => 'required|exists:kurikulum_mata_pelajaran,id',
                'guru_id' => 'required|exists:kepegawaians,id', // otomatis (gaperlu dibuat inputannya)
                'point_absensi' => 'required|numeric',
                'point_tugas' => 'required|numeric',
                'point_uts' => 'required|numeric',
                'point_uas' => 'required|numeric',
                'point_ekskul' => 'nullable|numeric',
                'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',

                'kurikulum_mata_pelajaran_id.required' => 'Kurikulum mata pelajaran wajib diisi',
                'kurikulum_mata_pelajaran_id.exists' => 'Kurikulum mata pelajaran tidak ditemukan',

                'guru_id.required' => 'Guru wajib diisi',                
                'guru_id.exists' => 'Guru tidak ditemukan',
                
                'point_absensi.required' => 'Point absensi wajib diisi',
                'point_absensi.numeric' => 'Wajib diisi angka',

                'point_tugas.required' => 'Point tugas wajib diisi',
                'point_tugas.numeric' => 'Wajib diisi angka',
                
                'point_uts.required' => 'Point uts wajib diisi',
                'point_uts.numeric' => 'Wajib diisi angka',
                
                'point_uas.required' => 'Point uas wajib diisi',
                'point_uas.numeric' => 'Wajib diisi angka',
                
                'point_ekskul.numeric' => 'Wajib diisi angka',

                'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
            ]);            
            
        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('kurikulum_mata_pelajaran_id', $validated['kurikulum_mata_pelajaran_id'])
            ->where('siswa_id', $validated['siswa_id'])
            ->exists();

        if ($sama) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Data Nilai Siswa sudah ada']);
        }
    
        $nilai = DataNilaiSiswa::create([
            'siswa_id' => $validated['siswa_id'],
            'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'],
            'guru_id' => $user->id,
            'point_absensi' => $validated['point_absensi'],
            'point_tugas' => $validated['point_tugas'],
            'point_uts' => $validated['point_uts'],
            'point_uas' => $validated['point_uas'],
            'point_ekskul' => $validated['point_ekskul'],
            'sikap' => $validated['sikap'] ?? null,
        ]);

        $nilai->load('siswa.kelas', 'siswa.jurusan', 'kurikulumMataPelajaran.mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'kurikulum_mata_pelajaran_id' => $nilai->kurikulumMataPelajaran->id,
            'nama_pelajaran'    => $nilai->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran' => $nilai->kurikulumMataPelajaran->jurusan->nama_jurusan,
            'guru_id'           => $nilai->guru_id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap ?? null,            
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    /**
     * ✅ untuk spa/wali kelas
     * detail rapor untuk satu siswa dengan semua nilai dan mapelnya
     */      
    public function semuaNilaiSatuSiswa($id)
    {
        $nilai = DataNilaiSiswa::with([
            'siswa',
            'guru',
            'siswaRombel.rombel.jurusan',
            'kurikulumMataPelajaran.mataPelajaran',
            'tahunAkademik',
            'semester',
        ])
        ->where('siswa_id', $id)
        ->orderBy('tahun_akademik_id')
        ->orderBy('semester_id')
        ->get();

        if ($nilai->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada nilai akhir mata pelajaran apapun');
        }

        $raporCollection = Rapor::with([
            'waliRombel.wali',
            'waliRombel.rombel'
        ])
        ->where('siswa_id', $id)
        ->get()
        ->groupBy(function ($item) {
            return $item->tahun_akademik_id . '-' . $item->semester_id;
        });

        $first = $nilai->first();
        $last  = $nilai->last();

        $formatted = [
            'siswa' => [
                'siswa_id'  => $first->siswa->id,
                'nama'      => $first->siswa->nama,
                'nisn'      => $first->siswa->nisn,
                'nis'       => $first->siswa->nis,
            ],

            'rombel_saat_ini' => [
                'rombel_id'     => $last->siswaRombel->rombel->id ?? null,
                'nama_rombel'   => $last->siswaRombel->rombel->nama_rombel ?? null,
                'jurusan'       => $last->siswaRombel->rombel->jurusan->nama_jurusan ?? null,
                'status_akhir'  => $last->siswaRombel->status_akhir ?? null,
                'catatan'       => $last->siswaRombel->catatan ?? null,
            ],

            'tahun_akademik' => $nilai
                ->groupBy('tahun_akademik_id')
                ->map(function ($tahunGroup) use ($raporCollection) {

                    $tahun = $tahunGroup->first()->tahunAkademik;

                    return [
                        'tahun_akademik_id' => $tahun->id,
                        'tahun_akademik'    => $tahun->tahun_akademik,
                        'status'            => $tahun->status,

                        'semester' => $tahunGroup
                            ->groupBy('semester_id')
                            ->map(function ($semesterGroup) use ($tahun, $raporCollection) {

                                $semester = $semesterGroup->first()->semester;
                                $key = $tahun->id . '-' . $semester->id;
                                $rapor = $raporCollection[$key][0] ?? null;

                                return [
                                    'semester_id'=> $semester->id,
                                    'semester'   => $semester->semester,
                                    'status'     => $semester->status,

                                    'data_nilai_siswa' => $semesterGroup
                                        ->groupBy('jenis_penilaian')
                                        ->map(function ($group, $jenis) {

                                            return [
                                                'jenis_penilaian' => $jenis,
                                                'mata_pelajaran' => $group->map(function ($mapel) {

                                                    $isPTS = in_array($mapel->jenis_penilaian, [
                                                        'PTS',
                                                        'Susulan PTS',
                                                        'Remedial PTS'
                                                    ]);

                                                    if ($isPTS) {
                                                        $point = [
                                                            'absensi'     => $mapel->point_absensi,
                                                            'tugas'       => $mapel->point_tugas,
                                                            'uts'         => $mapel->point_uts,
                                                            'nilai_akhir' => $mapel->nilai_akhir,
                                                            'predikat'    => $mapel->predikat,
                                                            'deskripsi'   => $mapel->deskripsi,
                                                        ];
                                                    } else {
                                                        $point = [
                                                            'absensi'     => $mapel->point_absensi,
                                                            'tugas'       => $mapel->point_tugas,
                                                            'uas'         => $mapel->point_uas,
                                                            'nilai_akhir' => $mapel->nilai_akhir,
                                                            'predikat'    => $mapel->predikat,
                                                            'deskripsi'   => $mapel->deskripsi,
                                                        ];
                                                    }

                                                    return [
                                                        'data_nilai_siswa_id'   => $mapel->id,
                                                        'mata_pelajaran_id'     => $mapel->kurikulumMataPelajaran->mataPelajaran->id ?? null,
                                                        'mata_pelajaran'        => $mapel->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                                                        'guru_pengajar'         => $mapel->guru->nama ?? null,
                                                        'point'                 => $point,
                                                    ];
                                                })->values(),
                                            ];
                                        })->values(),

                                    'rapor' => $rapor ? [
                                        'rapor_id'        => $rapor->id,
                                        'jenis_rapor'     => $rapor->jenis_rapor,
                                        'sikap_spiritual' => $rapor->sikap_spiritual,
                                        'sikap_sosial'    => $rapor->sikap_sosial,
                                        'deskripsi_sikap' => $rapor->deskripsi_sikap,
                                        'status'          => $rapor->status,
                                        'tanggal_terbit'  => $rapor->tanggal_terbit,
                                        'catatan_wali'    => $rapor->catatan_wali,
                                        'wali_rombel'     => $rapor->waliRombel?->wali?->nama,
                                        'rombel'          => $rapor->waliRombel?->rombel?->nama_rombel,
                                    ] : null,
                                ];
                            })->values(),
                    ];
                })->values(),
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diambil');
    }

    
    // Export excel satu siswa semua mapel (rapor)   
    // public function cetakRapor(Request $request)
    // {
    //     $tahunAkademik  = TahunAkademik::find($request->tahun_akademik_id);
    //     $tahun          = str_replace(['/','\\',' '], '_', $tahunAkademik->tahun_akademik);
    //     $semester       = Semester::find($request->semester_id);

    //     $rombel         = Rombel::find($request->rombel_id);

    //     if (!$rombel) {
    //         return ApiResponse::error('Rombel tidak ditemukan');
    //     }

    //     return Excel::download(
    //         new SatuSiswaSemuaNilaiExport(
    //             $request->tahun_akademik_id,
    //             $request->semester_id,
    //             $request->rombel_id,
    //             $request->jenis_penilaian
    //         ),            
    //         'Rapor_'.$rombel->nama_rombel.'_'.$semester->semester.'_'.$tahun.'.xlsx'            
    //     );
    // }

    // Rapor versi pdf    
    public function cetakRapor(Request $request)
    {
        $tahunAkademik  = TahunAkademik::find($request->tahun_akademik_id);
        $semester       = Semester::find($request->semester_id);
        $rombel         = Rombel::find($request->rombel_id);

        if (!$rombel) {
            return ApiResponse::error('Rombel tidak ditemukan');
        }

        $siswaRombel = SiswaRombel::with('siswa')
            ->where('rombel_id',$request->rombel_id)
            ->where('tahun_akademik_id',$request->tahun_akademik_id)
            ->get();

        $data = [];

        foreach($siswaRombel as $sr){

            $nilai = DataNilaiSiswa::query()

            ->join('kurikulum_mata_pelajaran','data_nilai_siswa.kurikulum_mata_pelajaran_id','=','kurikulum_mata_pelajaran.id')
            ->join('mata_pelajarans','kurikulum_mata_pelajaran.mata_pelajaran_id','=','mata_pelajarans.id')

            ->where('data_nilai_siswa.siswa_id',$sr->siswa_id)
            ->where('data_nilai_siswa.semester_id',$request->semester_id)
            ->where('data_nilai_siswa.tahun_akademik_id',$request->tahun_akademik_id)
            ->where('data_nilai_siswa.jenis_penilaian',$request->jenis_penilaian)

            ->select(
                'mata_pelajarans.nama_pelajaran',
                'data_nilai_siswa.nilai_akhir'
            )
            ->get();

            $absensi = AbsensiSiswa::selectRaw("
                SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'alpa' THEN 1 ELSE 0 END) as alpa
            ")
            ->where('siswa_id',$sr->siswa_id)
            ->where('semester_id',$request->semester_id)
            ->where('tahun_akademik_id',$request->tahun_akademik_id)
            ->first();

            $data[] = [
                'siswa' => $sr->siswa,
                'nilai' => $nilai,
                'absensi' => $absensi
            ];
        }

        $kepsek = IdentitasSekolah::first();

        $formatter = new \IntlDateFormatter('id_ID', \IntlDateFormatter::LONG, \IntlDateFormatter::NONE);
        $formatter->setPattern('d MMMM yyyy');
        $tanggal = 'Jakarta, '.$formatter->format(new DateTime());

        $pdf = Pdf::loadView('rapor.pdf',[
            'data'=>$data,
            'semester'=>$semester,
            'tahun'=>$tahunAkademik,
            'rombel'=>$rombel,
            'kepsek'=>$kepsek,
            'tanggal' => $tanggal
        ])->setPaper('A4','portrait')->setOption('isRemoteEnabled', true);

        return $pdf->download('rapor_'.$rombel->nama_rombel.'.pdf');
    }



    // ✅ get all data nilai siswa sendiri (untuk guru)
    // public function getAllDataNilaiSendiri()
    // {
    //     $user = Auth::guard('kepegawaian')->user();
    
    //     $siswa = Siswa::with([
    //         'kelas',
    //         'jurusan',
    //         'dataNilaiSiswas',
    //         'jadwalPelajarans.guru',
    //         'jadwalPelajarans.kelas',
    //         'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
    //         'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
    //         'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
    //         'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
    //     ])->find($user->id);
    
    //     if (!$siswa) {
    //         return ApiResponse::error('Not found', ['Data siswa tidak ditemukan']);
    //     }
    
    //     /**
    //      * 🔹 Flatten jadwal → group by tahun akademik
    //      */
    //     $tahunAkademik = $siswa->jadwalPelajarans
    //         ->groupBy(fn ($jadwal) =>
    //             $jadwal->kurikulumMataPelajaran->tahunAkademik->id
    //         )
    //         ->map(function ($jadwalPerTahun) use ($siswa) {
    
    //             $ta = $jadwalPerTahun->first()
    //                 ->kurikulumMataPelajaran
    //                 ->tahunAkademik;
    
    //             return [
    //                 'tahun_akademik_id' => $ta->id,
    //                 'tahun_akademik'    => $ta->tahun_akademik,
    //                 'semester'          => $ta->semester,
    //                 'status'            => $ta->status,
    
    //                 'kurikulum_mata_pelajaran' => $jadwalPerTahun
    //                     ->groupBy(fn ($jadwal) =>
    //                         $jadwal->kurikulum_mata_pelajaran_id
    //                     )
    //                     ->map(function ($jadwalPerKmp) use ($siswa) {
    
    //                         $jadwal = $jadwalPerKmp->first();
    //                         $kmp    = $jadwal->kurikulumMataPelajaran;
    
    //                         $nilai = $siswa->dataNilaiSiswas
    //                             ->firstWhere(
    //                                 'kurikulum_mata_pelajaran_id',
    //                                 $kmp->id
    //                             );
    
    //                         return [
    //                             'kurikulum_mata_pelajaran_id' => $kmp->id,
    //                             'kurikulum' => $kmp->kurikulum->nama_kurikulum ?? null,
    //                             'mata_pelajaran' => $kmp->mataPelajaran->nama_pelajaran ?? null,
    //                             'jurusan_pelajaran' => $kmp->jurusan->nama_jurusan ?? null,
    //                             'tingkat' => $kmp->tingkat,
    //                             'nilai_kkm' => $kmp->nilai_kkm,
    //                             'status_mata_pelajaran' => $kmp->status_mata_pelajaran,
    
    //                             'jadwal_pelajaran' => [
    //                                 'hari'        => $jadwal->hari,
    //                                 'jam_mulai'   => $jadwal->jam_mulai,
    //                                 'jam_selesai' => $jadwal->jam_selesai,
    //                                 'ruangan'     => $jadwal->ruangan,
    //                                 'link_opsional' => $jadwal->link_opsional,
    
    //                                 'guru' => [
    //                                     'guru_id'   => $jadwal->guru->id ?? null,
    //                                     'nama_guru' => $jadwal->guru->nama ?? null,
    //                                 ],
    
    //                                 'kelas' => $jadwal->kelas->nama_kelas ?? null,
    //                             ],
    
    //                             'nilai_siswa' => $nilai ? [
    //                                 'point_absensi' => $nilai->point_absensi,
    //                                 'point_tugas'   => $nilai->point_tugas,
    //                                 'point_uts'     => $nilai->point_uts,
    //                                 'point_uas'     => $nilai->point_uas,
    //                                 'point_ekskul'  => $nilai->point_ekskul,
    //                                 'sikap'         => $nilai->sikap,
    //                             ] : null,
    //                         ];
    //                     })->values(),
    //             ];
    //         })->values();
    
    //     return ApiResponse::success([
    //         'siswa' => [
    //             'siswa_id' => $siswa->id,
    //             'nisn'     => $siswa->nisn,
    //             'nis'      => $siswa->nis,
    //             'nama'     => $siswa->nama,
    //             'kelas'    => $siswa->kelas->nama_kelas ?? null,
    //             'jurusan'  => $siswa->jurusan->nama_jurusan ?? null,
    //         ],
    //         'tahun_akademik' => $tahunAkademik
    //     ], 'Data nilai siswa berhasil diambil');
    // }
    

    /**
     * ✅ untuk guru
     */
    public function update(Request $request, string $id)
    {
        $nilai = DataNilaiSiswa::find($id);

        $user = Auth::guard('kepegawaian')->user();

        if (!$nilai) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'point_absensi' => 'sometimes|required|numeric',            
            'point_tugas' => 'sometimes|required|numeric',            
            'point_uts' => 'sometimes|required|numeric',            
            'point_uas' => 'sometimes|required|numeric',            
            'point_ekskul' => 'sometimes|numeric',            
            'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
        ], [
            'point_absensi.required' => 'Point absensi wajib diisi',
            'point_absensi.numeric' => 'Wajib diisi angka',

            'point_tugas.required' => 'Point tugas wajib diisi',
            'point_tugas.numeric' => 'Wajib diisi angka',
                
            'point_uts.required' => 'Point uts wajib diisi',
            'point_uts.numeric' => 'Wajib diisi angka',
                
            'point_uas.required' => 'Point uas wajib diisi',
            'point_uas.numeric' => 'Wajib diisi angka',
                
            'point_ekskul.numeric' => 'Wajib diisi angka',

            'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
        ]);

        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('kurikulum_mata_pelajaran_id', $nilai->kurikulum_mata_pelajaran_id)
            ->where('siswa_id', $nilai->siswa_id)
            ->first();

        if ($sama != null) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Siswa dengan mata pelajaran dan jurusan ini sudah ada']);
        }

        // yang tidak boleh diubah: siswa_id, mata_pelajaran_id, guru_id
        $nilai->update(
            [
                'siswa_id' => $nilai->siswa_id ?? null,
                'kurikulum_mata_pelajaran_id' => $nilai->kurikulum_mata_pelajaran_id ?? null,
                'guru_id' => $nilai->guru_id ?? null,
                'point_absensi' => $validated['point_absensi'] ?? null,
                'point_tugas' => $validated['point_tugas'] ?? null,
                'point_uts' => $validated['point_uts'] ?? null,
                'point_uas' => $validated['point_uas'] ?? null,
                'point_ekskul' => $validated['point_ekskul'] ?? null,
                'sikap' => $validated['sikap'] ?? null,
            ]
        );
        
        $nilai->load('siswa.kelas', 'siswa.jurusan', 'kurikulumMataPelajaran.mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'kurikulum_mata_pelajaran_id' => $nilai->kurikulumMataPelajaran->id,
            'nama_pelajaran'    => $nilai->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran' => $nilai->kurikulumMataPelajaran->jurusan->nama_jurusan,
            'guru_id'           => $nilai->guru_id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap ?? null,            
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diupdate');
    }

    /**
     * ✅ untuk guru
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /pegawai/data-nilai-siswa/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /pegawai/data-nilai-siswa/destroy?ids=7
     */ 
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = DataNilaiSiswa::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            DataNilaiSiswa::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data nilai siswa berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = DataNilaiSiswa::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data nilai siswa berhasil dihapus.',
                'deleted_id' => $ids
            ]);
        }

        return response()->json([
            'message' => 'Parameter ids tidak valid. Kirimkan satu id, atau array id.'
        ], 422);
    }    



    // spa/tu/guru hanya mengambil siswa yang aktif di tahun dan semester aktif
    // http://127.0.0.1:8000/api/spa/nilai-siswa/aktif
    /**
     * Ini hanya mengambil siswa yang aktif saja. Berikan button/link yang mengarah ke API dibawah ini untuk melihat absensi siswa per tahun dan per semester yang nantinya digunakan sebagai bahan pertimbangan guru dalam mengisi kolom point_absensi.
     * Ini juga digunakan sebagai data select (biar sekalian) karna mengandung siswa_id, tahun, dan rombel. berikan button lagi dengan nama "input nilai" atau bebas terserah di sebelah/sejajar dengan button yang atas, yang nantinya diarahkan ke form create data nilai siswa untuk guru
     * Link API (id siswa):
     * http://127.0.0.1:8000/api/spa/absensi/siswa/pelajaran/200
     * Nanti sebenernya ada button lagi. sejajar sama dua button di atas. itu referensi nilai tugas harian. tapi karna lms belum jadi, maka saat ini isi manual dulu point_tugas
     */
    // public function selectDanReferensi()
    // {
    //     // ambil hanya siswa rombel pada tahun akademik yang aktif
    //     $data = SiswaRombel::with([
    //             'tahunAkademik',
    //             'rombel.kelas',
    //             'siswa',
    //         ])
    //         ->whereHas('tahunAkademik', function ($ta) {
    //             $ta->where('status', 'aktif');
    //         })
    //         ->get();

    //     if ($data->isEmpty()) {
    //         return ApiResponse::error('Not found', 'Belum ada data siswa dan rombel pada tahun aktif');
    //     }

    //     $siswaRombel = $data->groupBy('tahun_akademik_id')
    //         ->sortKeys()
    //         ->map(function ($siswaRmbl) {

    //             $tahun = $siswaRmbl->first()->tahunAkademik;

    //             return [
    //                 'tahun_akademik_id' => $tahun->id,
    //                 'tahun_akademik'    => $tahun->tahun_akademik,
    //                 'status_tahun'      => $tahun->status,

    //                 'rombel' => $siswaRmbl->groupBy('rombel_id')
    //                     ->sortKeys()
    //                     ->map(function ($siswaR) {

    //                         $rombel = $siswaR->first()->rombel;

    //                         return [
    //                             'rombel_id' => $rombel->id,
    //                             'rombel'    => $rombel->nama_rombel,

    //                             'siswa' => $siswaR->map(function ($item) {
    //                                 return [
    //                                     'siswa_id'     => $item->siswa->id,
    //                                     'nama'         => $item->siswa->nama,
    //                                     'nisn'         => $item->siswa->nisn,
    //                                     'nis'          => $item->siswa->nis,
    //                                     'status_akhir' => $item->status_akhir,
    //                                     'catatan'      => $item->catatan,
    //                                 ];
    //                             })->values(),
    //                         ];
    //                     })->values(),
    //             ];
    //         })->values();

    //     return ApiResponse::success($siswaRombel, 'Siswa pada tahun aktif berhasil diambil');
    // }    




    // ✅ untuk leger/index
    public function dataSelect() {        
        $data2 = Semester::with('tahunAkademik')->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada data tahun akademik dan semester');
        }

        $tahunDanSemester = $data2->groupBy('tahun_akademik_id')
        ->map(function ($tahunAkademik) {
            return [
                'tahun_akademik_id' => $tahunAkademik->first()->tahunAkademik->id,
                'tahun_akademik'    => $tahunAkademik->first()->tahunAkademik->tahun_akademik,
                'status'            => $tahunAkademik->first()->tahunAkademik->status,
                'semester'          => $tahunAkademik->map(function ($taSemester) {
                    return [
                        'semester_id'   => $taSemester->id,
                        'semester'      => $taSemester->semester,
                        'status'        => $taSemester->status,
                    ];
                })->values(),
            ];
        })->values();


        // Kelas
        $data3 = Kelas::get();

        $kelas = $data3->map(function ($kls) {
            return [
                'kelas_id'  => $kls->id,
                'kelas'     => $kls->nama_kelas,
                'tingkat'   => $kls->tingkat,
                'status'    => $kls->status,
            ];
        })->values();        

        return ApiResponse::success([
            'tahun_dan_semester'    => $tahunDanSemester,
            'kelas'                 => $kelas,            
        ], 'Data select leger berhasil diambil');
    }

    public function dataSelectSatuSiswa() {      
        $data2 = Semester::with('tahunAkademik')->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada data tahun akademik dan semester');
        }

        $tahunDanSemester = $data2->groupBy('tahun_akademik_id')
        ->map(function ($tahunAkademik) {
            return [
                'tahun_akademik_id' => $tahunAkademik->first()->tahunAkademik->id,
                'tahun_akademik'    => $tahunAkademik->first()->tahunAkademik->tahun_akademik,
                'status'            => $tahunAkademik->first()->tahunAkademik->status,
                'semester'          => $tahunAkademik->map(function ($taSemester) {
                    return [
                        'semester_id'   => $taSemester->id,
                        'semester'      => $taSemester->semester,
                        'status'        => $taSemester->status,
                    ];
                })->values(),
            ];
        })->values();
        

        $jenis = [
            'PTS'   => 'PTS',
            'PAS'   => 'PAS',
            'Susulan PTS'   => 'Susulan PTS',
            'Susulan PAS'   => 'Susulan PAS',
            'Remedial PTS'   => 'Remedial PTS',
            'Remedial PAS'   => 'Remedial PAS'
        ];

        $data3 = Rombel::get();

        if ($data3->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada rombel');
        }

        $rombel = $data3->map(function ($rmbl) {
            return [
                'rombel_id'     => $rmbl->id,
                'nama_rombel'   => $rmbl->nama_rombel,
                'jurusan'       => $rmbl->jurusan->nama_jurusan ?? null
            ];
        })->values();

        return ApiResponse::success([
            'tahun_dan_semester'    => $tahunDanSemester,
            'rombel'                => $rombel,
            'jenis_penilaian'       => $jenis
        ], 'Data select rapor berhasil diambil');
    }
}