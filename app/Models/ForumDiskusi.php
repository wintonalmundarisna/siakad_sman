<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Pertemuan;

class ForumDiskusi extends Model
{
    use HasFactory;
    protected $table = 'forum_diskusi';
    protected $guarded = ['id'];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class, 'pertemuan_id');
    }

    public function komentar()
    {
        return $this->hasMany(ForumKomentar::class, 'forum_diskusi_id');
    }    

    public function guru()
    {
        return $this->belongsTo(Kepegawaian::class, 'guru_id');
    }
}
