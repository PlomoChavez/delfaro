<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $fillable = [
        'rfc',
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
