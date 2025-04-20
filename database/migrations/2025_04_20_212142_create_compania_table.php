<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('compania', function (Blueprint $table) {
            $table->id();
            $table->string('rfc')->unique();
            $table->string('nombre');
            $table->string('nombreCorto');
            $table->string('direccion');
            $table->string('codigoPostal');
            $table->string('ciudad');
            $table->decimal('limitePrimerPago', 10, 2);
            $table->decimal('limitePrimerSubsecuente', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compania');
    }
};
