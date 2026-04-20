<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('absensi_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            
            
            $table->foreignId('pertemuan_id')->constrained('pertemuan')->cascadeOnDelete();
            
            
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa']);
            
            $table->string('bukti')->nullable();                        

            $table->foreignId('siswa_rombel_id')->constrained('siswa_rombel'); // Sudah ada di jadwal
            
            $table->foreignId('jadwal_pelajaran_id')->constrained('jadwal_pelajarans')->cascadeOnDelete(); // Sudah ada di pertemuan
            
            $table->date('hari'); // Sudad ada di pertemuan

            $table->foreignId('tahun_akademik_id')->constrained('tahun_akademik')->cascadeOnDelete(); // Sudah ada di jadwal 
            
            $table->foreignId('semester_id')->constrained('semester')->cascadeOnDelete(); // Sudah ada di jadwal

            $table->timestamps();

            $table->unique([
                'siswa_id',
                'pertemuan_id',
                // 'jadwal_pelajaran_id',
                // 'hari',
                // 'tahun_akademik_id',
                // 'semester_id',
            ], 'unik');            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi_siswa');
    }
};

/**
 * X foto dihapus maka kolomnya berubah jadi : Bukti sudah dihapus admin pada now()
 * batasi ukuran foto
 * convert foto jadi format webp biar kecil
 */