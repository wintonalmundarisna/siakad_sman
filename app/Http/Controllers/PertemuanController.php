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
    public function index(string $id)
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
                    'judul'         => $p->judul,
                    'pertemuan_ke'  => $p->pertemuan_ke,
                    'tanggal'       => Carbon::parse($p->tanggal)->translatedFormat('l, d F Y') ?? null,
                    'jenis'         => $p->jenis,
                ];
            })->values()
        ];

        return ApiResponse::success($formatted, 'Pertemuan berhasil ditampilkan');
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
        Carbon::setLocale('id');

        $pertemuan = Pertemuan::with([
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajaran.tahunAkademik',
            'jadwalPelajaran.semester',
            'jadwalPelajaran.rombel',
            'jadwalPelajaran.guru',
            'jadwalPelajaran.ruangan',
            'absensiPelajaran.guru',
            'absensiSiswa.siswa',
            'jurnal',
            'materi',
            'forumDiskusi.guru',
            'tugas',
        ])->find($id);

        if (!$pertemuan) {
            return ApiResponse::error('Pertemuan tidak ditemukan');
        }        

        $jadwal = $pertemuan->jadwalPelajaran;
        
        $formatted = [
            'jadwal_pelajaran_id' => $jadwal?->id,

            'mata_pelajaran' => $jadwal?->kurikulumMataPelajaran?->mataPelajaran?->nama_pelajaran,

            'tahun_akademik' => $jadwal?->tahunAkademik?->tahun_akademik,

            'semester' => $jadwal?->semester?->semester,

            'rombel' => $jadwal?->rombel?->nama_rombel,

            'guru' => $jadwal?->guru?->nama,

            'hari' => $jadwal?->hari,

            'jam_mulai' => $jadwal?->jam_mulai,

            'jam_selesai' => $jadwal?->jam_selesai,

            'ruangan' => $jadwal?->ruangan?->nama_ruangan,

            'link_opsional' => $jadwal?->link_opsional,

            // Terbuat otomatis
            'pertemuan' => [
                'pertemuan_id' => $pertemuan->id,
                'judul' => $pertemuan->judul,
                'pertemuan_ke' => $pertemuan->pertemuan_ke,
                'tanggal' => $pertemuan->tanggal
                    ? Carbon::parse($pertemuan->tanggal)->translatedFormat('l, d F Y')
                    : null,
                'jenis' => $pertemuan->jenis,

                // Manual
                'jurnal_kbm' => $pertemuan->jurnal ? [
                    'jurnal_kbm_id' => $pertemuan->jurnal?->id,
                    'uraian_kegiatan' => $pertemuan->jurnal?->uraian_kegiatan,
                    'metode' => $pertemuan->jurnal?->metode,
                    'catatan' => $pertemuan->jurnal?->catatan,
                ] : null,
    
                // Manual
                'materi' => $pertemuan->materi ? [
                    'materi_id' => $pertemuan->materi?->id,
                    'judul' => $pertemuan->materi?->judul,
                    'deskripsi' => $pertemuan->materi?->deskripsi,
                    'file' => $pertemuan->materi?->file
                        ? asset(str_replace('public/', 'storage/', $pertemuan->materi->file))
                        : null,
                    'link_video' => $pertemuan->materi?->link_video,
                ] : null,
    
                // Manual
                'forum_diskusi' => $pertemuan->forumDiskusi ? [
                    'forum_diskusi_id' => $pertemuan->forumDiskusi?->id,
                    'judul' => $pertemuan->forumDiskusi?->judul,
                    'deskripsi' => $pertemuan->forumDiskusi?->deskripsi,
                    'dibuat_oleh' => $pertemuan->forumDiskusi?->guru?->nama,
                ] : null,
                
                // Manual
                'tugas' => $pertemuan->tugas ? [
                    'tugas_id'       => $pertemuan->tugas?->id,
                    'judul'          => $pertemuan->tugas?->judul,
                    'tipe_tugas'     => $pertemuan->tugas?->tipe_tugas,
                    'deskripsi'      => $pertemuan->tugas?->deskripsi,                    
                    'file_soal'      => $pertemuan->tugas?->file_soal
                    ? asset(str_replace('public/', 'storage/', $pertemuan->tugas?->file_soal))
                    : null,
                    'deadline' => $pertemuan->tugas?->deadline ? Carbon::parse($pertemuan->tugas->deadline)->translatedFormat('l, d F Y - H.i') : null,
                ] : null,

                // Manual
                'absensi_guru'   => $pertemuan->absensiPelajaran ? [
                    'absensi_guru_id'   => $pertemuan->absensiPelajaran->id,
                    'nama_guru'         => $pertemuan->absensiPelajaran->guru->nama,
                    'hari'              => $pertemuan->absensiPelajaran->hari?->translatedFormat('l, d F Y - H.i'),
                    'status'            => $pertemuan->absensiPelajaran->status,
                ] : null,

                'absensi_siswa' => $pertemuan->absensiSiswa ? $pertemuan->absensiSiswa->map(function ($absenSiswa) {
                    return [
                        'absensi_siswa_id'  => $absenSiswa->id,
                        'nama_siswa'        => $absenSiswa->siswa->nama,
                        'nis'               => $absenSiswa->siswa->nis,
                        'nisn'              => $absenSiswa->siswa->nisn,
                        'hari'              => $absenSiswa->hari?->translatedFormat('l, d F Y - H.i'),
                        'status'            => $absenSiswa->status,
                        'bukti'             => $absenSiswa?->bukti ? asset(str_replace('public/', 'storage/', $absenSiswa?->bukti))
                        : null,
                    ];
                })->values() : null,
            ],            
        ];

        return ApiResponse::success($formatted, 'Detail pertemuan berhasil ditampilkan');
    }

    /**
     * SPA/GURU
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
