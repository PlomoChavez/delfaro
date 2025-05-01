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
        Schema::create('companias_ramos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('compania_id');
            $table->unsignedBigInteger('ramo_id');
            $table->timestamps();

            // Llaves foráneas
            $table->foreign('compania_id')->references('id')->on('compania')->onDelete('cascade');
            $table->foreign('ramo_id')->references('id')->on('ramos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companias_ramos');
    }
};
