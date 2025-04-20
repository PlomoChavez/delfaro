<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CatalogoController;

Route::post('/test', function () {
    return response()->json(['message' => 'API funcionando correctamente']);
});
Route::middleware('api')->post('/catalogo/actividades/get', function (Request $request) {
    return app(CatalogoController::class)->getAll($request, 'actividades');
})->name('catalogo.actividades.getAll');

Route::post('catalogo/actividades/delete', function (Request $request) {
    return app(CatalogoController::class)->delete($request, 'actividades');
})->name('catalogo.actividades.delete');
Route::post('catalogo/actividades', function (Request $request) {
    return app(CatalogoController::class)->createOrUpdate($request, 'actividades');
})->name('catalogo.actividades.delete');
