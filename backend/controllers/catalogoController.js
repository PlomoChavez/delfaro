const {
  getAllFrom,
  createOrUpdate,
  deleteById,
} = require("../db/functionsSQL");

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
  const result = await createOrUpdate(tabla, { ...req.body });
  res.json(result);
};
