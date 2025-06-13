const pool = require("../db");
const { sanitizeData } = require("../dbHelper");

function renderSQL(sql, values) {
  return sql.replace(/\$(\d+)/g, (_, idx) => {
    const val = values[idx - 1];
    if (typeof val === "string") return `'${val}'`;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (val === null || val === undefined) return "NULL";
    return val;
  });
}

const createOrUpdate = async (tabla, data, estatusDefault = true) => {
  try {
    data = await sanitizeData(data, { estatusDefault });

    let sql, values, message;

    if (data.id) {
      // UPDATE
      const id = data.id;

      const fields = Object.keys(data).filter((key) => key !== "id");

      values = fields.map((key) => data[key]);

      const setClause = fields
        .map((key, idx) => `\`${key}\` = $${idx + 1}`)
        .join(", ");

      sql = `UPDATE \`${tabla}\` SET ${setClause} WHERE \`id\` = ${id}`;
      message = "Registro actualizado con éxito";
    } else {
      // INSERT
      const fields = Object.keys(data);

      values = fields.map((key, idx) => data[key]);

      const columns = fields.map((key) => `\`${key}\``).join(", ");

      const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ");

      sql = `INSERT INTO \`${tabla}\` (${columns}) VALUES (${placeholders})`;

      message = "Registro creado con éxito";
    }

    const sqlRendered = renderSQL(sql, values);

    await pool.query(sqlRendered, values);

    return {
      result: true,
      message,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
    };
  }
};

module.exports = { createOrUpdate };
