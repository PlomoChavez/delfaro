<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poliza extends Model
{
    use HasFactory;

    protected $fillable = [
        'numeroPoliza',
        'numeroCliente',
        'cliente_id',
        'formaPago_id',
        'inicioVigencia',
        'finVigencia',
        'tipoVencimiento_id',
        'antiguedad',
        'compania_id',
        'subAgente_id',
        'ramo_id',
        'metodoPago_id',
        'primaNeta',
        'financiamiento',
        'primaTotal',
        'estatus_id',
        'comisionAgente',
        'moneda_id',
        'producto_id',
        'pagoInicial',
        'pagoSubsecuente',
    ];

    /**
     * Relación con el modelo Cliente.
     */
    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }
    public function formaPago()
    {
        return $this->belongsTo(FormaPago::class, 'formaPago_id');
    }

    /**
     * Relación con el modelo TipoVencimiento.
     */
    public function tipoVencimiento()
    {
        return $this->belongsTo(TipoDeVencimiento::class, 'tipoVencimiento_id');
    }

    /**
     * Relación con el modelo Compania.
     */
    public function compania()
    {
        return $this->belongsTo(Compania::class, 'compania_id');
    }

    /**
     * Relación con el modelo Usuario (SubAgente).
     */
    public function subAgente()
    {
        return $this->belongsTo(Usuario::class, 'subAgente_id');
    }

    /**
     * Relación con el modelo Ramo.
     */
    public function ramo()
    {
        return $this->belongsTo(Ramo::class, 'ramo_id');
    }

    /**
     * Relación con el modelo MetodoPago.
     */
    public function metodoPago()
    {
        return $this->belongsTo(MetodoDePago::class, 'metodoPago_id');
    }

    /**
     * Relación con el modelo Estatus.
     */
    public function estatus()
    {
        return $this->belongsTo(EstatusPoliza::class, 'estatus_id');
    }

    /**
     * Relación con el modelo Moneda.
     */
    public function moneda()
    {
        return $this->belongsTo(Moneda::class, 'moneda_id');
    }

    /**
     * Relación con el modelo Producto.
     */
    public function producto()
    {
        return $this->belongsTo(CompaniaProducto::class, 'producto_id');
    }

    /**
     * Relación con el modelo PolizaAsegurados.
     * Una póliza puede tener muchos asegurados.
     */
    public function asegurados()
    {
        return $this->hasMany(PolizaAsegurados::class, 'poliza_id');
    }

    /**
     * Relación con el modelo PolizaRecibo.
     * Una póliza puede tener muchos recibos.
     */
    public function recibos()
    {
        return $this->hasMany(PolizaRecibo::class, 'poliza_id');
    }
}
