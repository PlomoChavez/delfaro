<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PolizaRecibo extends Model
{
    use HasFactory;

    protected $table = 'poliza_recibos'; // Nombre de la tabla

    protected $fillable = [
        'numeroRecibo',
        'poliza_id',
        'vencimiento',
        'importe',
        'estatus',
        'fechaPago',
        'fechaCancelado',
        'evidencia',
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
