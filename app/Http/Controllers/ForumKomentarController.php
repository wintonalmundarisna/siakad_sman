<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ForumKomentar;
use App\Helpers\ApiResponse;
use Carbon\Carbon;

class ForumKomentarController extends Controller
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
        // Jika siswa komentar
        // $siswa->komentarForum()->create([
        //     'forum_diskusi_id' => $forumId,
        //     'komentar' => 'Saya kurang paham materi ini'
        // ]);

        // jika guru komentar
        // $guru->komentarForum()->create([
        //     'forum_diskusi_id' => $forumId,
        //     'komentar' => 'Silakan baca modul halaman 10'
        // ]);

        // laravel otomatis isi
        // commentable_id
        // commentable_type
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        Carbon::setLocale('id');        

        $komentar = ForumKomentar::with(['forumDiskusi.guru','commentable'])
            ->where('forum_diskusi_id', $id)
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->cursorPaginate(20);

        // cek apakah ada komentar
        if ($komentar->isEmpty()) {
            return ApiResponse::error('Belum ada komentar pada diskusi ini');
        }

        // ambil forum dari komentar pertama
        $forum = $komentar->first()->forumDiskusi;

        // format komentar
        $listKomentar = $komentar->map(function ($item) {
            return [
                'id' => $item->id,
                'komentar' => $item->komentar,
                'komentator' => [
                    'id'   => $item->commentable->id ?? null,
                    'nama' => $item->commentable->nama ?? null,
                    // 'type' => class_basename($item->commentable_type),
                    'tipe' => $item->commentable?->role ? ucfirst($item->commentable->role) : null,
                    'created_at' => $item->created_at?->translatedFormat('l, d F Y - H.i'),
                ],
            ];
        });

        $formatted = [
            'forum_diskusi' => [
                'id'            => $forum->id,
                'judul'         => $forum->judul,
                'deskripsi'     => $forum->deskripsi,
                'pembuat_forum' => $forum->guru->nama ?? null,
            ],
            'komentar' => $listKomentar,
            'next_cursor' => $komentar->nextCursor()?->encode(),
            'prev_cursor' => $komentar->previousCursor()?->encode(),
        ];

        return ApiResponse::success($formatted, 'Forum komentar berhasil diambil');
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
