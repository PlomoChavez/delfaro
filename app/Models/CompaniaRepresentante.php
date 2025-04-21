<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompaniaRepresentante extends Model
{
    use HasFactory;

    protected $table = 'compania_representantes';

    protected $fillable = [
        'compania_id',
        'nombre',
        'telefono',
        'correo',
        'cargo',
        'estatus',
    ];

    public function compania()
    {
        return $this->belongsTo(Compania::class);
    }
}
