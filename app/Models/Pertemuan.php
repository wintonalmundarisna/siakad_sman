<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\JurnalKbm;
use App\Models\Materi;
use App\Models\ForumDiskusi;
use App\Models\Tugas;

class Pertemuan extends Model
{
    use HasFactory;

    protected $table = 'pertemuan';
    protected $guarded = ['id'];

    public function jurnal()
    {
        return $this->hasOne(JurnalKbm::class);
    }

    public function materi()
    {
        return $this->hasMany(Materi::class);
    }

    public function forum()
    {
        return $this->hasMany(ForumDiskusi::class);
    }

    public function tugas()
    {
        return $this->hasMany(Tugas::class);
    }
}
