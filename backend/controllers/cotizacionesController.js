const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
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

    // Consulta eficiente: trae compañías que tengan el ramo y sus productos
    const companias = await prisma.compania.findMany({
      where: {
        companias_ramos: {
          some: {
            ramo_id: BigInt(ramoId),
            estatus: true,
          },
        },
      },
      include: {
        companias_productos: true, // Incluye la relación de productos
      },
    });

    let resultado = exportData(companias);

    return res.json({
      result: true,
      message: "Compañías obtenidas con éxito",
      data: resultado,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener las compañías: " + e.message,
      data: [],
    });
  }
};
