<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PolizaHistorial extends Model
{
    use HasFactory;

    protected $table = 'poliza_historial'; // Nombre de la tabla

    protected $fillable = [
        'accion',
        'poliza_id',
    ];

    /**
     * Relación con el modelo Poliza.
     * Un recibo pertenece a una póliza.
     */
    public function poliza()
    {
        return $this->belongsTo(Poliza::class, 'poliza_id');
    }
}
