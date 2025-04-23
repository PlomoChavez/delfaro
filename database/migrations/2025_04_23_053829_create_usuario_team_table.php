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
        Schema::create('usuario_team', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('principal_id');
            $table->unsignedBigInteger('tipo_id');
            $table->unsignedBigInteger('usuario_id');
            $table->boolean('estatus')->default(1);
            $table->timestamps();

            $table->foreign('tipo_id')->references('id')->on('tipos_de_usuarios')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_team');
    }
};
