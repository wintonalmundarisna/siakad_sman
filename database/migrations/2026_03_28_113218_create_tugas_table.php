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
        
        Schema::create('tugas', function (Blueprint $table) {

            $table->id();
        
            $table->foreignId('pertemuan_id')->constrained('pertemuan')->cascadeOnDelete();
        
            $table->string('judul');
        
            $table->enum('tipe_tugas', [
                'manual',
                'cbt'
            ]);
        
            $table->text('deskripsi')->nullable();
        
            $table->string('file_soal')->nullable();
        
            $table->dateTime('deadline')->nullable();
        
            // $table->integer('nilai_maksimal')->default(100);
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
