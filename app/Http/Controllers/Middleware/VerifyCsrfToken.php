<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/catalogo/actividades/get',
        'api/catalogo/actividades/create',
        'api/catalogo/actividades/update',
        'api/catalogo/actividades/delete',
    ];
}
