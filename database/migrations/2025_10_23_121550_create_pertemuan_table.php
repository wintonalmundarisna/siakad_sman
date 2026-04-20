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
        Schema::create('pertemuan', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('jadwal_pelajaran_id')->constrained('jadwal_pelajarans')->cascadeOnDelete();
        
            $table->integer('pertemuan_ke');
        
            $table->string('judul')->nullable();
        
            $table->date('tanggal')->nullable();

            $table->dateTime('deadline_absensi')->nullable();
        
            $table->enum('jenis', [
                'normal',
                'uts',
                'uas'
            ])->default('normal');

            $table->enum('status_pertemuan', [
                'belum_dibuka',
                'sudah_dibuka',
            ])->default('belum_dibuka');
        
            $table->timestamps();

            $table->unique([
                'jadwal_pelajaran_id',
                'pertemuan_ke'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pertemuan');
    }
};
