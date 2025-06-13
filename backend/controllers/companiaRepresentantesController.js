// const { PrismaClient } = require("@prisma/client");
// const { deleteById, getAllFrom, exportData } = require("./controller");
// const prisma = new PrismaClient();
// const tabla = "companiaRepresentante";
const { getAllFromCustom } = require("../db/customFunctions");

const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../db/functionsSQL");
const { sanitizeData } = require("../controllers/controller");
const tabla = "compania_representantes";
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  const filtros = req.body || {};
  res.json(await getAllFromCustom(tabla, filtros));
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
    let data = req.body;

    // Validación básica
    if (!data.compania_id || !data.nombre) {
      return res.json({
        result: false,
        message: "compania_id y nombre son requeridos",
      });
    }
    data = await sanitizeData(data);

    if (data.id) {
      // Actualizar
      const respresentante = await findOne({
        table: tabla,
        filters: { id: data.id },
      });

      if (!respresentante) {
        return res.json({
          result: false,
          message: "Registro no encontrado",
        });
      }
      await createOrUpdate(tabla, data);

      return res.json({
        result: true,
        message: "Registro actualizado con éxito",
      });
    } else {
      // Crear
      await createOrUpdate(tabla, data);

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
