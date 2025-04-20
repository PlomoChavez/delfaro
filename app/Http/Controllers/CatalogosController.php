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
                case 'metodos-pago':
                    $tabla = 'metodos_de_pago';
                    break;
                case 'ramos':
                    $tabla = 'ramos';
                    break;
                case 'tipos-vencimiento':
                    $tabla = 'tipos_de_vencimiento';
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
