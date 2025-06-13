const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const tabla = "polizaAsegurados";
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  res.json(getAllFromCustom(tabla, filtros));
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
 * Crear o actualizar un asegurado.
 */
exports.createOrUpdate = async (req, res) => {
  try {
    let data = { ...req.body };

    // Extraer IDs de objetos anidados
    if (data.estado && data.estado.id) {
      data.estado_id = data.estado.id;
    }

    // Validación básica
    if (!data.poliza_id || !data.rfc || !data.nombre || !data.fechaNacimiento) {
      return res.json({
        result: false,
        message: "poliza_id, rfc, nombre y fechaNacimiento son requeridos",
      });
    }

    if (data.id) {
      // Actualizar asegurado existente
      const asegurado = await prisma[tabla].findUnique({
        where: { id: Number(data.id) },
      });

      if (!asegurado) {
        return res.json({
          result: false,
          message: "Asegurado no encontrado",
        });
      }

      const actualizado = await prisma[tabla].update({
        where: { id: Number(data.id) },
        data,
      });

      return res.json({
        result: true,
        message: "Asegurado actualizado con éxito",
      });
    } else {
      // Crear un nuevo asegurado
      const nuevo = await prisma[tabla].create({ data });

      return res.json({
        result: true,
        message: "Asegurado creado con éxito",
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el asegurado: " + e.message,
    });
  }
};
