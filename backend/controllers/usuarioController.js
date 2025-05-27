const { deleteById, getAllFrom } = require("./controller");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const tabla = "cliente";

//
//
//
//
// ------>        Ususarios
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  const result = await getAllFrom(tabla, filtros);
  return res.json(result);
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.delete = async (req, res) => {
  const { id } = req.body;
  const result = await deleteById(tabla, id);
  return res.json(result);
};

/**
 * Crear un usuario (función interna reutilizable)
 */
async function createUser(data) {
  try {
    // Validación básica
    if (
      !data.nombre ||
      !data.correo ||
      !data.tipo ||
      !data.tipo.id ||
      !data.password
    ) {
      return {
        result: false,
        message: "Faltan campos requeridos",
        data: [],
      };
    }
    // Validar unicidad de correo
    const existeCorreo = await prisma.usuario.findFirst({
      where: { correo: data.correo },
    });
    if (existeCorreo) {
      return {
        result: false,
        message: "El correo ya está en uso",
        data: [],
      };
    }
    // Transformar estatus
    data.estatus =
      data.estatus === "Activo" ||
      data.estatus === true ||
      data.estatus === "true"
        ? 1
        : 0;
    // Extraer tipo_id
    data.tipo_id = data.tipo.id;
    delete data.tipo;
    // Encriptar contraseña
    data.password = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await prisma.usuario.create({ data });
    return {
      result: true,
      message: "Registro creado con éxito",
      data: usuario,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al crear el registro: " + e.message,
      data: [],
    };
  }
}

/**
 * Crear un nuevo usuario.
 */
exports.create = async (req, res) => {
  const response = await createUser(req.body);
  // Si no quieres devolver el usuario creado, puedes eliminar el campo data
  if (response.data) delete response.data;
  res.json(response);
};

/**
 * Actualizar un usuario existente.
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;

    let data = req.body;

    if (!id) {
      return res.json({
        result: false,
        message: "ID de usuario no proporcionado",
        data: [],
      });
    }

    data = sanitizeData({ ...data }, { nestedToId: ["tipo"] });

    // Si viene password, encriptar
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data,
    });

    res.json({
      result: true,
      message: "Registro actualizado con éxito",
      data: usuario,
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar el registro: " + e.message,
      data: [],
    });
  }
};

//
//
//
// ------>        Usuarios claves
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAllClaves = async (req, res) => {
  // Puedes recibir filtros por body o query
  let include = { compania: true };
  const filtros = req.body || {};
  const result = await getAllFrom(tabla, filtros, include);
  return res.json(result);
};

/**
 * Eliminar una clave de usuario.
 */
exports.deleteClaves = async (req, res) => {
  const { id } = req.body;
  const result = await deleteById("usuarioClave", id);
  return res.json(result);
};

/**
 * Crear o actualizar una clave de usuario.
 */
exports.createOrUpdateClaves = async (req, res) => {
  try {
    let data = { ...req.body };
    data = sanitizeData({ ...data }, { nestedToId: ["compania"] });

    if (data.id) {
      await prisma.usuarioClave.update({
        where: { id: Number(data.id) },
        data,
      });

      return res.json({
        result: true,
        message: "Registro actualizado con éxito",
      });
    } else {
      await prisma.usuarioClave.create({ data });
      return res.json({
        result: true,
        message: "Registro creado con éxito",
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
    });
  }
};

/**
 * Obtener todos los equipos de usuario.
 */
exports.getAllTeam = async (req, res) => {
  try {
    const { principal_id, tipo } = req.body;

    if (!principal_id) {
      return res.json({
        result: false,
        message: "ID de usuario no proporcionado",
      });
    }

    const filtros = { principal_id: Number(principal_id) };

    if (tipo && tipo.id) {
      filtros.tipo_id = tipo.id;
    }

    const result = await getAllFrom("usuarioTeam", filtros);

    return res.json(result);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    });
  }
};

/**
 * Crear o actualizar un equipo de usuario.
 */
exports.createOrUpdateTeam = async (req, res) => {
  try {
    let data = { ...req.body };
    if (data.id) {
      delete data.created_at;
      delete data.deleted_at;
      delete data.updated_at;
      if (data.estatus !== undefined) {
        data.estatus =
          data.estatus === "Activo" ||
          data.estatus === true ||
          data.estatus === "true"
            ? 1
            : 0;
      }
      if (data.tipo && data.tipo.id) {
        data.tipo_id = data.tipo.id;
        delete data.tipo;
      }
      // Actualizar usuario
      const usuario = await prisma.usuario.update({
        where: { id: Number(data.usuario_id) },
        data,
      });
      // Actualizar equipo si es necesario (puedes agregar lógica aquí)
      return res.json({
        result: true,
        message: "Registro actualizado con éxito",
      });
    } else {
      // Crear usuario y luego el equipo
      const userResponse = await createUser(data);
      if (!userResponse.result) {
        delete userResponse.data;
        return res.json(userResponse);
      }
      const dataTeam = {
        principal_id: data.principal_id,
        tipo_id: userResponse.data.tipo_id,
        usuario_id: userResponse.data.id,
        estatus: data.estatus,
      };
      await prisma.usuarioTeam.create({ data: dataTeam });
      return res.json({
        result: true,
        message: "Registro creado con éxito",
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
    });
  }
};

/**
 * Eliminar un equipo de usuario y su usuario.
 */
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.body;
    const result = await deleteById("usuarioTeam", id);
    if (result.result) {
      await prisma.usuarioTeam.delete({ where: { id: Number(id) } });
      await prisma.usuario.delete({ where: { id: usuarioTeam.usuario_id } });
    }
    res.json({
      result: true,
      message: "Registro eliminado con éxito",
      data: { id },
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al eliminar el registro: " + e.message,
    });
  }
};
