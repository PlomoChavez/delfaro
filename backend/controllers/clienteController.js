const { getAllFromCustom } = require("../db/customFunctions");
const {
  findOne,
  queryWithRelations,
  getAllFrom,
  deleteById,
  createOrUpdate,
} = require("../db/functionsSQL");
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  let datos = await getAllFromCustom("clientes");
  res.json(datos);
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.delete = async (req, res) => {
  const { id } = req.body;
  const result = await deleteById("clientes", id);
  return res.json(result);
};

/**
 * Crear o actualizar un registro en la tabla clientes.
 */
exports.createOrUpdate = async (req, res) => {
  try {
    const data = req.body;

    // Validación básica (puedes usar una librería como Joi para validaciones más robustas)
    if (!data.nombre || typeof data.nombre !== "string") {
      return res.json({ result: false, message: "El nombre es requerido" });
    }
    if (!data.rfc || typeof data.rfc !== "string") {
      return res.json({ result: false, message: "El RFC es requerido" });
    }
    if (!data.fechaNacimiento) {
      return res.json({
        result: false,
        message: "La fecha de nacimiento es requerida",
      });
    }

    let id = data.id ? Number(data.id) : null;
    // Validar unicidad de RFC y CURP excluyendo el id actual (si existe)
    const filtroRFC = { rfc: data.rfc };
    const filtroCURP = { curp: data.curp };

    if (id) {
      filtroRFC.id = { $ne: Number(data.id) }; // Si usas MongoDB
      filtroCURP.id = { $ne: Number(data.id) };
      // Si usas SQL/Prisma, puedes hacer la exclusión en el filtro
    }

    const resultadoRFC = await getAllFrom("clientes", filtroRFC);
    const resultadoCURP = await getAllFrom("clientes", filtroCURP);

    const existe = resultadoRFC.length > 0 || resultadoCURP.length > 0;

    if (existe) {
      return res.json({
        result: false,
        message: "El RFC o la curp ya está registrado",
      });
    }

    if (id) {
      delete data.id;
    }

    /* prettier-ignore */
    let cliente = {
      nombre: data.nombre + " " + (data.segundoNombre || "") + " " + (data.apellidoPaterno || "") + " " + (data.apellidoMaterno || ""),
      rfc: data.rfc,
      curp: data.curp,
      data: { ...data },
    };

    cliente.id = id;
    cliente.isCliente = data.isCliente ? 1 : 0;
    cliente.data = JSON.stringify(cliente.data || {});

    const response = await createOrUpdate({
      tabla: "clientes",
      estatusDefault: false,
      data: { ...cliente },
      returnResponse: true,
    });

    return res.json(response);
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los productos: " + e.message,
    });
  }
};
/**
 * Crear o actualizar un registro en la tabla clientes.
 */
exports.search = async (req, res) => {
  try {
    const data = req.body;

    // Validación básica (puedes usar una librería como Joi para validaciones más robustas)
    if (!data.referencia || typeof data.referencia !== "string") {
      return res.json({ result: false, message: "La referencia es requerida" });
    }
    if (!data.isCliente || typeof data.isCliente !== "boolean") {
      return res.json({
        result: false,
        message: "El estado de cliente es requerido",
      });
    }
    const filtro = {
      $or: [
        { rfc: data.referencia },
        { curp: data.referencia },
        { nombre: data.referencia },
      ],
      isCliente: data.isCliente ? 1 : 0,
    };

    const rows = await queryWithRelations({
      modelo: "clientes",
      filtros: {
        $or: [
          { rfc: data.referencia },
          { curp: data.referencia },
          { nombre: data.referencia },
        ],
        isCliente: data.isCliente ? 1 : 0,
      },
    });

    return res.json({
      result: true,
      data: rows,
      message: "Consulta exitosa",
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al actualizar los productos: " + e.message,
    });
  }
};
