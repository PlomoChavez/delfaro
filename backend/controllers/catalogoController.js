const {
  getAllFrom,
  createOrUpdate,
  deleteById,
} = require("../db/functionsSQL");

const { getAllFromCustom } = require("../db/customFunctions");

exports.getDataByCatalogo = async (req, res, tabla, campo, valor) => {
  const filtros = { [campo]: valor };
  res.json(getAllFromCustom(tabla, filtros));
};

exports.getAll = async (req, res, tabla) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  res.json(await getAllFromCustom(tabla, filtros));
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
