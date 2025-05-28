const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function replacerBigInt(key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}

exports.exportData = async (data) => {
  return JSON.parse(JSON.stringify(data, replacerBigInt));
};

/**
 * Elimina un registro de cualquier tabla por ID.
 * @param {string} modelo - Nombre del modelo Prisma (ej: 'cliente')
 * @param {number|string} id - ID del registro a eliminar
 * @returns {Promise<{result: boolean, message: string, data?: any}>}
 */
exports.deleteById = async (modelo, id) => {
  if (!id) {
    return {
      result: false,
      message: "ID no proporcionado",
    };
  }
  try {
    const registro = await prisma[modelo].findUnique({
      where: { id: Number(id) },
    });
    if (!registro) {
      return {
        result: false,
        message: `${
          modelo.charAt(0).toUpperCase() + modelo.slice(1)
        } no encontrado`,
      };
    }
    await prisma[modelo].delete({ where: { id: Number(id) } });
    return {
      result: true,
      message: "Registro eliminado con éxito",
      data: { id },
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al eliminar el registro: " + e.message,
      data: [],
    };
  }
};

/**
 * Obtener todos los registros de una tabla.
 * @param {string} modelo - Nombre del modelo Prisma (ej: 'cliente')
 * @returns {Promise<{result: boolean, message: string, data: any[]}>}
 */
exports.getAllFrom = async (modelo, filtros = {}, include = undefined) => {
  try {
    const query = {
      where: Object.keys(filtros).length ? filtros : undefined,
    };

    if (include) {
      query.include = include;
    }

    let registros = await prisma[modelo].findMany(query);

    registros = await exports.exportData(registros);

    return {
      result: true,
      message: "Registros obtenidos con éxito",
      data: registros,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    };
  }
};

/**
 * Elimina un registro de cualquier tabla por filtro.
 * @param {string} modelo - Nombre del modelo Prisma (ej: 'companiaRepresentante')
 * @param {object} filtro - Objeto con los campos a filtrar (ej: { correo: "correo@ejemplo.com" })
 * @returns {Promise<{result: boolean, message: string, data?: any}>}
 */
exports.deleteByFilter = async (modelo, filtro = {}) => {
  if (!filtro || Object.keys(filtro).length === 0) {
    return {
      result: false,
      message: "Filtro no proporcionado",
    };
  }
  try {
    const registro = await prisma[modelo].findFirst({
      where: filtro,
    });
    if (!registro) {
      return {
        result: false,
        message: `${
          modelo.charAt(0).toUpperCase() + modelo.slice(1)
        } no encontrado`,
      };
    }
    await prisma[modelo].delete({
      where: { id: registro.id },
    });
    return {
      result: true,
      message: "Registro eliminado con éxito",
      data: { id: registro.id },
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al eliminar el registro: " + e.message,
      data: [],
    };
  }
};

exports.sanitizeData = async (data, config = {}) => {
  let localConfig = {
    estatusDefault: true,
    keysHaEliminar: ["created_at", "deleted_at", "updated_at"],
    ...config,
  };

  [
    // Elimina campos no deseados
    localConfig.keysHaEliminar,
  ].forEach((field) => delete data[field]);

  // Transforma estatus
  if (localConfig.estatusDefault) {
    if (data.estatus !== undefined) {
      data.estatus =
        data.estatus === "Activo" ||
        data.estatus === true ||
        data.estatus === "true"
          ? 1
          : 0;
    }
  }

  // Transforma campos anidados a sus IDs
  if (localConfig.nestedToId) {
    localConfig.nestedToId.forEach((field) => {
      if (data[field] && data[field].id) {
        data[`${field}_id`] = data[field].id;
        delete data[field];
      }
    });
  }

  return data;
};
