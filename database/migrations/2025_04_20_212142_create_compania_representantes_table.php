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
        Schema::create('compania_representantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compania_id')->constrained('compania')->onDelete('cascade');
            $table->string('nombre');
            $table->string('telefono');
            $table->string('correo')->unique();
            $table->string('cargo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compania_representantes');
    }
};
