<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\UsuarioClave;
use App\Models\Compania;
use App\Models\Poliza;
use App\Models\PolizaRecibo;
use App\Models\PolizaHistorial;
use Carbon\Carbon;

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
                'formaPago',
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

            Log::info('Pruebas');
            $poliza = Poliza::create($data);
            $data['poliza_id'] = $poliza->id;
            $this->newAccionHistorial('Creación de póliza', $poliza->id);
            $this->createRecibos($data);

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

    public function createRecibos($data)
    {
        try {
            Log::info('Datos recibidos', $data);

            $tipoVencimiento = $data['formaPago_id'] ?? null;
            $recibosPorPeriodo = 0;

            // Determinar la cantidad de recibos por período según el tipo de vencimiento
            if ($tipoVencimiento == 1) { // Anual
                $recibosPorPeriodo = 1;
            } elseif ($tipoVencimiento == 2) { // Mensual
                $recibosPorPeriodo = 12;
            } elseif ($tipoVencimiento == 3) { // Quincenal
                $recibosPorPeriodo = 24;
            } elseif ($tipoVencimiento == 4) { // Semestral
                $recibosPorPeriodo = 2;
            } elseif ($tipoVencimiento == 5) { // Trimestral
                $recibosPorPeriodo = 4;
            } else {
                throw new \Exception('Tipo de vencimiento no válido');
            }

            // Convertir las fechas de inicio y fin de vigencia a objetos Carbon
            $fechaInicio = Carbon::parse($data['inicioVigencia']);
            $fechaFin = Carbon::parse($data['finVigencia']);

            // Calcular la cantidad total de períodos entre las fechas
            $diferenciaEnMeses = $fechaInicio->diffInMonths($fechaFin);
            $recibosTotal = ceil($diferenciaEnMeses / (12 / $recibosPorPeriodo)); // Total de recibos

            $poliza = $data['poliza_id'] ?? 3;

            // Crear los recibos
            for ($i = 0; $i < $recibosTotal; $i++) {
                $recibo = new PolizaRecibo();
                $recibo->poliza_id = $poliza;
                $recibo->numeroRecibo = 'REC-' . $poliza . "-" . str_pad($i + 1, 4, '0', STR_PAD_LEFT);

                // Calcular la fecha de vencimiento según el tipo de vencimiento
                $vencimiento = $fechaInicio->copy(); // Clonar la fecha de inicio para no modificarla
                if ($tipoVencimiento == 1) { // Anual
                    $vencimiento->addYears($i);
                } elseif ($tipoVencimiento == 2) { // Mensual
                    $vencimiento->addMonths($i);
                } elseif ($tipoVencimiento == 3) { // Quincenal
                    $vencimiento->addDays($i * 15);
                } elseif ($tipoVencimiento == 4) { // Semestral
                    $vencimiento->addMonths($i * 6);
                } elseif ($tipoVencimiento == 5) { // Trimestral
                    $vencimiento->addMonths($i * 3);
                }

                $recibo->vencimiento = $vencimiento->format('Y-m-d'); // Formatear la fecha de vencimiento
                $recibo->importe = $i == 0 ? $data['pagoInicial'] : $data['pagoSubsecuente'];
                $recibo->estatus = 'Pendiente';
                $recibo->save();
            }
            $this->newAccionHistorial('Creación de recibos, se crearon ' . $recibosTotal . ' de recibos', $poliza);

            Log::info('Recibos creados: ' . $recibosTotal);

            return response()->json([
                'result' => true,
                'message' => 'Recibos creados con éxito',
                'data' => $recibosTotal,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear los recibos: ' . $e->getMessage());
            return response()->json([
                'result' => false,
                'message' => 'Error al crear los recibos: ' . $e->getMessage(),
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
            $recibos = PolizaRecibo::where('poliza_id', $id)->get();
            foreach ($recibos as $recibo) {
                $recibo->delete();
            }

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

    public function getRecibos(Request $request)
    {
        try {
            $id = $request->input('poliza_id');

            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'Error al obtener los recibos: No se ha proporcionado el ID de la póliza',
                ]);
            }

            $recibos = PolizaRecibo::where('poliza_id', $id)->get();

            return response()->json([
                'result' => true,
                'message' => 'Recibos obtenidos con éxito',
                'data' => $recibos,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener los recibos: ' . $e->getMessage(),
            ]);
        }
    }
    public function gethistorial(Request $request)
    {
        try {
            $id = $request->input('poliza_id');

            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'Error al obtener los historial: No se ha proporcionado el ID de la póliza',
                ]);
            }

            $data = PolizaHistorial::where('poliza_id', $id)->get();

            return response()->json([
                'result' => true,
                'message' => 'Historial obtenido con éxito',
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al obtener el historial: ' . $e->getMessage(),
            ]);
        }
    }

    public function newAccionHistorial($acccion, $poliza_id = null)
    {
        try {

            if (!$poliza_id) {
                return false;
            }
            Log::info('acccion: ' . $acccion);
            Log::info('poliza_id: ' . $poliza_id);


            $tmp = PolizaHistorial::create([
                'accion' => $acccion,
                'poliza_id' => $poliza_id,
            ]);
            Log::info('Historial creado: ' . $tmp);

            return true;
        } catch (\Exception $e) {
            Log::info('Historial creado: ' . $e->getMessage());
            return false;
        }
    }
}
