<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\TugasPengumpulan;

class Tugas extends Model
{
    use HasFactory;
    protected $table = 'tugas';
    protected $guarded = ['id'];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class, 'pertemuan_id');
    }

    // satu tugas punya banyak pengumpulan
    public function pengumpulan()
    {
        return $this->hasMany(TugasPengumpulan::class, 'tugas_id');
    }
}
