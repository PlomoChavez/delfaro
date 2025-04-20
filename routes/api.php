<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\CompaniaController;
use App\Http\Controllers\CatalogosController;
// @formatter:off
// Actividades
Route::post('catalogo/actividades/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'actividades'); })->name('catalogo.actividades.getAll');
Route::post('catalogo/actividades/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'actividades'); })->name('catalogo.actividades.delete');
Route::post('catalogo/actividades',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'actividades'); })->name('catalogo.actividades.delete');
// estatus-cliente
Route::post('catalogo/estatus-cliente/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'estatus_cliente'); })->name('catalogo.estatus-cliente.getAll');
Route::post('catalogo/estatus-cliente/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'estatus_cliente'); })->name('catalogo.estatus-cliente.delete');
Route::post('catalogo/estatus-cliente',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'estatus_cliente'); })->name('catalogo.estatus-cliente.delete');
// metodo-pago
Route::post('catalogo/metodo-pago/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'metodos_de_pago'); })->name('catalogo.metodo-pago.getAll');
Route::post('catalogo/metodo-pago/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'metodos_de_pago'); })->name('catalogo.metodo-pago.delete');
Route::post('catalogo/metodo-pago',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'metodos_de_pago'); })->name('catalogo.metodo-pago.delete');
// ramo
Route::post('catalogo/ramos/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'ramos'); })->name('catalogo.ramo.getAll');
Route::post('catalogo/ramos/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'ramos'); })->name('catalogo.ramo.delete');
Route::post('catalogo/ramos',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'ramos'); })->name('catalogo.ramo.delete');
// tipo-vencimiento
Route::post('catalogo/tipo-vencimiento/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'tipos_de_vencimiento'); })->name('catalogo.tipo-vencimiento.getAll');
Route::post('catalogo/tipo-vencimiento/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'tipos_de_vencimiento'); })->name('catalogo.tipo-vencimiento.delete');
Route::post('catalogo/tipo-vencimiento',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'tipos_de_vencimiento'); })->name('catalogo.tipo-vencimiento.delete');
// tipo-usuario
Route::post('catalogo/tipo-usuario/get',     function (Request $request) { return app(CatalogoController::class)->getAll($request, 'tipos_de_usuarios'); })->name('catalogo.tipo-usuario.getAll');
Route::post('catalogo/tipo-usuario/delete',  function (Request $request) { return app(CatalogoController::class)->delete($request, 'tipos_de_usuarios'); })->name('catalogo.tipo-usuario.delete');
Route::post('catalogo/tipo-usuario',         function (Request $request) { return app(CatalogoController::class)->createOrUpdate($request, 'tipos_de_usuarios'); })->name('catalogo.tipo-usuario.delete');

// usuarios
Route::post('usuarios/get',     [UsuarioController::class, 'getAll'])->name('usuarios.getAll');
Route::post('usuarios/create',  [UsuarioController::class, 'create'])->name('usuarios.create');
Route::post('usuarios/update',  [UsuarioController::class, 'update'])->name('usuarios.update');
Route::post('usuarios/delete',  [UsuarioController::class, 'delete'])->name('usuarios.delete');
// companias
Route::post('companias/get',     [CompaniaController::class, 'getAll'])->name('companias.getAll');
Route::post('companias/create',  [CompaniaController::class, 'create'])->name('companias.create');
Route::post('companias/update',  [CompaniaController::class, 'update'])->name('companias.update');
Route::post('companias/delete',  [CompaniaController::class, 'delete'])->name('companias.delete');


// usuarios
Route::post('catalogos/tipos-usuarios',   function (Request $request) { return app(CatalogosController::class)->getCatalogo($request, 'tipos-usuarios'); })->name('catalogos.getCatalogo.tipos-usuarios');


// @formatter:on
