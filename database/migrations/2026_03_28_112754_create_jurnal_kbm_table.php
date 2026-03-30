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
        Schema::create('jurnal_kbm', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('pertemuan_id')->constrained()->cascadeOnDelete();
        
            $table->text('uraian_kegiatan');
        
            $table->string('metode')->nullable();
        
            $table->text('catatan')->nullable();
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jurnal_kbm');
    }
};
