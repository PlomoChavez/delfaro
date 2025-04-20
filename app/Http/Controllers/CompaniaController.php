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
    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'rfc' => 'sometimes|string|unique:compania,rfc,' . $id,
                'nombre' => 'sometimes|string|max:255',
                'nombreCorto' => 'sometimes|string|max:255',
                'direccion' => 'sometimes|string',
                'codigoPostal' => 'sometimes|string|max:10',
                'ciudad' => 'sometimes|string|max:255',
                'limitePrimerPago' => 'sometimes|numeric|min:0',
                'limitePrimerSubsecuente' => 'sometimes|numeric|min:0',
                'representantes' => 'sometimes|array',
                'representantes.*.id' => 'sometimes|exists:compania_representantes,id',
                'representantes.*.nombre' => 'sometimes|string|max:255',
                'representantes.*.telefono' => 'sometimes|string|max:20',
                'representantes.*.correo' => 'sometimes|email|unique:compania_representantes,correo',
                'representantes.*.cargo' => 'sometimes|string|max:255',
            ]);

            $compania = Compania::findOrFail($id);
            $compania->update($validatedData);

            if (isset($validatedData['representantes'])) {
                foreach ($validatedData['representantes'] as $representante) {
                    if (isset($representante['id'])) {
                        $existingRepresentante = CompaniaRepresentante::findOrFail($representante['id']);
                        $existingRepresentante->update($representante);
                    } else {
                        $representante['compania_id'] = $compania->id;
                        CompaniaRepresentante::create($representante);
                    }
                }
            }

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
