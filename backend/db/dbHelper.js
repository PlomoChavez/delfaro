/**
 * Sanitiza un objeto de datos según la configuración proporcionada.
 * - Elimina campos no deseados.
 * - Transforma el campo 'estatus' a booleano si corresponde.
 * - Convierte objetos anidados a sus IDs si se indica.
 *
 * @param {Object} data - Objeto de datos a sanitizar (modificado in-place).
 * @param {Object} config - Configuración opcional.
 * @returns {Object} El objeto de datos sanitizado.
 */
exports.sanitizeData = async (data, config = {}) => {
  const localConfig = {
    estatusDefault: true,
    keysHaEliminar: ["created_at", "deleted_at", "updated_at"],
    nestedToId: [],
    ...config,
  };

  // Elimina campos no deseados
  localConfig.keysHaEliminar.forEach((field) => {
    if (field in data) delete data[field];
  });

  // Transforma estatus a booleano si corresponde
  if (localConfig.estatusDefault && data.hasOwnProperty("estatus")) {
    data.estatus =
      data.estatus === "Activo" ||
      data.estatus === 1 ||
      data.estatus === "true" ||
      data.estatus === true
        ? true
        : false;
  }

  // Transforma campos anidados a sus IDs
  if (Array.isArray(localConfig.nestedToId)) {
    localConfig.nestedToId.forEach((field) => {
      if (
        data[field] &&
        typeof data[field] === "object" &&
        data[field].id !== undefined
      ) {
        data[`${field}_id`] = data[field].id;
        delete data[field];
      }
    });
  }

  return data;
};
