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
        Schema::create('forum_diskusi', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('pertemuan_id')->unique()->constrained('pertemuan')->cascadeOnDelete();
        
            $table->string('judul');
        
            $table->text('deskripsi')->nullable();
        
            $table->foreignId('guru_id')->constrained('kepegawaians');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_diskusi');
    }
};

// udah terbaru