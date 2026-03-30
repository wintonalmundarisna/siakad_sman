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
        Schema::create('soal_cbt', function (Blueprint $table) {

            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->cascadeOnDelete();
        
            $table->text('pertanyaan');
        
            $table->enum('tipe', [
                'pilihan_ganda',
                'essay'
            ]);
        
            $table->integer('nilai')->default(1);
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soal_cbt');
    }
};
