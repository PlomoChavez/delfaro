const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
const {
  getAllFrom,
  deleteByFilter,
  deleteById,
} = require("../db/functionsSQL");

const prisma = new PrismaClient();

exports.getDataByCatalogo = async (req, res, tabla, campo, valor) => {
  try {
    const filtros = { [campo]: valor };
    let result = await getAllFrom(tabla, filtros);
    result.data = exportData(result.data);
    res.json(result);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los registros filtrados: " + e.message,
    });
  }
};

exports.getAll = async (req, res, tabla) => {
  try {
    const filtros = req.body || {};
    let result = await getAllFrom(tabla, filtros);
    res.json(result);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    });
  }
};

exports.delete = async (req, res, tabla) => {
  const id = req.body.id;
  const result = await deleteById(tabla, id);
  res.json(result);
};

exports.createOrUpdate = async (req, res, tabla) => {
  try {
    let data = { ...req.body };

    // Eliminar campos no deseados
    delete data.created_at;
    delete data.deleted_at;
    delete data.updated_at;

    // Validar y transformar el campo 'estatus'
    if (data.estatus !== undefined) {
      data.estatus =
        data.estatus === "Activo" ||
        data.estatus === 1 ||
        data.estatus === "true" ||
        data.estatus === true
          ? true
          : false;
    }
    if (data.id) {
      // Actualizar si existe un ID
      await prisma[tabla].update({
        where: { id: data.id },
        data,
      });
      res.json({
        result: true,
        message: "Registro actualizado con éxito",
      });
    } else {
      // Crear si no existe un ID
      const nuevo = await prisma[tabla].create({ data });
      res.json({
        result: true,
        message: "Registro creado con éxito",
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
      data: [],
    });
  }
};
