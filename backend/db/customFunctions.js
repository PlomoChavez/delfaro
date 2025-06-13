const { findOne, getAllFrom, updateOne } = require("../db/functionsSQL");
const { sanitizeData } = require("../controllers/controller");

const findOneUser = async (filters = {}) => {
  return await findOne({
    table: "usuarios",
    filters,
    include: {
      tipo: {
        table: "tipos_de_usuarios",
        localKey: "tipo_id",
        foreignKey: "id",
      },
    },
  });
};

const getAllFromCustom = async (tabla, filtros = {}) => {
  try {
    let responseData = await getAllFrom(tabla, filtros);
    return {
      result: true,
      message: "Registros obtenidos correctamente",
      data: responseData,
    };
  } catch (error) {
    return {
      result: false,
      message: "Error al obtener los registros: " + error.message,
    };
  }
};

const updateCompania = async (data) => {
  data = await sanitizeData({ ...data });
  const id = Number(data.id);
  // Validar que el ID sea un número
  if (!id || isNaN(Number(id))) {
    return {
      result: false,
      message: "ID de compañía no válido",
    };
  }

  // Validar unicidad de RFC
  if (data.rfc) {
    const existeRFC = await findOne({
      table: "compania",
      filters: { rfc: data.rfc, not_id: Number(id) },
    });

    if (existeRFC) {
      return {
        result: false,
        message: "El RFC ya está en uso por otra compañía",
      };
    }
  }

  // Actualizar la compañía
  await updateOne({
    table: "compania",
    where: { id: Number(id) },
    data,
    include: {
      compania_representantes: {
        table: "compania_representantes",
        localKey: "id",
        foreignKey: "compania_id",
      },
    },
  });

  return {
    result: true,
    message: "Compañía actualizada con éxito",
  };
};

module.exports = { findOneUser, updateCompania, getAllFromCustom };
