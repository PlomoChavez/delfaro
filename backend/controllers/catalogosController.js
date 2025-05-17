const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
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
      // Ajusta el include según tu modelo Prisma
      let rows = await prisma.companiaRamo.findMany({
        where: {
          compania_id: companiaId,
          estatus: 1,
        },
        include: {
          ramo: true,
        },
      });

      // Mezcla los datos de companiaRamo y ramo
      let datosRamos = rows.map((item) => ({
        ...item,
        ...item.ramo,
        compania_id: item.compania_id,
        estatus: item.estatus,
      }));

      const objSinBigInt = JSON.parse(
        JSON.stringify(resultado, replacerBigInt)
      );
      return res.json({
        result: true,
        message: "Registros obtenidos con éxito",
        data: objSinBigInt,
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

    // Construir condiciones where si hay filtros
    let where = {};
    Object.entries(filtros).forEach(([key, value]) => {
      where[key] = value;
    });

    // Consultar la tabla
    let resultado = await prisma[tablaReal].findMany({
      where: Object.keys(where).length ? where : undefined,
    });
    resultado = exportData(resultado);
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
