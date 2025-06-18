const pool = require("../db");
const { sanitizeData } = require("../dbHelper");
const { executeQuery } = require("../executeQuery");

/**
 * Crea o actualiza un registro en la tabla indicada.
 * Si se pasa el parámetro unique, verifica que no exista un registro con esos valores antes de insertar.
 * @param {string} tabla - Nombre de la tabla
 * @param {object} data - Datos a insertar o actualizar
 * @param {boolean} [estatusDefault=true] - Valor por defecto para estatus
 * @param {object} [unique] - Filtro para verificar unicidad antes de insertar (solo en create)
 */
const createOrUpdate = async (params = {}) => {
  try {
    const paramsDefault = {
      tabla: "",
      data: [],
      estatusDefault: true,
      unique: undefined,
      returnResponse: false,
    };

    let { tabla, data, estatusDefault, unique, returnResponse } = {
      ...paramsDefault,
      ...params,
    };

    data = await sanitizeData(data, { estatusDefault });

    let sql, values, message;

    if (data.id) {
      // UPDATE
      const id = data.id;
      const fields = Object.keys(data).filter((key) => key !== "id");
      values = fields.map((key) => data[key]);
      const setClause = fields
        .map((key, idx) => `\`${key}\` = $${idx + 1}`)
        .join(", ");
      sql = `UPDATE \`${tabla}\` SET ${setClause} WHERE \`id\` = ${id}`;
      message = "Registro actualizado con éxito";
    } else {
      // INSERT
      // 1. Verificar unicidad si se pasa unique
      if (unique && typeof unique === "object" && Object.keys(unique).length) {
        const uniqueFields = Object.keys(unique);
        const uniqueValues = uniqueFields.map((key) => unique[key]);
        const whereClause = uniqueFields
          .map((key, idx) => `\`${key}\` = $${idx + 1}`)
          .join(" AND ");
        const checkSql = `SELECT COUNT(*) as count FROM \`${tabla}\` WHERE ${whereClause}`;
        const [rows] = await executeQuery(checkSql, uniqueValues);
        if (rows[0]?.count > 0) {
          return {
            result: false,
            message:
              "Ya existe un registro con los valores únicos especificados.",
          };
        }
      }

      // 2. Insertar normalmente
      const fields = Object.keys(data);
      values = fields.map((key) => data[key]);
      const columns = fields.map((key) => `\`${key}\``).join(", ");
      const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");
      sql = `INSERT INTO \`${tabla}\` (${columns}) VALUES (${placeholders})`;
      message = "Registro creado con éxito";
    }

    const dataQuery = await executeQuery(sql, values);

    let response = {
      result: true,
      message,
    };

    if (returnResponse) {
      let registro;
      if (data.id) {
        // UPDATE: buscar el registro actualizado por ID
        const selectSql = `SELECT * FROM \`${tabla}\` WHERE \`id\` = $1`;
        const [rows] = await executeQuery(selectSql, [data.id]);
        registro = rows && rows.length ? rows[0] : null;
      } else {
        // INSERT: obtener el último insertado (asumiendo autoincrement y que el pool retorna insertId)
        const lastId =
          dataQuery.insertId || (dataQuery[0] && dataQuery[0].insertId);
        if (lastId) {
          const selectSql = `SELECT * FROM \`${tabla}\` WHERE \`id\` = $1`;
          const [rows] = await executeQuery(selectSql, [lastId]);
          registro = rows && rows.length ? rows[0] : null;
        } else if (
          unique &&
          typeof unique === "object" &&
          Object.keys(unique).length
        ) {
          const uniqueFields = Object.keys(unique);
          const uniqueValues = uniqueFields.map((key) => unique[key]);
          const whereClause = uniqueFields
            .map((key, idx) => `\`${key}\` = $${idx + 1}`)
            .join(" AND ");
          const selectSql = `SELECT * FROM \`${tabla}\` WHERE ${whereClause}`;
          const [rows] = await executeQuery(selectSql, uniqueValues);
          registro = rows && rows.length ? rows[0] : null;
        }
      }

      if (typeof returnResponse === "string") {
        response.data = registro ? registro[returnResponse] : null;
      } else if (Array.isArray(returnResponse)) {
        response.data = registro
          ? Object.fromEntries(
              returnResponse.map((prop) => [prop, registro[prop]])
            )
          : null;
      } else if (returnResponse === true) {
        response.data = registro;
      }
    }

    return response;
  } catch (e) {
    return {
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
    };
  }
};

module.exports = { createOrUpdate };
