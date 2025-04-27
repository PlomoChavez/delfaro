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
                case 'monedas':
                    $tabla = [
                        ["id" => 1, "label" => "MXN - Peso Mexicano"],
                        ["id" => 2, "label" => "USD - Dólar Americano"],
                        ["id" => 3, "label" => "EUR - Euro"],
                        ["id" => 4, "label" => "GBP - Libra Esterlina"],
                        ["id" => 5, "label" => "JPY - Yen Japonés"],
                        ["id" => 6, "label" => "CNY - Yuan Chino"],
                        ["id" => 7, "label" => "INR - Rupia India"],
                        ["id" => 8, "label" => "BRL - Real Brasileño"],
                    ];
                    break;
                case 'estatus-poliza':
                    $tabla = [
                        ["id" => 1, "label" => "Vigente"],
                        ["id" => 2, "label" => "Cancelada"],
                        ["id" => 3, "label" => "Suspendida"],
                        ["id" => 4, "label" => "En Proceso"],
                        ["id" => 5, "label" => "No Vigente"],
                    ];
                    break;
                default:
                    return response()->json([
                        'result' => false,
                        'message' => 'Tabla no válida',
                        'data' => [],
                    ]);
            }
            if (is_array($tabla)) {
                return response()->json([
                    'result' => true,
                    'message' => 'Registros obtenidos con éxito',
                    'data' => $tabla,
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
