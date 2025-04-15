<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatalogoController;

Route::post('/test', function () {
    return response()->json(['message' => 'API funcionando correctamente']);
});
Route::post('/catalogo/actividades/get', function (Request $request) {
    return app(CatalogoController::class)->getAll($request, 'actividades');
})->name('catalogo.actividades.getAll');

// Route::post('catalogo/actividades/delete', function (Request $request) {
//     return app(CatalogoController::class)->delete($request, 'actividades');
// })->name('catalogo.actividades.delete');
