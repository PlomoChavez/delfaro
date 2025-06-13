const {
  findOne,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../db/functionsSQL");
const { updateCompania, getAllFromCustom } = require("../db/customFunctions");
const tabla = "compania";
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  res.json(await getAllFromCustom(tabla, filtros));
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.delete = async (req, res) => {
  const { id } = req.body;
  const result = await deleteById(tabla, id);
  return res.json(result);
};

/**
 * Crear una nueva compañía.
 */
exports.create = async (req, res) => {
  try {
    const data = req.body;

    // Validación básica
    if (!data.rfc || !data.nombre || !data.nombreCorto) {
      return res.json({
        result: false,
        message: "RFC, nombre y nombreCorto son requeridos",
        data: [],
      });
    }

    let existeRFC = await findOne({ table: tabla, filters: { rfc: data.rfc } });

    if (existeRFC) {
      return res.json({
        result: false,
        message: "El RFC ya está en uso por otra compañía",
        data: [],
      });
    }

    let dataNuevaCompania = {
      rfc: data.rfc,
      nombre: data.nombre,
      nombreCorto: data.nombreCorto,
      direccion: "",
      codigoPostal: "",
      ciudad: "",
      limitePrimerPago: 0,
      limitePrimerSubsecuente: 0,
    };
    await createOrUpdate(tabla, dataNuevaCompania);

    res.json({
      result: true,
      message: "Compañía creada con éxito",
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear la compañía: " + e.message,
      data: [],
    });
  }
};

/**
 * Actualizar una compañía existente.
 */
exports.update = async (req, res) => {
  res.json(await updateCompania({ ...req.body }));
};

/**
 * Obtener ramos de una compañía, marcando cuáles están activos.
 */
exports.getRamos = async (req, res) => {
  try {
    const { compania_id } = req.body;
    if (!compania_id) {
      return res.json({
        result: false,
        message: "ID de compañía no proporcionado",
        data: [],
      });
    }

    let ramos = await getAllFrom("ramos", {});
    let ramosActivos = await getAllFrom("companias_ramos", {
      compania_id: Number(compania_id),
      estatus: 1,
    });

    const activosIds = ramosActivos.map((r) => r.ramo_id);
    const result = ramos.map((ramo) => ({
      ...ramo,
      isActivo: activosIds.includes(ramo.id),
    }));

    res.json({
      result: true,
      message: "Ramos obtenidos con éxito",
      data: result,
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los ramos: " + e.message,
      data: [],
    });
  }
};

/**
 * Actualizar ramos de una compañía.
 */
exports.updateRamos = async (req, res) => {
  try {
    const { compania_id, ramos } = req.body;
    if (!compania_id) {
      return res.json({
        result: false,
        message: "ID de compañía no proporcionado",
        data: [],
      });
    }
    for (const ramo of ramos) {
      // Buscar si ya existe la relación
      const existente = await findOne({
        table: "companias_ramos",
        filters: {
          compania_id: Number(compania_id),
          ramo_id: ramo.id,
        },
      });

      // Usar createOrUpdate para actualizar o crear el registro
      await createOrUpdate("companias_ramos", {
        compania_id: Number(compania_id),
        ramo_id: ramo.id,
        estatus: ramo.isActivo ? 1 : 0,
        id: existente ? existente.id : undefined, // Si existe, actualiza; si no, crea
      });
    }
    res.json({
      result: true,
      message: "Ramos actualizados con éxito",
      data: [],
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los ramos: " + e.message,
      data: [],
    });
  }
};

/**
 * Obtener productos de una compañía (con ramo).
 */
exports.getCompaniaProductos = async (req, res) => {
  try {
    const { compania_id } = req.body;
    if (!compania_id) {
      return res.json({
        result: false,
        message: "ID de compañía no proporcionado",
        data: [],
      });
    }
    const productos = await prisma.companiaProducto.findMany({
      where: { compania_id: Number(compania_id) },
      include: { ramo: true },
    });
    res.json({
      result: true,
      message: "Productos obtenidos con éxito",
      data: productos,
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los productos: " + e.message,
      data: [],
    });
  }
};

/**
 * Crear o actualizar productos de una compañía.
 */
exports.createOrUpdateCompaniaProductos = async (req, res) => {
  try {
    let data = { ...req.body };
    const compania_id = data.compania_id;
    if (!compania_id) {
      return res.json({
        result: false,
        message: "ID de compañía no proporcionado",
        data: [],
      });
    }
    // Eliminar campos no deseados
    delete data.created_at;
    delete data.deleted_at;
    delete data.updated_at;

    // Validar y transformar el campo 'estatus'
    if (data.estatus !== undefined) {
      data.estatus =
        data.estatus === "Activo" ||
        data.estatus === true ||
        data.estatus === "true"
          ? 1
          : 0;
    }
    data.ramo_id = data.ramo?.id;
    delete data.ramo;

    if (data.id) {
      // Actualizar si existe un ID
      const producto = await prisma.companiaProducto.findUnique({
        where: { id: data.id },
      });
      if (producto) {
        await prisma.companiaProducto.update({
          where: { id: data.id },
          data,
        });
        return res.json({
          result: true,
          message: "Registro actualizado con éxito",
        });
      } else {
        return res.json({
          result: false,
          message: "El producto no existe",
        });
      }
    } else {
      // Crear si no existe un ID
      await prisma.companiaProducto.create({ data });
      return res.json({
        result: true,
        message: "Registro creado con éxito",
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los productos: " + e.message,
    });
  }
};
