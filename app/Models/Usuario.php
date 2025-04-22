<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'usuarios'; // Nombre de la tabla

    protected $fillable = [
        'nombre',
        'correo',
        'password',
        'tipo_id',
        'estatus',
    ];

    /**
     * Relación con el modelo TipoUsuario.
     */
    public function tipo()
    {
        return $this->belongsTo(TipoDeUsuario::class, 'tipo_id');
    }
}
