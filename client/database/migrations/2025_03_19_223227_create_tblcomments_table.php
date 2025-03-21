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
        Schema::create('tblcomments', function (Blueprint $table) {
            $table->id('cmt_id'); // Primary key with auto-increment
            $table->unsignedBigInteger('cmt_fnd_id')->nullable();
            $table->text('cmt_content')->nullable();
            $table->text('cmt_attachment')->nullable();
            $table->unsignedBigInteger('cmt_added_by')->nullable();
            $table->unsignedBigInteger('cmt_isReply_to')->nullable();
            $table->boolean('cmt_isOpened')->default(0);
            $table->boolean('cmt_isArchived')->default(0);
            
            // Additional fields used in your controller
            $table->unsignedBigInteger('cmt_cp_id')->nullable();
            $table->timestamp('cmt_dt_added')->nullable();
            $table->string('cmt_concept_id')->nullable();
            $table->string('cmt_cp_type')->nullable();
            $table->string('cmt_original_file_name')->nullable();
            
            $table->timestamps(); // Adds created_at & updated_at
        
            // Foreign Keys
            $table->foreign('cmt_added_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('cmt_isReply_to')->references('cmt_id')->on('tblcomments')->onDelete('cascade');
        
            // Index
            $table->index('cmt_fnd_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tblcomments');
    }
};
