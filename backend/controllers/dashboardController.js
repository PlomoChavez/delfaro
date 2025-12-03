const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
  getAllFromm,
  queryWithRelations,
} = require("../db/functionsSQL");

const {
  getPathFolderFiles,
  handleFilePostMulter,
  filePathToPublicUrl,
} = require("../utils/filesHelper");

// Controlador
exports.inicioData = async (req, res) => {
  const { compania_id, ramo_id, inicioVigencia, finVigencia, agente_id } =
    req.body; // Datos del formulario

  let queryPoliza = {
    modelo: "polizas",
    filtros: {},
  };

  if (compania_id) {
    queryPoliza.filtros["compania_id"] = compania_id;
  }
  if (ramo_id) {
    queryPoliza.filtros["ramo_id"] = ramo_id;
  }
  if (agente_id) {
    queryPoliza.filtros["agente_id"] = agente_id;
  }
  console.log(queryPoliza);

  const rows = await queryWithRelations(queryPoliza);
  let indicadores = {
    totalPolizas: 0,
    totalPrimaNeta: 0,
    totalPrimaTotal: 0,
  };

  indicadores.totalPolizas = rows.length;

  indicadores.totalPrimaNeta = rows.reduce(
    (sum, poliza) => sum + parseFloat(poliza.primaNeta || 0),
    0
  );
  indicadores.totalPrimaTotal = rows.reduce(
    (sum, poliza) => sum + parseFloat(poliza.primaTotal || 0),
    0
  );

  try {
    res.json({
      result: true,
      message: "Datos de inicio obtenidos con éxito.",
      data: indicadores,
    });
  } catch (error) {
    res.json({
      result: false,
      message: "Error al procesar el pago. " + error.message,
    });
  }
};
