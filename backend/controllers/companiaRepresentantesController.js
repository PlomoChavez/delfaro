const { PrismaClient } = require("@prisma/client");
const { deleteById, getAllFrom, exportData } = require("./controller");
const prisma = new PrismaClient();
const tabla = "companiaRepresentante";
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
 * Crear o actualizar un representante de compañía.
 */
exports.createOrUpdate = async (req, res) => {
  try {
    const data = req.body;

    // Validación básica
    if (!data.compania_id || !data.nombre) {
      return res.json({
        result: false,
        message: "compania_id y nombre son requeridos",
      });
    }

    // Transformar estatus si viene
    if (data.estatus !== undefined) {
      data.estatus =
        data.estatus === "Activo" ||
        data.estatus === true ||
        data.estatus === "true"
          ? 1
          : 0;
    }

    if (data.id) {
      // Actualizar
      const representante = await prisma.companiaRepresentante.findUnique({
        where: { id: Number(data.id) },
      });
      if (!representante) {
        return res.json({
          result: false,
          message: "Registro no encontrado",
        });
      }

      await prisma.companiaRepresentante.update({
        where: { id: Number(data.id) },
      });

      return res.json({
        result: true,
        message: "Registro actualizado con éxito",
      });
    } else {
      // Crear
      await prisma.companiaRepresentante.create({ data });

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
