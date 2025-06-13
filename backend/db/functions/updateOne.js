const pool = require("../db");

/**
 * Actualiza un registro en una tabla y puede incluir relaciones en el resultado.
 * @param {string} table - Nombre de la tabla principal.
 * @param {Object} where - Filtros para el WHERE, ejemplo: { id: 1 }
 * @param {Object} data - Campos a actualizar, ejemplo: { nombre: "Nuevo" }
 * @param {Object} [include] - Relaciones a incluir, ejemplo: { representantes: { table: 'compania_representantes', localKey: 'id', foreignKey: 'compania_id' } }
 * @returns {Promise<Object|null>}
 */
async function updateOne({ table, where = {}, data = {}, include = {} }) {
  // Construir SET
  const setClauses = [];
  const setValues = [];
  for (const [key, value] of Object.entries(data)) {
    if (key != "id") {
      setClauses.push(`${key} = ?`);
      setValues.push(value);
    }
  }

  // Construir WHERE (agregando el nombre de la tabla)
  const whereClauses = [];
  const whereValues = [];
  for (const [key, value] of Object.entries(where)) {
    whereClauses.push(`${table}.${key} = ?`);
    whereValues.push(value);
  }

  // Ejecutar UPDATE
  const sqlUpdate = `
    UPDATE ${table}
    SET ${setClauses.join(", ")}
    WHERE ${whereClauses.join(" AND ")}
  `;
  await pool.query(sqlUpdate, [...setValues, ...whereValues]);

  // Consultar el registro actualizado (con include si aplica)
  let selectFields = [`${table}.*`];
  let joins = "";

  for (const [alias, rel] of Object.entries(include)) {
    joins += ` LEFT JOIN ${rel.table} ${alias} ON ${table}.${rel.localKey} = ${alias}.${rel.foreignKey}`;
    selectFields.push(`${alias}.*`);
  }

  const sqlSelect = `
    SELECT ${selectFields.join(", ")}
    FROM ${table}
    ${joins}
    WHERE ${whereClauses.join(" AND ")}
    LIMIT 1
  `;
  const [rows] = await pool.query(sqlSelect, whereValues);
  return rows[0] || null;
}

module.exports = { updateOne };
