<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\UsuarioClave;
use App\Models\Compania;

class PolizasController extends Controller
{
    /**
     * Obtener todos los registros de una tabla.
     */
    public function getRecursosWizard(Request $request)
    {
        try {
            $datos = $request->all();
            if (!$datos["usuario_id"]) {
                return response()->json([
                    'result' => false,
                    'message' => 'Error al obtener los registros: No se ha proporcionado el ID del usuario',
                ]);
            }
            $claves = UsuarioClave::where('usuario_id', $datos["usuario_id"])->with('compania')->get();
            if ($claves->isEmpty()) {
                return response()->json([
                    'result' => true,
                    'message' => 'Este usuario no tiene claves',
                    'data' => [],
                ]);
            }
            $companias_id = $claves->pluck('compania_id')->toArray();
            $companias = Compania::whereIn('id', $companias_id)->get();
            return response()->json([
                'result' => true,
                'message' => 'Registros obtenidos con éxito',
                'data' => [
                    'companias' => $companias,
                    'claves' => $claves,
                    'companias_id' => $companias_id,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los registros: ' . $e->getMessage(),
            ]);
        }
    }
}
