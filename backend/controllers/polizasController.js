const { enviarCorreo } = require("../utils/emailServiceHelper");
const { registrarAccion } = require("./historicoController");
const moment = require("moment");
const fs = require("fs");

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
exports.getAll = async (req, res) => {
  let filtros = {};

  let query = {
    modelo,
    filtros,
    fieldsExclude: [
      "compania_id",
      "ramo_id",
      "producto_id",
      "frecuenciaPago_id",
      "metodoPago_id",
      "moneda_id",
      "estatus_id",
      "tipoVencimiento_id",
      "asegurado_id",
      "cotizacion_id",
    ],

    include: [
      {
        tabla: "poliza_recibos",
        foreignKey: "id",
        localKey: "recibo_id",
        labelKey: "recibo",
      },
      {
        tabla: "poliza_historial",
        foreignKey: "poliza_id",
        localKey: "id",
        labelKey: "historial",
        type: "many",
      },
      {
        tabla: "poliza_asegurados",
        foreignKey: "poliza_id",
        localKey: "id",
        labelKey: "asegurados",
        type: "many",
      },
      {
        tabla: "poliza_recibos",
        foreignKey: "poliza_id",
        localKey: "id",
        labelKey: "recibos",
        type: "many",
      },
      {
        tabla: "usuarios",
        foreignKey: "id",
        localKey: "subAgente_id",
        labelKey: "agente",
        fields: ["nombre", "correo"],
      },
      {
        tabla: "clientes",
        foreignKey: "id",
        localKey: "cliente_id",
        labelKey: "cliente",
        fields: ["nombre", "curp", "rfc", "correo"],
      },
      {
        tabla: "compania",
        foreignKey: "id",
        localKey: "compania_id",
        labelKey: "compania",
        fields: ["nombre", "nombreCorto", "rfc"],
      },
      {
        tabla: "ramos",
        foreignKey: "id",
        localKey: "ramo_id",
        labelKey: "ramo",
        fields: ["label"],
      },
      {
        tabla: "companias_productos",
        foreignKey: "id",
        localKey: "producto_id",
        labelKey: "producto",
        fields: ["nombre"],
      },
      {
        tabla: "formas_de_pago",
        foreignKey: "id",
        localKey: "frecuenciaPago_id",
        labelKey: "frecuenciaPago",
        fields: ["label"],
      },
      {
        tabla: "metodos_de_pago",
        foreignKey: "id",
        localKey: "metodoPago_id",
        labelKey: "metodoPago",
        fields: ["label"],
      },
      {
        tabla: "monedas",
        foreignKey: "id",
        localKey: "moneda_id",
        labelKey: "moneda",
        fields: ["label"],
      },
      {
        tabla: "estatus_polizas",
        foreignKey: "id",
        localKey: "estatus_id",
        labelKey: "estatusPoliza",
        fields: ["label"],
      },
      {
        tabla: "tipos_de_vencimiento",
        foreignKey: "id",
        localKey: "tipoVencimiento_id",
        labelKey: "tipoVencimiento",
        fields: ["label"],
      },
    ],
  };

  let rows = await queryWithRelations(query);

  res.json({
    result: true,
    message: "Registros obtenidos con éxito",
    data: rows,
  });
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.delete = async (req, res) => {
  const id = req.body.id;
  const result = await deleteById(tabla, id);
  res.json(result);
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.enviarArchivosPoliza = async (req, res) => {
  try {
    const { poliza_id: id, correo } = req.body;

    if (!correo || !id) {
      return res.status(400).json({
        result: false,
        message: "Faltan campos requeridos para enviar el correo",
      });
    }

    const query = {
      modelo,
      filtros: { id },
    };

    const rows = await queryWithRelations(query);

    if (rows.length !== 1) {
      return res.status(404).json({
        result: false,
        message: "Póliza no encontrada",
      });
    }

    const poliza = rows[0];
    const archivos = JSON.parse(poliza.archivos || "[]");
    const attachments = [];

    archivos.forEach((archivo) => {
      const filePath = archivo.ruta;
      if (fs.existsSync(filePath)) {
        attachments.push({
          filename: archivo.nombre,
          path: filePath,
        });
      } else {
        console.error(`El archivo no existe: ${filePath}`);
      }
    });

    if (attachments.length === 0) {
      return res.status(400).json({
        result: false,
        message: "No se encontraron archivos adjuntos válidos para enviar.",
      });
    }

    const mailOptions = {
      to: correo,
      subject: `Envío de Póliza: ${poliza.numeroPoliza || "Sin número"}`,
      text: `Estimado/a ${
        poliza.cliente?.nombre || "Cliente"
      },\n\nAdjunto encontrará la información de su póliza.`,
      html: `<p>Estimado/a ${poliza.cliente?.nombre || "Cliente"},</p>
             <p>Adjunto encontrará la información de su póliza.</p>`,
      attachments,
    };

    const result = await enviarCorreo(mailOptions);

    if (!result.result) {
      return res.status(500).json({
        result: false,
        message: "Error al enviar el correo: " + result.message,
      });
    }

    return res.status(200).json({
      result: true,
      message: "Correo enviado con éxito",
    });
  } catch (error) {
    console.error("Error interno al enviar la póliza:", error);
    return res.status(500).json({
      result: false,
      message: "Error interno al enviar la póliza: " + error.message,
    });
  }
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.cancelarPoliza = async (req, res) => {
  const id = req.body.poliza_id;
  const motivoCancelacion = req.body.motivo || "";

  let polizas = await queryWithRelations({
    modelo: "polizas",
    filtros: { id },
  });

  if (polizas.length != 1) {
    res.json({
      result: false,
      message: "Ocurrio un error al cancelar la póliza, inténtelo de nuevo.",
    });
  }

  const fechaCancelacion = moment().format("DD/MM/YYYY"); // Fecha actual en formato "DD/MM/YYYY"

  let poliza = polizas[0];

  await createOrUpdate({
    tabla: "polizas",
    data: {
      id,
      estatus_id: 3,
      fechaCancelado: fechaCancelacion,
      motivoCancelacion,
    },
  });

  let recibos = await queryWithRelations({
    modelo: "poliza_recibos",
    filtros: { poliza_id: id },
    // filtros: { poliza_id: id, estatus: "Pendiente" },
  });

  for (let recibo of recibos) {
    await createOrUpdate({
      tabla: "poliza_recibos",
      estatusDefault: false,
      data: {
        id: recibo.id,
        estatus: "Cancelado",
        fechaCancelado: fechaCancelacion,
      },
    });
  }
  await createOrUpdate({
    tabla: "poliza_recibos",
    estatusDefault: false,
    data: { id: poliza.recibo_id, estatus: "Vencido" },
  });

  await registrarAccion({
    polizaID: id,
    accion: `Póliza cancelada. Motivo: ${motivoCancelacion}`,
  });

  res.json({
    result: true,
    message: "Póliza cancelada con éxito",
  });
};

/**
 * Obtener recursos para el wizard (companias, claves, companias_id).
 */
exports.getRecursosWizard = async (req, res) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) {
      return res.json({
        result: false,
        message:
          "Error al obtener los registros: No se ha proporcionado el ID del usuario",
      });
    }

    const claves = await prisma.usuarioClave.findMany({
      where: { usuario_id: Number(usuario_id) },
      include: { compania: true },
    });

    if (!claves.length) {
      return res.json({
        result: true,
        message: "Este usuario no tiene claves",
        data: [],
      });
    }

    const companias_id = claves.map((c) => c.compania_id);
    const companias = await prisma.compania.findMany({
      where: { id: { in: companias_id } },
      include: {
        ramos: {
          include: {
            productos: {
              select: { id: true, ramo_id: true, nombre: true, estatus: true },
            },
          },
        },
      },
    });

    // No existe el concepto de "pivot" en Prisma, así que no es necesario ocultarlo

    return res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: {
        companias,
        claves,
        companias_id,
      },
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
    });
  }
};

