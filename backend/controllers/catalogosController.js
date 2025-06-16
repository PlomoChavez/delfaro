const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../db/functionsSQL");

const prisma = new PrismaClient();

let tablaMap = {
  "tipos-usuarios": "tipos_de_usuarios",
  "estatus-clientes": "estatus_cliente",
  "formas-pagos": "formas_de_pago",
  "metodos-pago": "metodos_de_pago",
  ramos: "ramos",
  estados: "estados",
  "tipos-vencimiento": "tipos_de_vencimiento",
  companias: "compania",
  monedas: "monedas",
  "estatus-poliza": "estatus_polizas",
};

exports.getCatalogo = async (req, res, tabla) => {
  try {
    let filtros = req.body || {};

    // Caso especial: ramosByCompania
    if (tabla === "ramosByCompania") {
      let companiaId = req.body.compania_id;
      if (!companiaId) {
        return res.json({
          result: false,
          message: "compania_id es requerido",
          data: [],
        });
      }

      let rows = await getAllFrom(
        "companias_ramos",
        { compania_id: companiaId, estatus: 1 },
        [
          {
            tabla: "ramos",
            foreignKey: "ramo_id", // campo en companias_ramos
            localKey: "id", // campo en ramos
            labelKey: "ramo", // cómo quieres llamar al objeto relacionado en el resultado (opcional)
            tipo: "one", // tipo de relación (por defecto "one")
            integrado: false,
            customName: false, // o false, o "relacion_"
          },
        ]
      );

      return res.json({
        result: true,
        message: "Registros obtenidos con éxito",
        data: rows,
      });
    }

    // Mapear tabla si es necesario
    let tablaReal = tablaMap[tabla];

    if (!tablaReal) {
      return res.json({
        result: false,
        message: "Tabla no válida",
        data: [],
      });
    }

    let resultado = await getAllFrom(tablaReal, filtros);

    return res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: resultado,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    });
  }
};
