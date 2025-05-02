<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\UsuarioClave;
use App\Models\Compania;
use App\Models\Poliza;

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
            $companias = Compania::whereIn('id', $companias_id)
                ->with(['ramos.productos' => function ($query) {
                    $query->select('id', 'ramo_id', 'nombre', 'estatus'); // Selecciona solo los campos necesarios
                }])
                ->get();

            // Ocultar el atributo 'pivot' de los ramos después de cargar los datos
            $companias->each(function ($compania) {
                $compania->ramos->each(function ($ramo) {
                    $ramo->makeHidden('pivot'); // Oculta el atributo 'pivot' en cada ramo
                });
            });

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
    /**
     * Obtener todas las pólizas.
     */
    public function getAll()
    {
        try {
            $polizas = Poliza::with([
                'cliente',
                'tipoVencimiento',
                'compania',
                'subAgente',
                'ramo',
                'metodoPago',
                'estatus',
                'moneda',
                'producto',
            ])->get();

            return response()->json([
                'result' => true,
                'message' => 'Pólizas obtenidas con éxito',
                'data' => $polizas,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener las pólizas: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Crear una nueva póliza.
     */
    public function create(Request $request)
    {
        try { // Modificar los datos antes de la validación
            $data = $request->all();

            // Extraer IDs de objetos anidados
            $data['formaPago_id'] = $data['formaPago']['id'] ?? null;
            $data['tipoVencimiento_id'] = $data['tipoVencimiento']['id'] ?? null;
            $data['metodoPago_id'] = $data['metodoPago']['id'] ?? null;
            $data['moneda_id'] = $data['moneda']['id'] ?? null;
            $data['estatus_id'] = $data['estatus']['id'] ?? null;
            $data['primaNeta'] = str_replace(['$', ','], '', $data['primaNeta']); // Elimina "$" y posibles comas

            // Validar los datos modificados
            $validatedData = validator($data, [
                'numeroPoliza' => 'nullable|string|unique:polizas',
                'numeroCliente' => 'nullable|string',
                'cliente_id' => 'required|exists:clientes,id',
                'formaPago_id' => 'required|exists:forma1Pago,id',
                'inicioVigencia' => 'required|date',
                'finVigencia' => 'required|date|after:inicioVigencia',
                'tipoVencimiento_id' => 'required|exists:tipos_vencimiento,id',
                'antiguedad' => 'required|integer|min:0',
                'compania_id' => 'required|exists:compania,id',
                'subAgente_id' => 'required|exists:sub_agentes,id',
                'ramo_id' => 'required|exists:ramos,id',
                'metodoPago_id' => 'required|exists:metodos_pago,id',
                'primaNeta' => 'required|numeric|min:0',
                'financiamiento' => 'nullable|numeric|min:0',
                'primaTotal' => 'required|numeric|min:0',
                'estatus' => 'sometimes|exists:estatus_polizas,id',
                'comisionAgente' => 'nullable|numeric|min:0',
                'moneda_id' => 'required|exists:monedas,id',
                'producto_id' => 'required|exists:companias_productos,id',
                'pagoInicial' => 'required|numeric|min:0',
                'pagoSubsecuente' => 'required|numeric|min:0',
            ]);

            $poliza = Poliza::create($data);

            return response()->json([
                'result' => true,
                'message' => 'Póliza creada con éxito',
                'data' => $poliza,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear la póliza: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Actualizar una póliza existente.
     */
    public function update(Request $request, $id)
    {
        try {
            $poliza = Poliza::findOrFail($id);

            $data = $request->validate([
                'numeroPoliza' => 'sometimes|string|unique:polizas,numeroPoliza,' . $id,
                'numeroCliente' => 'sometimes|string',
                'cliente_id' => 'sometimes|exists:clientes,id',
                'formaPago_id' => 'sometimes|exists:formas_pago,id',
                'inicioVigencia' => 'sometimes|date',
                'finVigencia' => 'sometimes|date|after:inicioVigencia',
                'tipoVencimiento_id' => 'sometimes|exists:tipos_vencimiento,id',
                'antiguedad' => 'sometimes|integer|min:0',
                'compania_id' => 'sometimes|exists:companias,id',
                'subAgente_id' => 'sometimes|exists:sub_agentes,id',
                'ramo_id' => 'sometimes|exists:ramos,id',
                'metodoPago_id' => 'sometimes|exists:metodos_pago,id',
                'primaNeta' => 'sometimes|numeric|min:0',
                'financiamiento' => 'nullable|numeric|min:0',
                'primaTotal' => 'sometimes|numeric|min:0',
                'estatus' => 'sometimes|exists:estatus_polizas,id',
                'comisionAgente' => 'nullable|numeric|min:0',
                'moneda_id' => 'sometimes|exists:monedas,id',
                'producto_id' => 'sometimes|exists:productos,id',
                'pagoInicial' => 'sometimes|numeric|min:0',
                'pagoSubsecuente' => 'sometimes|numeric|min:0',
            ]);

            $poliza->update($data);

            return response()->json([
                'result' => true,
                'message' => 'Póliza actualizada con éxito',
                'data' => $poliza,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al actualizar la póliza: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Eliminar una póliza.
     */
    public function delete(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'Error al eliminar la póliza: No se ha proporcionado el ID de la póliza',
                ]);
            }

            $poliza = Poliza::findOrFail($id);
            $poliza->delete();

            return response()->json([
                'result' => true,
                'message' => 'Póliza eliminada con éxito',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al eliminar la póliza: ' . $e->getMessage(),
            ]);
        }
    }
}
