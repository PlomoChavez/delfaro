<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormaPago extends Model
{
    use HasFactory;

    protected $table = 'formas_de_pago';

    protected $fillable = [
        'label',
        'estatus',
    ];

    public $timestamps = true; // Para manejar `created_at` y `updated_at`
}
