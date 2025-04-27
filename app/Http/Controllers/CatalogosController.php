<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogosController extends Controller
{
    /**
     * Obtener todos los registros de una tabla.
     */
    public function getCatalogo(Request $request, $tabla)
    {
        try {
            switch ($tabla) {
                case 'tipos-usuarios':
                    $tabla = 'tipos_de_usuarios';
                    break;
                case 'estatus-clientes':
                    $tabla = 'estatus_cliente';
                    break;
                case 'formas-pago':
                    $tabla = 'metodos_de_pago';
                case 'metodos-pago':
                    $tabla = 'metodos_de_pago';
                    break;
                case 'ramos':
                    $tabla = 'ramos';
                    break;
                case 'tipos-vencimiento':
                    $tabla = 'tipos_de_vencimiento';
                    break;
                case 'companias':
                    $tabla = 'compania';
                    break;
                case 'moendas':
                    $tabla = [
                        ["id" => 1, "nombre" => "MXN - Peso Mexicano"],
                        ["id" => 2, "nombre" => "USD - Dólar Americano"],
                        ["id" => 3, "nombre" => "EUR - Euro"],
                        ["id" => 4, "nombre" => "GBP - Libra Esterlina"],
                        ["id" => 5, "nombre" => "JPY - Yen Japonés"],
                        ["id" => 6, "nombre" => "CNY - Yuan Chino"],
                        ["id" => 7, "nombre" => "INR - Rupia India"],
                        ["id" => 8, "nombre" => "BRL - Real Brasileño"],
                    ];
                    break;
                case 'estatus-poliza':
                    $tabla = [
                        ["id" => 1, "nombre" => "Vigente"],
                        ["id" => 2, "nombre" => "Cancelada"],
                        ["id" => 3, "nombre" => "Suspendida"],
                        ["id" => 4, "nombre" => "En Proceso"],
                        ["id" => 5, "nombre" => "No Vigente"],
                    ];
                    break;
                default:
                    return response()->json([
                        'result' => false,
                        'message' => 'Tabla no válida',
                        'data' => [],
                    ]);
            }
            $datos = DB::table($tabla)->get();
            return response()->json([
                'result' => true,
                'message' => 'Registros obtenidos con éxito',
                'data' => $datos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }
}
