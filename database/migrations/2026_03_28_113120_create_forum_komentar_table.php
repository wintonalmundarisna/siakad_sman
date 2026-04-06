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
        Schema::create('forum_komentar', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('forum_diskusi_id')
                ->constrained('forum_diskusi')
                ->cascadeOnDelete();
        
            $table->morphs('commentable'); 
            // menghasilkan:
            // commentable_id
            // commentable_type
        
            $table->text('komentar');
        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forum_komentar');
    }
};
