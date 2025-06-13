const pool = require("../db");

/**
 * Renderiza una consulta SQL para debug (no para ejecución).
 */
function renderSQL(sql, values) {
  return sql.replace(/\$(\d+)/g, (_, idx) => {
    const val = values[idx - 1];
    if (typeof val === "string") return `'${val}'`;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (val === null || val === undefined) return "NULL";
    return val;
  });
}

/**
 * Obtener todos los registros de una tabla usando SQL directo.
 */
const getAllFrom = async (modelo, filtros = {}, include = undefined) => {
  try {
    let whereClause = "";
    let params = [];

    if (filtros && Object.keys(filtros).length) {
      const conditions = Object.keys(filtros).map((key, idx) => {
        params.push(filtros[key]);
        return `\`${key}\` = $${idx + 1}`;
      });
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    // Soporte básico para include (JOIN simple)
    let joinClause = "";
    if (include && Array.isArray(include)) {
      include.forEach((rel) => {
        joinClause += ` LEFT JOIN \`${rel}\` ON \`${modelo}\`.\`${rel}_id\` = \`${rel}\`.\`id\``;
      });
    }

    const sql = `SELECT * FROM \`${modelo}\` ${joinClause} ${whereClause}`;
    const sqlRendered = renderSQL(sql, params);

    console.log("SQL Query:", sqlRendered, "Params:", params);

    const [rows] = await pool.query(sqlRendered, params);

    // Si tienes una función exportData, úsala aquí. Si no, puedes devolver rows directamente.
    // const data = await exports.exportData(rows);
    const data = rows;

    return data;
  } catch (e) {
    return [];
  }
};

module.exports = { getAllFrom };
