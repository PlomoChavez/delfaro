<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePolizaRecibosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('poliza_recibos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poliza_id')->constrained('polizas')->onDelete('cascade'); // Relación con la tabla polizas
            $table->string('numeroRecibo')->unique(); // Número único del recibo
            $table->date('vencimiento'); // Fecha de vencimiento
            $table->decimal('importe', 15, 2); // Importe del recibo
            $table->enum('estatus', ['Pendiente', 'Pagado', 'Cancelado'])->default('Pendiente'); // Estatus del recibo
            $table->date('fechaPago')->nullable(); // Fecha de pago
            $table->date('fechaCancelado')->nullable(); // Fecha de cancelación
            $table->string('evidencia')->nullable(); // Evidencia (ruta del archivo o URL)
            $table->timestamps(); // created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('poliza_recibos');
    }
}
