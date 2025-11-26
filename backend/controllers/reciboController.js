const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
  getAllFromm,
  queryWithRelations,
} = require("../db/functionsSQL");
const tabla = "polizas";
const modelo = tabla;
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.pagar = async (req, res) => {
  const { reciboId, formaPago, fechaPago, comentarios, soporte } = req.body;

      const response = await createOrUpdate({
      tabla: "poliza_recibos",
      estatusDefault: false,
      data: { 
        id: reciboId,
        formaPago,
        fechaPago,
        estatus: 'Pagado',
      },
      },
      returnResponse: true,
    });

  res.json({
    result: true,
    message: "Registros obtenidos con éxito",
    data: rows,
  });
};
