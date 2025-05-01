<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePolizasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('polizas', function (Blueprint $table) {
            $table->id();
            $table->string('numeroPoliza')->unique();
            $table->string('numeroCliente');

            $table->date('inicioVigencia');
            $table->date('finVigencia');
            $table->integer('antiguedad');
            $table->decimal('primaNeta', 15, 2);
            $table->decimal('financiamiento', 15, 2)->nullable();
            $table->decimal('primaTotal', 15, 2);
            $table->enum('estatus', ['activo', 'inactivo', 'pendiente']);
            $table->decimal('comisionAgente', 15, 2)->nullable();
            $table->decimal('pagoInicial', 15, 2);
            $table->decimal('pagoSubsecuente', 15, 2);
            $table->unsignedBigInteger('cliente_id');
            $table->unsignedBigInteger('formaPago_id');
            $table->unsignedBigInteger('tipoVencimiento_id');
            $table->unsignedBigInteger('compania_id');
            $table->unsignedBigInteger('subAgente_id');
            $table->unsignedBigInteger('ramo_id');
            $table->unsignedBigInteger('metodoPago_id');
            $table->unsignedBigInteger('moneda_id');
            $table->unsignedBigInteger('producto_id');



            $table->foreign('cliente_id')->references('id')->on('clientes')->onDelete('cascade');
            $table->foreign('formaPago_id')->references('id')->on('formas_de_pago')->onDelete('cascade');
            $table->foreign('tipoVencimiento_id')->references('id')->on('tipos_de_vencimiento')->onDelete('cascade');
            $table->foreign('compania_id')->references('id')->on('compania')->onDelete('cascade');
            $table->foreign('subAgente_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('ramo_id')->references('id')->on('ramos')->onDelete('cascade');
            $table->foreign('metodoPago_id')->references('id')->on('metodos_de_pago')->onDelete('cascade');
            $table->foreign('moneda_id')->references('id')->on('monedas')->onDelete('cascade');
            $table->foreign('producto_id')->references('id')->on('companias_productos')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('polizas');
    }
}
