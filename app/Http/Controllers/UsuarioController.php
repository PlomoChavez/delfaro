<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    /**
     * Obtener todos los registros de la tabla usuarios.
     */
    public function getAll(Request $request)
    {
        try {
            $usuarios = Usuario::all();
            return response()->json([
                'result' => true,
                'message' => 'Registros obtenidos con éxito',
                'data' => $usuarios,
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
     * Crear un nuevo registro en la tabla usuarios.
     */
    public function create(Request $request)
    {
        try {
            // Validar los datos de entrada
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'correo' => 'required|string|unique:usuarios,correo',
                // 'correo' => 'required|email|unique:usuarios,correo',
                'tipo_id' => 'required|array', // Debe ser un array u objeto
                'tipo_id.id' => 'required|integer', // Validar que tenga la propiedad `id`
                'password' => 'required|string|min:2',
                'estatus' => 'required|boolean', // Debe ser un booleano
            ]);

            $data = $request->all();

            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            // Validar y transformar el campo 'tipo_id'
            if (isset($data['tipo_id']) && (is_array($data['tipo_id']) || is_object($data['tipo_id']))) {
                $data['tipo_id'] = $data['tipo_id']['id'] ?? null; // Extraer la propiedad 'id' si existe
            }
            $data['password'] = bcrypt($data['password']);

            // Crear el nuevo usuario
            $usuario = Usuario::create($data);

            return response()->json([
                'result' => true,
                'message' => 'Registro creado con éxito',
                'data' => $usuario,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear el registro: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Actualizar un registro existente en la tabla usuarios.
     */
    public function update(Request $request, $id)
    {
        try {
            $data = $request->all();

            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }

            // Buscar el usuario por ID y actualizarlo
            $usuario = Usuario::findOrFail($id);
            $usuario->update($data);

            return response()->json([
                'result' => true,
                'message' => 'Registro actualizado con éxito',
                'data' => $usuario,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al actualizar el registro: ' . $e->getMessage(),
                'data' => [],
            ]);
        }
    }

    /**
     * Eliminar un registro específico de la tabla usuarios.
     */
    public function delete(Request $request, $id)
    {
        try {
            // Buscar el usuario por ID y eliminarlo
            $usuario = Usuario::findOrFail($id);
            $usuario->delete();

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
}
