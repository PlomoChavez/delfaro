<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PolizaAsegurados extends Model
{
    protected $table = 'poliza_asegurados';
    protected $fillable = [
        'rfc',
        'poliza_id',
        'cliente_id',
        'nombre',
        'fechaNacimiento',
        'direccion',
        'colonia',
        'codigoPostal',
        'estado_id',
        'ciudad',
        'telefono',
        'correo',
        'celular',
        'oficina',
        'casa',
        'observaciones',
    ];
}