/**
 * Crear una nueva póliza.
 */
exports.create = async (req, res) => {
  try {
    let data = { ...req.body };

    // Extraer IDs de objetos anidados
    data.formaPago_id = data.formaPago?.id ?? null;
    data.tipoVencimiento_id = data.tipoVencimiento?.id ?? null;
    data.metodoPago_id = data.metodoPago?.id ?? null;
    data.moneda_id = data.moneda?.id ?? null;
    data.estatus_id = data.estatus?.id ?? null;
    if (typeof data.primaNeta === "string") {
      data.primaNeta = Number(data.primaNeta.replace(/[$,]/g, ""));
    }

    // Validación básica (puedes usar Joi para más robustez)
    if (
      !data.cliente_id ||
      !data.formaPago_id ||
      !data.inicioVigencia ||
      !data.finVigencia ||
      !data.tipoVencimiento_id ||
      !data.antiguedad ||
      !data.compania_id ||
      !data.subAgente_id ||
      !data.ramo_id ||
      !data.metodoPago_id ||
      !data.primaNeta ||
      !data.primaTotal ||
      !data.moneda_id ||
      !data.producto_id ||
      !data.pagoInicial ||
      !data.pagoSubsecuente
    ) {
      return res.json({
        result: false,
        message: "Faltan campos requeridos para crear la póliza",
      });
    }

    const poliza = await prisma.poliza.create({ data });
    data.poliza_id = poliza.id;

    await registrarAccion({
      polizaID: poliza.id,
      accion: "Creación de póliza",
    });

    await createRecibos(data);

    await registrarAccion({
      polizaID: poliza.id,
      accion: "Creación de recibos para la póliza",
    });

    return res.json({
      result: true,
      message: "Póliza creada con éxito",
      data: poliza,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al crear la póliza: " + e.message,
    });
  }
};

