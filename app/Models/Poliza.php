<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poliza extends Model
{
    use HasFactory;

    protected $fillable = [
        'numeroPoliza',
        'numeroCliente',
        'cliente_id',
        'formaPago_id',
        'inicioVigencia',
        'finVigencia',
        'tipoVencimiento_id',
        'antiguedad',
        'compania_id',
        'subAgente_id',
        'ramo_id',
        'metodoPago_id',
        'primaNeta',
        'financiamiento',
        'primaTotal',
        'estatus',
        'comisionAgente',
        'moneda_id',
        'producto_id',
        'pagoInicial',
        'pagoSubsecuente',
    ];
}
