<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{
    /**
     * Obtener todos los registros de una tabla.
     */
    public function getAll(Request $request, $tabla)
    {
        try {
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

    /**
     * Crear o actualizar un registro en una tabla.
     */
    public function createOrUpdate(Request $request, $tabla)
    {
        try {
            $data = $request->all();

            // Eliminar los campos 'created_at', 'deleted_at' y 'updated_at' si existen
            unset($data['created_at'], $data['deleted_at'], $data['updated_at']);
            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            if (isset($data['id'])) {
                // Actualizar si existe un ID
                DB::table($tabla)->where('id', $data['id'])->update($data);
                return response()->json([
                    'result' => true,
                    'message' => 'Registro actualizado con éxito',
                    'data' => $data,
                ]);
            } else {
                // dd("else",$data);
                // Crear si no existe un ID
                $id = DB::table($tabla)->insertGetId($data);
                $data['id'] = $id;
                return response()->json([
                    'result' => true,
                    'message' => 'Registro creado con éxito',
                    'data' => $data,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear o actualizar el registro: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Eliminar un registro específico de una tabla.
     */
    public function delete(Request $request, $tabla)
    {
        try {
            $id = $request->input('id');
            DB::table($tabla)->where('id', $id)->delete();
            return response()->json([
                'result' => true,
                'message' => 'Registro eliminado con éxito',
                'data' => ['id' => $id],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al eliminar el registro: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Obtener registros filtrados por un campo específico.
     */
    public function getDataByCatalogo($tabla, $campo, $valor)
    {
        try {
            $datos = DB::table($tabla)->where($campo, $valor)->get();
            return response()->json([
                'result' => true,
                'message' => 'Registros filtrados obtenidos con éxito',
                'data' => $datos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los registros filtrados: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }
}
