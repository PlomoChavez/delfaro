<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsuarioClave extends Model
{
    use HasFactory;

    protected $table = 'usuario_claves';

    protected $fillable = [
        'compania_id',
        'clave',
        'estatus',
    ];

    public function compania()
    {
        return $this->belongsTo(Compania::class, 'compania_id');
    }
}
