<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ! Masuk sini
     */
    public function up(): void
    {
        Schema::create('tugas_pengumpulan', function (Blueprint $table) {

            $table->id();
        
            $table->foreignId('tugas_id')->constrained('tugas')->cascadeOnDelete();
        
            $table->foreignId('siswa_id')->constrained('siswas');
        
            // untuk tugas manual
            $table->string('file_jawaban')->nullable();
            // $table->text('jawaban_text')->nullable();
        
            // untuk CBT
            $table->json('jawaban_cbt')->nullable();
        
            $table->integer('nilai')->nullable();
        
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_kumpul')->nullable();
        
            $table->text('feedback')->nullable();
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas_pengumpulan');
    }
};
