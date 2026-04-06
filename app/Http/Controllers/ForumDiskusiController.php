<?php

namespace App\Http\Controllers;

// use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use Carbon\Carbon;
use App\Models\ForumDiskusi;

class ForumDiskusiController extends Controller
{
    public function show(string $id) {
        $forum = ForumDiskusi::with([
            'pertemuan.jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'pertemuan.jadwalPelajaran.tahunAkademik',
            'pertemuan.jadwalPelajaran.semester',
            'pertemuan.jadwalPelajaran.guru',
            'pertemuan.jadwalPelajaran.rombel',
        ])
        ->where('pertemuan_id', $id)
        ->first();

        if (!$forum) {
            return ApiResponse::error('Forum diskusi tidak ditemukan');
        }

        $formatted = [
            'pertemuan_id'      => $forum->pertemuan->id,
            'judul_pertemuan'   => $forum->pertemuan->judul ?? null,
            'pertemuan_ke'      => $forum->pertemuan->pertemuan_ke,
            'tanggal_pertemuan' => Carbon::parse($forum->pertemuan->tanggal)->translatedFormat('l, d F Y') ?? null,
            'jenis_pertemuan'   => $forum->pertemuan->jenis,
            'tahun_akademik'    => $forum->pertemuan->jadwalPelajaran->tahunAkademik->tahun_akademik,
            'semester'          => $forum->pertemuan->jadwalPelajaran->semester->semester,
            'mata_pelajaran'    => $forum->pertemuan->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'rombel'            => $forum->pertemuan->jadwalPelajaran->rombel->nama_rombel,
            'guru'              => $forum->pertemuan->jadwalPelajaran->guru->nama,
            'forum_diskusi'        => [
                'forum_diskusi_id' => $forum->id,
                'judul'       => $forum->judul,
                'deskripsi'   => $forum->deskripsi ?? null,
                'created_by'  => $forum->created_by ?? null,
            ],
        ];

        return ApiResponse::success($formatted, 'Forum diskusi berhasil ditampilkan');
    }
}
