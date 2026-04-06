<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ForumKomentar extends Model
{
    use HasFactory;
    protected $table = 'forum_komentar';
    protected $guarded = ['id'];

    public function forumDiskusi()
    {
        return $this->belongsTo(ForumDiskusi::class);
    }

    // agar siswa ataupun pegawai bisa dideteksi
    public function commentable()
    {
        return $this->morphTo();
    }
}
