const pool = require("../db");

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
        return `"${key}" = $${idx + 1}`;
      });
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    // Soporte básico para include (JOIN simple)
    let joinClause = "";
    if (include && Array.isArray(include)) {
      include.forEach((rel) => {
        joinClause += ` LEFT JOIN "${rel}" ON "${modelo}"."${rel}_id" = "${rel}"."id"`;
      });
    }

    const sql = `SELECT * FROM "${modelo}" ${joinClause} ${whereClause}`;
    console.log("SQL Query:");
    console.log(sql);
    console.log("Params:");
    console.log(params);
    const { rows } = await pool.query(sql, params);
    console.log("Rows obtained:", rows.length);
    console.log(rows);

    // Si tienes una función exportData, úsala aquí. Si no, puedes devolver rows directamente.
    // const data = await exports.exportData(rows);
    const data = rows;

    return {
      result: true,
      message: "Registros obtenidos con éxito (SQL)",
      data,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al obtener los registros: " + e.message,
      data: [],
    };
  }
};

module.exports = { getAllFrom };
