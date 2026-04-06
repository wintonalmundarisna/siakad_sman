<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\JurnalKbm;
use App\Models\Materi;
use App\Models\ForumDiskusi;
use App\Models\Tugas;
use App\Models\JadwalPelajaran;

class Pertemuan extends Model
{
    use HasFactory;

    protected $table = 'pertemuan';
    protected $guarded = ['id'];

    public function jadwalPelajaran()
    {
        return $this->belongsTo(JadwalPelajaran::class, 'jadwal_pelajaran_id');
    }

    public function jurnal()
    {
        return $this->hasOne(JurnalKbm::class);
    }

    public function materi()
    {
        return $this->hasOne(Materi::class);
    }

    public function forumDiskusi()
    {
        return $this->hasOne(ForumDiskusi::class);
    }

    public function tugas()
    {
        return $this->hasOne(Tugas::class);
    }
}
