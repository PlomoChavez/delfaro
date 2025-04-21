<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CompaniaRepresentante;
use Illuminate\Support\Facades\Log;

class CompaniaRepresentantesController extends Controller
{
    /**
     * Obtener todos los representantes de compañías.
     */
    public function getAll(Request $request)
    {
        try {
            // Validar que se envíe el compania_id
            $validatedData = $request->validate([
                'compania_id' => 'required|integer',
            ]);

            // Obtener los representantes filtrados por compania_id
            $representantes = CompaniaRepresentante::where('compania_id', $validatedData['compania_id'])->get();
            return response()->json([
                'result' => true,
                'message' => 'Registros obtenidos con éxito',
                'data' => $representantes,
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
     * Crear o actualizar un representante de compañía.
     */
    public function createOrUpdate(Request $request)
    {
        // Validar los datos del request
        $validatedData = $request->validate([
            'id' => 'nullable|integer', // Si es nulo, se creará un nuevo registro
            'compania_id' => 'required|integer',
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'nullable|max:255',
            'cargo' => 'nullable|string|max:255',
            'estatus' => 'nullable',
        ]);
        if (isset($validatedData['estatus'])) {
            $validatedData['estatus'] = ($validatedData['estatus'] === 'Activo' || $validatedData['estatus'] === true || $validatedData['estatus'] === 'true') ? 1 : 0;
        }
        Log::info('Datos validados:', $validatedData);
        if (isset($validatedData['id'])) {
            // Actualizar
            $representante = CompaniaRepresentante::find($validatedData['id']);

            if (!$representante) {
                return response()->json([
                    'result' => false,
                    'message' => 'Registro no encontrado',
                ]);
            }

            $representante->update($validatedData);

            return response()->json([
                'result' => true,
                'message' => 'Registro actualizado con éxito',
            ]);
        } else {
            // Crear
            $representante = CompaniaRepresentante::create($validatedData);

            return response()->json([
                'result' => true,
                'message' => 'Registro creado con éxito',
            ]);
        }
    }

    /**
     * Eliminar un representante de compañía.
     */
    public function delete(Request $request)
    {
        try {
            // Validar el ID del representante
            $validatedData = $request->validate([
                'id' => 'required|integer',
            ]);

            $representante = CompaniaRepresentante::find($validatedData['id']);

            if (!$representante) {
                return response()->json([
                    'result' => false,
                    'message' => 'Registro no encontrado',
                ]);
            }

            $representante->delete();

            return response()->json([
                'result' => true,
                'message' => 'Registro eliminado con éxito',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al eliminar el registro: ' . $e->getMessage(),
            ]);
        }
    }
}
