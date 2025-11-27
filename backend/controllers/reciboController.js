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
exports.pagar = async (req, res) => {
  const {
    reciboId,
    formaPago,
    fechaPago,
    comentarios,
    polizaId,
    companiaId,
    numeroRecibo,
  } = req.body; // Datos del formulario
  const soporte = req.file; // Archivo enviado (si existe)

  try {
    if (!soporte) {
      return res.status(400).json({
        result: false,
        message: "El archivo de soporte es obligatorio.",
      });
    }
    let recibos = await queryWithRelations({
      modelo: "poliza_recibos",
      filtros: { id: reciboId },
    });

    if (recibos.length != 1) {
      return res.json({
        result: false,
        message: "Error al obtener el recibo.",
      });
    }

    let polizas = await queryWithRelations({
      modelo: "polizas",
      filtros: { id: recibos[0].poliza_id },
      include: [
        {
          tabla: "compania",
          foreignKey: "id",
          localKey: "compania_id",
          labelKey: "compania",
          fields: ["nombre"],
        },
      ],
    });

    if (polizas.length != 1) {
      return res.json({
        result: false,
        message: "Error al obtener la poliza.",
      });
    }

    let poliza = polizas[0];

    // Crear la carpeta de destino dependiendo de la póliza y la compañía
    const folderFiles = await getPathFolderFiles([
      "polizas",
      poliza.compania.nombre.toLowerCase().replace(/ /g, "_"),
      poliza.numeroPoliza,
      "recibos",
    ]);

    let returnMulter = await handleFilePostMulter({
      folderContenedor: folderFiles,
      newFileName: `recibo_${poliza.numeroPoliza}_${recibos[0].numeroRecibo}`,
      file: soporte,
    });

    let urlSoporte = await filePathToPublicUrl(returnMulter.finalPath);

    let tmp = {
      id: reciboId,
      formaPago,
      fechaPago,
      estatus: "Pagado",
      evidencia: urlSoporte,
    };
    // Guardar la información en la base de datos
    const response = await createOrUpdate({
      estatusDefault: false,
      tabla: "poliza_recibos",
      data: tmp,
    });

    res.json({
      result: true,
      message: "Pago registrado con éxito y archivo guardado.",
      data: response,
    });
  } catch (error) {
    res.json({
      result: false,
      message: "Error al procesar el pago. " + error.message,
    });
  }
};
