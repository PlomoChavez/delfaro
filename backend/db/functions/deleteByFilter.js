const pool = require("../db");

/**
 * Elimina un registro de cualquier tabla por filtro usando SQL directo.
 */
const deleteByFilter = async (modelo, filtro = {}) => {
  if (!filtro || Object.keys(filtro).length === 0) {
    return {
      result: false,
      message: "Filtro no proporcionado",
    };
  }
  try {
    // Buscar el registro primero
    let whereClause = "";
    let params = [];
    const conditions = Object.keys(filtro).map((key, idx) => {
      params.push(filtro[key]);
      return `"${key}" = $${idx + 1}`;
    });
    whereClause = `WHERE ${conditions.join(" AND ")}`;

    const selectSql = `SELECT * FROM "${modelo}" ${whereClause} LIMIT 1`;
    const { rows } = await pool.query(selectSql, params);

    if (!rows || rows.length === 0) {
      return {
        result: false,
        message: `${
          modelo.charAt(0).toUpperCase() + modelo.slice(1)
        } no encontrado`,
      };
    }

    const id = rows[0].id;
    await pool.query(`DELETE FROM "${modelo}" WHERE id = $1`, [id]);
    return {
      result: true,
      message: "Registro eliminado con éxito",
      data: { id },
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al eliminar el registro: " + e.message,
      data: [],
    };
  }
};

module.exports = { deleteByFilter };
