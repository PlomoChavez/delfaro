<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use HasFactory, SoftDeletes;

    // Nombre de la tabla
    protected $table = 'estados';

    // Campos asignables masivamente
    protected $fillable = [
        'label',
        'estatus',
    ];

    // Casts para los campos
    protected $casts = [
        'estatus' => 'boolean',
    ];
}
