<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Support\Facades\Log;

class ClienteController extends Controller
{
    /**
     * Obtener todos los registros de la tabla clientes.
     */
    public function getAll(Request $request)
    {
        try {
            $clientes = Cliente::all();
            return response()->json([
                'result' => true,
                'message' => 'Registros obtenidos con éxito',
                'data' => $clientes,
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
     * Eliminar un registro específico de la tabla clientes.
     */
    public function delete(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de cliente no proporcionado',
                ]);
            }

            // Buscar el cliente por ID y eliminarlo
            $cliente = Cliente::findOrFail($id);
            $cliente->delete();

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
     * Crear o actualizar un registro en la tabla clientes.
     */
    public function createOrUpdate(Request $request)
    {
        try {
            $data = $request->all();
            // Validar los datos
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'rfc' => 'required|string|unique:clientes,rfc,' . ($data['id'] ?? 'NULL') . ',id',
                // 'rfc' => 'required|string|unique:clientes,rfc,' . ($data['id'] ?? 'NULL') . ',id',
                'fechaNacimiento' => 'required|date',
                'direccion' => 'nullable|string',
                'colonia' => 'nullable|string',
                'codigoPostal' => 'nullable|string|max:10',
                'estado_id' => 'nullable|integer',
                'ciudad' => 'nullable|string',
                'correo' => 'nullable|email',
                'telefono' => 'nullable|string|max:15',
                'celular' => 'nullable|string|max:15',
                'oficina' => 'nullable|string|max:15',
                'casa' => 'nullable|string|max:15',
                'observaciones' => 'nullable|string',
            ]);

            if (isset($data['estado'])) {
                $validatedData['estado_id'] = $data["estado"]["id"];
            }

            if (isset($data['id'])) {
                // Actualizar si existe un ID
                $cliente = Cliente::findOrFail($data['id']);
                $cliente->update($validatedData);

                return response()->json([
                    'result' => true,
                    'message' => 'Registro actualizado con éxito',
                    'data' => $cliente,
                ]);
            } else {
                // Crear si no existe un ID
                $cliente = Cliente::create($validatedData);

                return response()->json([
                    'result' => true,
                    'message' => 'Registro creado con éxito',
                    'data' => $cliente,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear o actualizar el registro: ' . $e->getMessage(),
            ]);
        }
    }
}
