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
        'ciudad',
        'limitePrimerPago',
        'limitePrimerSubsecuente',
    ];

    public function representantes()
    {
        return $this->hasMany(CompaniaRepresentante::class);
    }
}
