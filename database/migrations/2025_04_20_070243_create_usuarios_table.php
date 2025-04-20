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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id(); // Campo ID
            $table->string('nombre', 255); // Campo nombre (string largo)
            $table->string('correo', 255)->unique(); // Campo correo (string largo, único)
            $table->string('password', 255); // Campo password (string largo)
            $table->unsignedBigInteger('tipo_id'); // Campo tipo_id (ID relacionado)
            $table->boolean('estatus')->default(true); // Campo estatus (booleano con valor predeterminado true)
            $table->timestamps(); // Campos created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
