<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PolizaAsegurados;
use Illuminate\Support\Facades\Log;

class PolizaAseguradosController extends Controller
{
    /**
     * Obtener todos los registros de asegurados.
     */
    public function getAll(Request $request)
    {
        try {
            $poliza_id = $request->input('poliza_id');
            if (!$poliza_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de póliza no proporcionado',
                ]);
            }

            $asegurados = PolizaAsegurados::where('poliza_id', $poliza_id)->get();

            return response()->json([
                'result' => true,
                'message' => 'Asegurados obtenidos con éxito',
                'data' => $asegurados,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los asegurados: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Crear o actualizar un asegurado.
     */
    public function createOrUpdate(Request $request)
    {
        try { // Modificar los datos antes de la validación
            $data = $request->all();

            // Extraer IDs de objetos anidados
            $data['estado_id'] = $data['estado']['id'] ?? null;

            // Validar los datos modificados
            $validatedData = validator($data, [
                'id' => 'nullable|exists:poliza_asegurados,id',
                'poliza_id' => 'required|exists:polizas,id',
                'rfc' => 'required|string',
                'cliente_id' => 'sometimes|exists:clientes,id',
                'nombre' => 'required|string|max:255',
                'fechaNacimiento' => 'required|date',
                'direccion' => 'nullable|string|max:255',
                'colonia' => 'nullable|string|max:255',
                'codigoPostal' => 'nullable|string|max:10',
                'estado_id' => 'nullable|exists:estados,id',
                'ciudad' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:15',
                'correo' => 'nullable|email|max:255',
                'celular' => 'nullable|string|max:15',
                'oficina' => 'nullable|string|max:15',
                'casa' => 'nullable|string|max:15',
                'observaciones' => 'nullable|string',
            ]);

            if (isset($data['id'])) {
                // Actualizar asegurado existente
                $asegurado = PolizaAsegurados::findOrFail($data['id']);
                $asegurado->update($data);

                return response()->json([
                    'result' => true,
                    'message' => 'Asegurado actualizado con éxito',
                    'data' => $asegurado,
                ]);
            } else {
                // Crear un nuevo asegurado
                $asegurado = PolizaAsegurados::create($data);

                return response()->json([
                    'result' => true,
                    'message' => 'Asegurado creado con éxito',
                    'data' => $asegurado,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear o actualizar el asegurado: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Eliminar un asegurado.
     */
    public function delete(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de asegurado no proporcionado',
                ]);
            }

            $asegurado = PolizaAsegurados::findOrFail($id);
            $asegurado->delete();

            return response()->json([
                'result' => true,
                'message' => 'Asegurado eliminado con éxito',
                'data' => ['id' => $id],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al eliminar el asegurado: ' . $e->getMessage(),
            ]);
        }
    }
}
