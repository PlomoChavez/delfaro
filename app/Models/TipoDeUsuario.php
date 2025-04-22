<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoDeUsuario extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'tipos_de_usuarios'; // Nombre de la tabla

    protected $fillable = [
        'label',
        'estatus',
    ];
}
