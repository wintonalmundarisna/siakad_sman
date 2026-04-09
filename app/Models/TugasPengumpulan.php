<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Tugas;
use App\Models\Siswa;

class TugasPengumpulan extends Model
{
    use HasFactory;
    protected $table = 'tugas_pengumpulan';

    // protected $fillable = [
    //     'tugas_id',
    //     'siswa_id',
    //     'file_jawaban',
    //     'jawaban_cbt',
    //     'nilai',
    //     'waktu_mulai',
    //     'waktu_kumpul'
    // ];

    protected $guarded = ['id'];

    protected $casts = [
        'jawaban_cbt' => 'array'
    ];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class);
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }
}
