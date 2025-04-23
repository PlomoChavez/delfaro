<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\UsuarioClave;
use App\Models\UsuarioTeam;

class UsuarioController extends Controller
{
    //** Usuarios */

    /**
     * Obtener todos los registros de la tabla usuarios.
     */
    public function getAll(Request $request)
    {
        try {
            $usuarios = Usuario::with('tipo')->get();
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
                'tipo' => 'required|array', // Debe ser un array u objeto
                'tipo.id' => 'required|integer', // Validar que tenga la propiedad `id`
                'password' => 'required|string|min:2',
                'estatus' => 'required|boolean', // Debe ser un booleano
            ]);

            $data = $request->all();

            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            // Validar y transformar el campo 'tipo_id'
            if (isset($data['tipo']) && (is_array($data['tipo']) || is_object($data['tipo']))) {
                $data['tipo_id'] = $data['tipo']['id'] ?? null; // Extraer la propiedad 'id' si existe
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
    public function delete(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de usuario no proporcionado',
                ]);
            }
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

    //** Usuarios - Claves */

    /**
     * Obtener todos los registros de la tabla usuarios.
     */
    public function getAllClaves(Request $request)
    {
        try {
            $usuarios = UsuarioClave::with('compania')->get();
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
    public function createOrUpdateClaves(Request $request)
    {
        try {
            $data = $request->all();

            // Eliminar los campos 'created_at', 'deleted_at' y 'updated_at' si existen
            unset($data['created_at'], $data['deleted_at'], $data['updated_at']);
            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            if (isset($data['compania'])) {
                $data['compania_id'] = $data['compania']['id'];
                unset($data['compania']);
            }
            if (isset($data['id'])) {
                // Actualizar si existe un ID

                UsuarioClave::where('id', $data['id'])->update($data);
                return response()->json([
                    'result' => true,
                    'message' => 'Registro actualizado con éxito',
                ]);
            } else {
                // dd("else",$data);
                // Crear si no existe un ID
                UsuarioClave::insertGetId($data);
                return response()->json([
                    'result' => true,
                    'message' => 'Registro creado con éxito',
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear o actualizar el registro: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Eliminar un registro específico de la tabla usuarios.
     */
    public function deleteClaves(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de usuario no proporcionado',
                ]);
            }
            // Buscar el usuario por ID y eliminarlo
            $row = UsuarioClave::findOrFail($id);
            $row->delete();

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


    //** Usuarios - Team */

    /**
     * Obtener todos los registros de la tabla usuarios.
     */
    public function getAllTeam(Request $request)
    {
        try {
            $usuarios = Usuario::with('tipo')->get();
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
    public function createTeam(Request $request)
    {
        try {
            // Validar los datos de entrada
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:255',
                'correo' => 'required|string|unique:usuarios,correo',
                // 'correo' => 'required|email|unique:usuarios,correo',
                'tipo' => 'required|array', // Debe ser un array u objeto
                'tipo.id' => 'required|integer', // Validar que tenga la propiedad `id`
                'password' => 'required|string|min:2',
                'estatus' => 'required|boolean', // Debe ser un booleano
            ]);

            $data = $request->all();

            // Validar y transformar el campo 'estatus' a 1 o 0
            if (isset($data['estatus'])) {
                $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
            }
            // Validar y transformar el campo 'tipo_id'
            if (isset($data['tipo']) && (is_array($data['tipo']) || is_object($data['tipo']))) {
                $data['tipo_id'] = $data['tipo']['id'] ?? null; // Extraer la propiedad 'id' si existe
            }
            $data['password'] = bcrypt($data['password']);

            // Crear el nuevo usuario
            $usuario = Usuario::create($data);

            return response()->json([
                'result' => true,
                'message' => 'Registro creado con éxito',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'result' => false,
                'message' => 'Error al crear el registro: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Actualizar un registro existente en la tabla usuarios.
     */
    public function updateTeam(Request $request, $id)
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
    public function deleteTeam(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de usuario no proporcionado',
                ]);
            }
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
            ]);
        }
    }
}
