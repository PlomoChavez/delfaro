const pool = require("../db");

/**
 * Busca un registro en una tabla con filtros y JOIN opcional.
 * @param {string} table - Nombre de la tabla principal.
 * @param {Object} filters - Filtros en formato { campo: valor }.
 * @param {Object} [include] - Relaciones a incluir, ejemplo: { tipo: { table: 'tipo_usuario', localKey: 'tipo_id', foreignKey: 'id' } }
 * @returns {Promise<Object|null>}
 */
async function findOne({ table, filters = {}, include = {} }) {
  let whereClauses = [];
  let values = [];
  for (const [key, value] of Object.entries(filters)) {
    whereClauses.push(`${table}.${key} = ?`);
    values.push(value);
  }
  let joins = "";
  let selectFields = [`${table}.*`];

  // Soporta solo un include por ahora (puedes expandirlo)
  for (const [alias, rel] of Object.entries(include)) {
    joins += ` LEFT JOIN ${rel.table} ${alias} ON ${table}.${rel.localKey} = ${alias}.${rel.foreignKey}`;
    selectFields.push(
      `${alias}.id as ${alias}_id`,
      `${alias}.label as ${alias}_label`
    );
  }

  const sql = `
    SELECT ${selectFields.join(", ")}
    FROM ${table}
    ${joins}
    ${whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""}
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, values);
  if (rows.length === 0) return null;

  let row = rows[0];
  // Si hay include, anida el objeto relacionado
  for (const alias of Object.keys(include)) {
    row[alias] = {
      id: row[`${alias}_id`],
      label: row[`${alias}_label`],
    };
    delete row[`${alias}_id`];
    delete row[`${alias}_label`];
  }
  return row;
}

module.exports = { findOne };
