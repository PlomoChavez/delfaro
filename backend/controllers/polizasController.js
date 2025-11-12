const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { deleteById } = require("./controller");
const { getAllFromm, queryWithRelations } = require("../db/functionsSQL");
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
      "subAgente_id",
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
        tabla: "clientes",
        foreignKey: "id",
        localKey: "cliente_id",
        labelKey: "cliente",
        fields: ["nombre", "curp", "rfc"],
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
  const { id } = req.body;
  const result = await deleteById(tabla, id);
  if (!result.result) {
    await prisma.polizaRecibo.deleteMany({ where: { poliza_id: Number(id) } });
    await prisma.poliza.delete({ where: { id: Number(id) } });
  }
  return res.json(result);
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
    await newAccionHistorial("Creación de póliza", poliza.id);
    await createRecibos(data);

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
    await newAccionHistorial(
      `Creación de recibos, se crearon ${recibosTotal} de recibos`,
      poliza
    );
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

/**
 * Crear una acción en el historial de póliza.
 */
async function newAccionHistorial(accion, poliza_id = null) {
  try {
    if (!poliza_id) return false;
    await prisma.polizaHistorial.create({
      data: {
        accion,
        poliza_id,
      },
    });
    return true;
  } catch (e) {
    return false;
  }
}