/**
 * Crear recibos para una póliza.
 */
async function createRecibos(data) {
  try {
    const tipoVencimiento = data.formaPago_id ?? null;
    let recibosPorPeriodo = 0;

    // Determinar la cantidad de recibos por período según el tipo de vencimiento
    if (tipoVencimiento == 1) recibosPorPeriodo = 1; // Anual
    else if (tipoVencimiento == 2) recibosPorPeriodo = 12; // Mensual
    else if (tipoVencimiento == 3) recibosPorPeriodo = 24; // Quincenal
    else if (tipoVencimiento == 4) recibosPorPeriodo = 2; // Semestral
    else if (tipoVencimiento == 5) recibosPorPeriodo = 4; // Trimestral
    else throw new Error("Tipo de vencimiento no válido");

    const fechaInicio = new Date(data.inicioVigencia);
    const fechaFin = new Date(data.finVigencia);

    // Calcular la cantidad total de períodos entre las fechas
    const diferenciaEnMeses =
      (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
      (fechaFin.getMonth() - fechaInicio.getMonth());
    const recibosTotal = Math.ceil(
      diferenciaEnMeses / (12 / recibosPorPeriodo)
    );

    const poliza = data.poliza_id;

    // Crear los recibos
    for (let i = 0; i < recibosTotal; i++) {
      let vencimiento = new Date(fechaInicio);
      if (tipoVencimiento == 1)
        vencimiento.setFullYear(vencimiento.getFullYear() + i);
      else if (tipoVencimiento == 2)
        vencimiento.setMonth(vencimiento.getMonth() + i);
      else if (tipoVencimiento == 3)
        vencimiento.setDate(vencimiento.getDate() + i * 15);
      else if (tipoVencimiento == 4)
        vencimiento.setMonth(vencimiento.getMonth() + i * 6);
      else if (tipoVencimiento == 5)
        vencimiento.setMonth(vencimiento.getMonth() + i * 3);

      await prisma.polizaRecibo.create({
        data: {
          poliza_id: poliza,
          numeroRecibo: `REC-${poliza}-${String(i + 1).padStart(4, "0")}`,
          vencimiento: vencimiento.toISOString().slice(0, 10),
          importe: i === 0 ? data.pagoInicial : data.pagoSubsecuente,
          estatus: "Pendiente",
        },
      });
    }
    return true;
  } catch (e) {
    // Puedes agregar logs aquí si lo deseas
    return false;
  }
}

/**
 * Actualizar una póliza existente.
 */
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Validación básica (puedes usar Joi para más robustez)
    if (!id) {
      return res.json({
        result: false,
        message: "ID de póliza no proporcionado",
      });
    }

    const poliza = await prisma.poliza.findUnique({
      where: { id: Number(id) },
    });
    if (!poliza) {
      return res.json({
        result: false,
        message: "Póliza no encontrada",
      });
    }

    const actualizada = await prisma.poliza.update({
      where: { id: Number(id) },
      data,
    });

    return res.json({
      result: true,
      message: "Póliza actualizada con éxito",
      data: actualizada,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al actualizar la póliza: " + e.message,
    });
  }
};

/**
 * Obtener recibos de una póliza.
 */
exports.getRecibos = async (req, res) => {
  try {
    const { poliza_id } = req.body;
    if (!poliza_id) {
      return res.json({
        result: false,
        message:
          "Error al obtener los recibos: No se ha proporcionado el ID de la póliza",
      });
    }
    const recibos = await prisma.polizaRecibo.findMany({
      where: { poliza_id: Number(poliza_id) },
    });
    return res.json({
      result: true,
      message: "Recibos obtenidos con éxito",
      data: recibos,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al obtener los recibos: " + e.message,
    });
  }
};

/**
 * Obtener historial de una póliza.
 */
exports.getHistorial = async (req, res) => {
  const { poliza_id } = req.body;
  const result = await getAllFrom("polizaHistorial", {
    poliza_id: Number(poliza_id),
  });
  return res.json(result);
};
