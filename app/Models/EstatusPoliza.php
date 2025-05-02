<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstatusPoliza extends Model
{
    use HasFactory;

    protected $table = 'estatus_polizas'; // Nombre de la tabla en la base de datos

    protected $fillable = [
        'label', // Etiqueta del estatus
        'estatus', // Estado activo/inactivo
    ];

    public $timestamps = true; // Manejo de created_at y updated_at automáticamente

    /**
     * Relación con el modelo Poliza.
     * Un estatus puede estar asociado a muchas pólizas.
     */
    public function polizas()
    {
        return $this->hasMany(Poliza::class, 'estatus_id');
    }
}
