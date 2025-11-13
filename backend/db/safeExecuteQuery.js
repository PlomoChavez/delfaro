const pool = require("./db");
require("dotenv").config();

const consoleEnv =
  process.env.CONSOLE === "true" || process.env.CONSOLE === "1";

/**
 * Renderiza una consulta SQL para debug (solo para fines de depuración).
 */
function renderSQL(sql, values) {
  return sql.replace(/\$(\d+)/g, (_, idx) => {
    const val = values[idx - 1];
    if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`; // Escapar comillas simples
    if (typeof val === "boolean") return val ? "true" : "false";
    if (val === null || val === undefined) return "NULL";
    return val;
  });
}

/**
 * Ejecuta una consulta SQL utilizando placeholders para evitar errores de sintaxis.
 */
const safeExecuteQuery = async (sql, params = [], logSQL = false) => {
  try {
    if (logSQL || consoleEnv) {
      const sqlRendered = renderSQL(sql, params);
      console.log("SQL (renderizado para depuración):", sqlRendered);
      console.log("Params:", params);
    }

    // Ejecutar la consulta con placeholders y parámetros
    const [rows] = await pool.query(sql, params);

    return rows;
  } catch (e) {
    console.error("Error ejecutando query:", e.message);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw e;
  }
};

module.exports = { safeExecuteQuery };
