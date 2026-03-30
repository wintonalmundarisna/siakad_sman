<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JurnalKbm extends Model
{
    use HasFactory;

    protected $table = 'jurnal_kbm';
    protected $guarded = ['id'];
}
