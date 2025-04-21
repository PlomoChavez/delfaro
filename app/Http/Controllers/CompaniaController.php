<?php

namespace App\Http\Controllers;

use App\Models\Compania;
use App\Models\CompaniaRepresentante;
use Illuminate\Http\Request;

class CompaniaController extends Controller
{
    /**
     * Obtener todas las compañías.
     */
    public function getAll()
    {
        try {
            $companias = Compania::with('representantes')->get();
            return response()->json([
                'result' => true,
                'message' => 'Compañías obtenidas con éxito',
                'data' => $companias,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener las compañías: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Crear una nueva compañía.
     */
    public function create(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'rfc' => 'required|string|unique:compania,rfc',
                'nombre' => 'required|string|max:255',
                'nombreCorto' => 'required|string|max:255',
            ]);

            $validatedData['direccion'] = "";
            $validatedData['codigoPostal'] = "";
            $validatedData['ciudad'] = "";
            $validatedData['limitePrimerPago'] = 0;
            $validatedData['limitePrimerSubsecuente'] = 0;
            $compania = Compania::create($validatedData);

            return response()->json([
                'result' => true,
                'message' => 'Compañía creada con éxito',
                'data' => $compania->load('representantes'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear la compañía: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Actualizar una compañía existente.
     */
    public function update(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'rfc' => 'sometimes|string',
                'id' => 'sometimes|integer|exists:compania,id',
                'nombre' => 'sometimes|string|max:255',
                'nombreCorto' => 'sometimes|string|max:255',
                'direccion' => 'sometimes|nullable|string',
                'codigoPostal' => 'sometimes|nullable|string|max:10',
                'ciudad' => 'sometimes|nullable|string|max:255',
                'estado' => 'sometimes|nullable|string|max:255',
                'colonia' => 'sometimes|nullable|string|max:255',
                'estatus' => 'sometimes|nullable|boolean',
                'limitePrimerPago' => 'sometimes|nullable|numeric|min:0',
                'limitePrimerSubsecuente' => 'sometimes|nullable|numeric|min:0'
            ]);
            $id = $validatedData['id'] ?? null;
            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de compañía no proporcionado',
                    'data' => [],
                ]);
            }
            $rfc = $validatedData['rfc'] ?? null;
            $exiteRFC = Compania::where('rfc', $rfc)->where('id', '!=', $id)->exists();
            if ($exiteRFC) {
                return response()->json([
                    'result' => false,
                    'message' => 'El RFC ya está en uso por otra compañía',
                    'data' => [],
                ]);
            }

            if (isset($validatedData['estatus'])) {
                $validatedData['estatus'] = ($validatedData['estatus'] === 'Activo' || $validatedData['estatus'] === true || $validatedData['estatus'] === 'true') ? 1 : 0;
            }
            $compania = Compania::findOrFail($id);
            $compania->update($validatedData);

            return response()->json([
                'result' => true,
                'message' => 'Compañía actualizada con éxito',
                'data' => $compania->load('representantes'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al actualizar la compañía: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Eliminar una compañía.
     */
    public function delete($id)
    {
        try {
            $compania = Compania::findOrFail($id);
            $compania->delete();

            return response()->json([
                'result' => true,
                'message' => 'Compañía eliminada con éxito',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al eliminar la compañía: ' . $e->getMessage(),
            ]);
        }
    }
}
