const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAll = async (req, res, tabla) => {
  try {
    const datos = await prisma[tabla].findMany();
    res.json({
      result: true,
      message: "Registros obtenidos con éxito",
      data: datos,
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    });
  }
};

exports.createOrUpdate = async (req, res, tabla) => {
  try {
    let data = { ...req.body };

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

    if (data.id) {
      // Actualizar si existe un ID
      await prisma[tabla].update({
        where: { id: data.id },
        data,
      });
      res.json({
        result: true,
        message: "Registro actualizado con éxito",
        data,
      });
    } else {
      // Crear si no existe un ID
      const nuevo = await prisma[tabla].create({ data });
      res.json({
        result: true,
        message: "Registro creado con éxito",
        data: nuevo,
      });
    }
  } catch (e) {
    res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
      data: [],
    });
  }
};

exports.delete = async (req, res, tabla) => {
  try {
    const id = req.body.id;
    await prisma[tabla].delete({ where: { id } });
    res.json({
      result: true,
      message: "Registro eliminado con éxito",
      data: { id },
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al eliminar el registro: " + e.message,
      data: [],
    });
  }
};

exports.getDataByCatalogo = async (req, res, tabla, campo, valor) => {
  try {
    const datos = await prisma[tabla].findMany({
      where: { [campo]: valor },
    });
    res.json({
      result: true,
      message: "Registros filtrados obtenidos con éxito",
      data: datos,
    });
  } catch (e) {
    res.json({
      result: false,
      message: "Error al obtener los registros filtrados: " + e.message,
      data: [],
    });
  }
};
