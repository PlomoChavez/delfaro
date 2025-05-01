<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompaniaProducto extends Model
{
    use HasFactory;

    // Nombre de la tabla
    protected $table = 'companias_productos';

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'compania_id',
        'ramo_id',
        'nombre', // Nombre del producto
        'estatus', // Nombre del producto
    ];

    // Relación con el modelo Compania
    public function compania()
    {
        return $this->belongsTo(Compania::class, 'compania_id');
    }

    // Relación con el modelo Ramo
    public function ramo()
    {
        return $this->belongsTo(Ramo::class, 'ramo_id');
    }
}
