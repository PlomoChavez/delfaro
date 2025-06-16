const pool = require("./db");
require("dotenv").config();
const consoleEnv =
  process.env.CONSOLE === "true" || process.env.CONSOLE === "1";
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
const executeQuery = async (sql, params = [], console = false) => {
  try {
    const sqlRendered = renderSQL(sql, params);

    if (console) {
      console.log("SQL: ", sql);
      console.log("Params:", params);
      console.log("SQL Render:", sqlRendered);
      console.log("");
      console.log("");
    }

    const rows = await pool.query(sqlRendered);

    return rows;
  } catch (e) {
    console.error("Error ejecutando query:", e);
    throw e;
  }
};

module.exports = { executeQuery };
