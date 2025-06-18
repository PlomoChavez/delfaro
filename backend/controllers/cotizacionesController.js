const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../db/functionsSQL");
const prisma = new PrismaClient();

exports.getCompniasByRamo = async (req, res) => {
  try {
    const ramoId = req.body.ramo;
    if (!ramoId) {
      return res.json({
        result: false,
        message: "ramo es requerido",
        data: [],
      });
    }

    // 1. Trae todos los productos de compañías para el ramo solicitado
    const productos = await getAllFrom("companias_productos", {
      ramo_id: ramoId,
    });

    // 2. Extrae los IDs únicos de las compañías que tienen productos en ese ramo
    const companiaIds = [...new Set(productos.map((p) => p.compania_id))];

    if (!companiaIds.length) {
      return res.json({
        result: true,
        message: "No hay compañías para ese ramo",
        data: [],
      });
    }

    // 3. Trae las compañías correspondientes
    const companias = await getAllFrom("compania", { id: companiaIds });

    // 4. Une productos a cada compañía
    const companiasConProductos = companias.map((compania) => ({
      ...compania,
      companias_productos: productos.filter(
        (p) => p.compania_id === compania.id
      ),
    }));

    return res.json({
      result: true,
      message: "Compañías obtenidas con éxito",
      data: companiasConProductos,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener las compañías: " + e.message,
      data: [],
    });
  }
};

exports.getAllCotizaciones = async (req, res) => {
  try {
    const queryData = await getAllFrom("cotizaciones");

    return res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: queryData,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
    });
  }
};

exports.createOrUpdateCotizacion = async (req, res) => {
  try {
    let data = { ...req.body };

    data.configuracion = JSON.stringify(data.configuracion || {});

    let tipoResponse = data.id ? false : "id";

    const response = await createOrUpdate({
      tabla: "cotizaciones",
      estatusDefault: false,
      data: { ...data },
      returnResponse: tipoResponse,
    });

    return res.json(response);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los productos: " + e.message,
    });
  }
};
