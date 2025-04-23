<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\UsuarioClave;
use App\Models\UsuarioTeam;
use Illuminate\Support\Facades\Log;

class UsuarioController extends Controller
{
    private function createUser(array $data): array
    {
        try {
            // Validar los datos de entrada
            $validatedData = validator($data, [
                'nombre' => 'required|string|max:255',
                'correo' => 'required|string|unique:usuarios,correo',
                'tipo' => 'required|array', // Debe ser un array u objeto
                'tipo.id' => 'required|integer', // Validar que tenga la propiedad `id`
                'password' => 'required|string|min:2',
                'estatus' => 'required|boolean', // Debe ser un booleano
            ])->validate();

            // Validar y transformar el campo 'estatus' a 1 o 0
            $validatedData['estatus'] = ($validatedData['estatus'] === 'Activo' || $validatedData['estatus'] === true || $validatedData['estatus'] === 'true') ? 1 : 0;

            // Validar y transformar el campo 'tipo_id'
            if (isset($validatedData['tipo']) && (is_array($validatedData['tipo']) || is_object($validatedData['tipo']))) {
                $validatedData['tipo_id'] = $validatedData['tipo']['id'] ?? null; // Extraer la propiedad 'id' si existe
                unset($validatedData['tipo']); // Eliminar el campo 'tipo' para evitar conflictos
            }

            // Encriptar la contraseña
            $validatedData['password'] = bcrypt($validatedData['password']);

            // Crear el nuevo usuario
            $usuario = Usuario::create($validatedData);

            return [
                'result' => true,
                'message' => 'Registro creado con éxito',
                'data' => $usuario->toArray(),
            ];
        } catch (\Exception $e) {
            return [
                'result' => false,
                'message' => 'Error al crear el registro: ' . $e->getMessage(),
                'data' => [],
            ];
        }
    }
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
        $response = $this->createUser($request->all());
        if ($response["data"]) {
            unset($response["data"]);
        }
        return response()->json($response);
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
            $principal_id = $request->input('principal_id');
            $tipo = $request->input('tipo');
            if (!$principal_id) {
                return response()->json([
                    'result' => false,
                    'message' => 'ID de usuario no proporcionado',
                ]);
            }
            $query = UsuarioTeam::with('usuario', "tipo")->where("principal_id", $principal_id);
            if ($tipo) {
                $query->where("tipo_id", $tipo["id"]);
            }
            $usuarios = $query->get();
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
    public function createOrUpdateTeam(Request $request)
    {
        try {
            $data = $request->all();

            if (isset($data['id'])) {
                // Eliminar los campos 'created_at', 'deleted_at' y 'updated_at' si existen
                unset($data['created_at'], $data['deleted_at'], $data['updated_at']);
                // Validar y transformar el campo 'estatus' a 1 o 0
                if (isset($data['estatus'])) {
                    $data['estatus'] = ($data['estatus'] === 'Activo' || $data['estatus'] === true || $data['estatus'] === 'true') ? 1 : 0;
                }
                if (isset($data['tipo']) && (is_array($data['tipo']) || is_object($data['tipo']))) {
                    $data['tipo_id'] = $data['tipo']['id'] ?? null; // Extraer la propiedad 'id' si existe
                    unset($data['tipo']);
                }
                // Actualizar si existe un ID
                // Buscar el usuario por ID y actualizarlo
                $id = $data['usuario_id'];
                $usuario = Usuario::findOrFail($id);
                $usuario->update($data);
                // UsuarioTeam::where('id', $data['id'])->update($data);
                return response()->json([
                    'result' => true,
                    'message' => 'Registro actualizado con éxito',
                ]);
            } else {
                $response = $this->createUser($data);

                if ($response["result"] == false) {
                    unset($response["data"]);
                    return response()->json($response);
                }

                $dataTeam = [
                    'principal_id' => $data['principal_id'],
                    'tipo_id' => $response["data"]["tipo_id"],
                    'usuario_id' => $response["data"]["id"],
                    'estatus' => $data['estatus'],
                ];
                UsuarioTeam::insertGetId($dataTeam);
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
            $UsuarioTeam = UsuarioTeam::findOrFail($id);
            $usuario = Usuario::findOrFail($UsuarioTeam->usuario_id);
            $UsuarioTeam->delete();
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
