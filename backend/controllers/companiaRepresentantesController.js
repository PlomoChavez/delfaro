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

    return res.json(await createOrUpdate({ tabla, data: { ...data } }));
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
    });
  }
};
