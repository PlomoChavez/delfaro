const pool = require("../db");

/**
 * Elimina un registro de cualquier tabla por ID usando SQL puro.
 */
const deleteById = async (modelo, id) => {
  if (!id) {
    return {
      result: false,
      message: "ID no proporcionado",
    };
  }
  try {
    const { rows } = await pool.query(
      `SELECT * FROM "${modelo}" WHERE id = $1 LIMIT 1`,
      [Number(id)]
    );
    if (!rows || rows.length === 0) {
      return {
        result: false,
        message: `${
          modelo.charAt(0).toUpperCase() + modelo.slice(1)
        } no encontrado`,
      };
    }
    await pool.query(`DELETE FROM "${modelo}" WHERE id = $1`, [Number(id)]);
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

module.exports = { deleteById };
