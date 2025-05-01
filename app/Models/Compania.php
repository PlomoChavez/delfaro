<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compania extends Model
{
    use HasFactory;

    protected $table = 'compania';

    protected $fillable = [
        'rfc',
        'nombre',
        'nombreCorto',
        'direccion',
        'codigoPostal',
        'estado',
        'colonia',
        'ciudad',
        'estatus',
        'limitePrimerPago',
        'limitePrimerSubsecuente',
    ];

    public function representantes()
    {
        return $this->hasMany(CompaniaRepresentante::class);
    }

    public function ramos()
    {
        return $this->belongsToMany(Ramo::class, 'companias_ramos', 'compania_id', 'ramo_id')
            ->withPivot('estatus') // Incluye el campo 'estatus' de la tabla intermedia
            ->withTimestamps(); // Incluye timestamps si están definidos en la tabla intermedia
    }

    public function productos()
    {
        return $this->hasManyThrough(
            CompaniaProducto::class, // Modelo final (productos)
            CompaniaRamo::class,     // Modelo intermedio (ramos)
            'compania_id',           // Llave foránea en la tabla intermedia (companias_ramos)
            'ramo_id',               // Llave foránea en la tabla productos
            'id',                    // Llave primaria en la tabla compañías
            'ramo_id'                // Llave primaria en la tabla intermedia
        );
    }

    public function ramosConProductos()
    {
        return $this->hasManyThrough(
            CompaniaProducto::class, // Modelo final (productos)
            CompaniaRamo::class,     // Modelo intermedio (ramos)
            'compania_id',           // Llave foránea en la tabla intermedia (companias_ramos)
            'ramo_id',               // Llave foránea en la tabla productos
            'id',                    // Llave primaria en la tabla compañías
            'ramo_id'                // Llave primaria en la tabla intermedia
        );
    }
}
