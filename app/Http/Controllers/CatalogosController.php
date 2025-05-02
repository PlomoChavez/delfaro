<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompaniaRamo;
use Illuminate\Support\Facades\DB;

class CatalogosController extends Controller
{
    /**
     * Obtener todos los registros de una tabla.
     */
    public function getCatalogo(Request $request, $tabla)
    {
        try {
            $datos = $request->all();
            switch ($tabla) {
                case 'tipos-usuarios':
                    $tabla = 'tipos_de_usuarios';
                    break;
                case 'estatus-clientes':
                    $tabla = 'estatus_cliente';
                    break;
                case 'formas-pagos':
                    $tabla = 'formas_de_pago';
                    break;
                case 'metodos-pago':
                    $tabla = 'metodos_de_pago';
                    break;
                case 'ramos':
                    $tabla = 'ramos';
                    break;
                case 'estados':
                    $tabla = 'estados';
                    break;
                case 'tipos-vencimiento':
                    $tabla = 'tipos_de_vencimiento';
                    break;
                case 'companias':
                    $tabla = 'compania';
                    break;
                case 'monedas':
                    $tabla = 'monedas';
                    break;
                case 'estatus-poliza':
                    $tabla = 'estatus_polizas';
                    break;
                case 'ramosByCompania':
                    $companiaId = $request->input('compania_id');
                    $rows = CompaniaRamo::where('compania_id', $companiaId)
                        ->with('ramo')
                        ->where('estatus', 1)
                        ->get();

                    $datos = $rows->map(function ($item) {
                        return [
                            ...$item->toArray(),
                            ...$item->ramo->toArray(),
                            'compania_id' => $item->compania_id,
                            'estatus' => $item->estatus,
                        ];
                    });

                    return response()->json([
                        'result' => true,
                        'message' => 'Registros obtenidos con éxito',
                        'data' => $datos,
                    ]);
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
            // Construir la consulta base
            $query = DB::table($tabla);

            // Agregar condiciones `where` si `$data` tiene opciones
            if (!empty($datos)) {
                foreach ($datos as $key => $value) {
                    $query->where($key, $value);
                }
            }

            // Ejecutar la consulta
            $datos = $query->get();

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
