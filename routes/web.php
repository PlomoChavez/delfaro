<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogoController;
use App\Http\Middleware\VerifyCsrfToken;


// Route::post('/api/catalogo/actividades', function (Request $request) {
//     return app(CatalogoController::class)->createOrUpdate($request, 'actividades');
// })->name('catalogo.actividades.createOrUpdate');

// Route::post('/api/catalogo/actividades/get', function (Request $request) {
//     return app(CatalogoController::class)->getAll($request, 'actividades');
// })->name('catalogo.actividades.getAll');

// Route::post('catalogo/actividades/delete', function (Request $request) {
//     return app(CatalogoController::class)->delete($request, 'actividades');
// })->name('catalogo.actividades.delete');

// Route::post('/api/catalogo/actividades/get', function (Request $request) {
//     return app(CatalogoController::class)->getAll($request, 'actividades');
// })->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
//     ->name('catalogo.actividades.getAll');



Route::get('{any?}', function () {
    return view('application');
})->where('any', '.*');
