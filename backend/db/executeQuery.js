const pool = require("./db");
require("dotenv").config();
const consoleEnv =
  process.env.CONSOLE === "true" || process.env.CONSOLE === "1";

/**
 * Renderiza una consulta SQL para debug (no para ejecución).
 */
function renderSQL(sql, values) {
  return sql.replace(/\?/g, (_, idx) => {
    const val = values[idx];
    if (typeof val === "string") return `'${val}'`;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (val === null || val === undefined) return "NULL";
    return val;
  });
}

const executeQuery = async (sql, params = [], printSQL = false) => {
  try {
    if (printSQL) {
      const sqlRendered = renderSQL(sql, params);
      console.log("");
      console.log("SQL: ", sql);
      console.log("Params:", params);
      console.log("SQL Render:", sqlRendered);
      console.log("");
    }

    // Ejecutar la consulta directamente con parámetros
    const [rows] = await pool.query(sql, params);

    return rows;
  } catch (e) {
    console.log("Error ejecutando query:", e);
    throw e;
  }
};

module.exports = { executeQuery };
