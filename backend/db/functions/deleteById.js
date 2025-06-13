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
    x;
  }
  try {
    const sql = `SELECT * FROM ${modelo} WHERE id = ${Number(id)} LIMIT 1`;
    const [rows] = await pool.query(sql);

    if (!rows || rows.length === 0) {
      return {
        result: false,
        message: `${
          modelo.charAt(0).toUpperCase() + modelo.slice(1)
        } no encontrado`,
      };
    }

    await pool.query(`DELETE FROM ${modelo} WHERE id = ${Number(id)}`);
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
