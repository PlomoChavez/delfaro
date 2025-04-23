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
        Schema::create('usuario_claves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('compania_id');
            $table->string('clave');
            $table->boolean('estatus')->default(1);
            $table->timestamps();

            $table->foreign('compania_id')->references('id')->on('compania')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_claves');
    }
};
