<?php

namespace App\Http\Controllers;

use App\Models\Compania;
use App\Models\CompaniaProducto;
use App\Models\Ramo;
use App\Models\CompaniaRamo;
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

    public function getRamos(Request $request)
    {
        try {
            $datos = $request->all();
            $compania_id = $datos['compania_id'] ?? null;

            if (!$compania_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de compañía no proporcionado',
                    'data' => [],
                ]);
            }

            // Obtener todos los ramos
            $ramos = Ramo::all();

            // Obtener los ramos activos de la tabla companias_ramos para la compañía específica
            $ramosActivos = CompaniaRamo::where('compania_id', $compania_id)
                ->where('estatus', 1)
                ->pluck('ramo_id')
                ->toArray();

            // Formatear los datos con isActivo
            $result = $ramos->map(function ($ramo) use ($ramosActivos) {
                return [
                    ...$ramo->toArray(),
                    'isActivo' => in_array($ramo->id, $ramosActivos),
                ];
            });

            return response()->json([
                'result' => true,
                'message' => 'Ramos obtenidos con éxito',
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los ramos: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    public function updateRamos(Request $request)
    {
        try {
            $datos = $request->all();
            $compania_id = $datos['compania_id'] ?? null;
            $ramos = $datos['ramos'] ?? [];

            if (!$compania_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de compañía no proporcionado',
                    'data' => [],
                ]);
            }

            // Insertar los nuevos ramos
            foreach ($ramos as $ramo) {
                $companiaRamo = CompaniaRamo::where('compania_id', $compania_id)
                    ->where('ramo_id', $ramo['id'])
                    ->first();

                if ($companiaRamo) {
                    // Si la relación existe, actualiza el estatus
                    $companiaRamo->update([
                        'estatus' => $ramo['isActivo'] ? 1 : 0,
                    ]);
                } else {
                    // Si no existe, crea una nueva relación
                    CompaniaRamo::create([
                        'compania_id' => $compania_id,
                        'ramo_id' => $ramo['id'],
                        'estatus' => $ramo['isActivo'] ? 1 : 0,
                    ]);
                }
            }

            return response()->json([
                'result' => true,
                'message' => 'Ramos actualizados con éxito',
                'data' => [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al actualizar los ramos: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }
    /**
     * Obtener todas las compañías.
     */
    public function getCompaniaProductos(Request $request)
    {
        try {
            $datos = $request->all();
            $compania_id = $datos['compania_id'] ?? null;

            if (!$compania_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de compañía no proporcionado',
                    'data' => [],
                ]);
            }

            // Obtener todos los productos
            $productos = CompaniaProducto::where('compania_id', $compania_id)
                ->with('ramo')
                ->get();

            return response()->json([
                'result' => true,
                'message' => 'Productos obtenidos con éxito',
                'data' => $productos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los productos: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    public function createOrUpdateCompaniaProductos(Request $request)
    {
        try {
            $data = $request->all();
            $compania_id = $data['compania_id'] ?? null;
            if (!$compania_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de compañía no proporcionado',
                    'data' => [],
                ]);
            }

            // Eliminar los campos 'created_at', 'deleted_at' y 'updated_at' si existen
            unset($data['created_at'], $data['deleted_at'], $data['updated_at']);

            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            $data['ramo_id'] = $data["ramo"]["id"];
            unset($data["ramo"]);

            if (isset($data['id'])) {
                // Actualizar si existe un ID
                $producto = CompaniaProducto::find($data['id']);
                if ($producto) {
                    $producto->update($data);
                    return response()->json([
                        'result' => true,
                        'message' => 'Registro actualizado con éxito'
                    ]);
                } else {
                    return response()->json([
                        'result' => false,
                        'message' => 'El producto no existe',
                    ]);
                }
            } else {
                // Crear si no existe un ID
                $producto = CompaniaProducto::create($data);
                return response()->json([
                    'result' => true,
                    'message' => 'Registro creado con éxito',
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al actualizar los productos: ' . $e->getMessage(),
            ]);
        }
    }
}
