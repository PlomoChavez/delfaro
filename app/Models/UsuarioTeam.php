<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsuarioTeam extends Model
{
    use HasFactory;

    protected $table = 'usuario_team';

    protected $fillable = [
        'principal_id',
        'tipo_id',
        'usuario_id',
        'estatus',
    ];

    public function tipo()
    {
        return $this->belongsTo(TipoDeUsuario::class, 'tipo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
