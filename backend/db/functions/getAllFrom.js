const pool = require("../db");
const { executeQuery } = require("../executeQuery");

/**
 * Obtiene todos los registros de una tabla usando SQL directo y permite incluir relaciones (JOINs) de manera dinámica.
 * Permite definir cómo se devuelven los campos de las tablas relacionadas: anidados como objeto o planos, y con prefijos personalizados.
 *
 * @param {string} modelo - Nombre de la tabla principal desde la que se obtendrán los registros.
 * @param {object} filtros - Objeto con los filtros a aplicar en el WHERE.
 * @param {Array} [include] - Arreglo de objetos que define las relaciones a incluir.
 * @returns {Promise<Array>} - Arreglo de objetos con los registros encontrados.
 */
const getAllFrom = async (
  modelo,
  filtros = {},
  include = undefined,
  printSQL = false
) => {
  try {
    // 1. Construcción del WHERE y parámetros mejorada
    let whereClause = "";
    let params = [];
    if (filtros && Object.keys(filtros).length) {
      const conditions = Object.keys(filtros).map((key, idx) => {
        let field = key;
        let op = "=";
        let value = filtros[key];

        // Soporte para _not
        if (key.endsWith("_not")) {
          field = key.replace(/_not$/, "");
          op = "!=";
        }

        // Si el valor es array, usar IN o NOT IN
        if (Array.isArray(value)) {
          if (key.endsWith("_not")) {
            op = "NOT IN";
          } else {
            op = "IN";
          }
          params.push(...value);
          const placeholders = value
            .map((_, i) => `$${params.length - value.length + i + 1}`)
            .join(", ");
          return `\`${modelo}\`.\`${field}\` ${op} (${placeholders})`;
        } else {
          params.push(value);
          return `\`${modelo}\`.\`${field}\` ${op} $${params.length}`;
        }
      });
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

    // 2. Procesar include: asegurar que cada relación tenga 'tipo', 'integrado' y 'customName'
    let relaciones = [];
    if (include && Array.isArray(include)) {
      relaciones = include.map((rel) => ({
        ...rel,
        tipo: rel.tipo ? rel.tipo : "one",
        integrado: rel.integrado !== undefined ? rel.integrado : true,
        customName: rel.customName !== undefined ? rel.customName : true,
      }));
    }

    // 3. Obtener los campos de la tabla principal
    const [mainFieldsRows] = await executeQuery(
      `SHOW COLUMNS FROM \`${modelo}\``
    );
    const mainFields = mainFieldsRows.map((col) => col.Field);

    // 4. Preparar SELECT y JOINs
    let selectClause = mainFields.map(
      (field) => `\`${modelo}\`.\`${field}\` AS \`${field}\``
    );
    let joinClause = "";

    // 5. Para cada relación, agregar JOIN y los campos con prefijo o no según customName
    for (const rel of relaciones) {
      const [relFieldsRows] = await executeQuery(
        `SHOW COLUMNS FROM \`${rel.tabla}\``
      );
      const relFields = relFieldsRows.map((col) => col.Field);

      rel._fields = relFields;

      relFields.forEach((field) => {
        let alias = field;
        if (rel.customName === true) {
          alias = `${rel.labelKey || rel.tabla}_${field}`;
        } else if (typeof rel.customName === "string") {
          alias = `${rel.customName}${field}`;
        }
        selectClause.push(`\`${rel.tabla}\`.\`${field}\` AS \`${alias}\``);
      });

      joinClause += ` LEFT JOIN \`${rel.tabla}\` ON \`${modelo}\`.\`${rel.foreignKey}\` = \`${rel.tabla}\`.\`${rel.localKey}\``;
    }

    // 6. Construir y ejecutar el query final
    const sql = `SELECT ${selectClause.join(
      ", "
    )} FROM \`${modelo}\` ${joinClause} ${whereClause}`;
    const [rows] = await executeQuery(sql, params, printSQL);

    // 7. Post-procesar para anidar los objetos relacionados si corresponde
    if (relaciones.length) {
      return rows.map((row) => {
        let newRow = {};
        mainFields.forEach((field) => {
          newRow[field] = row[field];
        });
        relaciones.forEach((rel) => {
          const relObj = {};
          let prefix = "";
          if (rel.customName === true) {
            prefix = (rel.labelKey || rel.tabla) + "_";
          } else if (typeof rel.customName === "string") {
            prefix = rel.customName;
          }
          let tieneAlgunValor = false;
          Object.keys(row).forEach((key) => {
            if (prefix && key.startsWith(prefix)) {
              relObj[key.replace(prefix, "")] = row[key];
              if (row[key] !== null) tieneAlgunValor = true;
              if (rel.integrado !== false) delete row[key];
            } else if (!prefix && rel._fields.includes(key)) {
              relObj[key] = row[key];
              if (row[key] !== null) tieneAlgunValor = true;
              if (rel.integrado !== false) delete row[key];
            }
          });
          if (rel.integrado !== false) {
            newRow[rel.labelKey || rel.tabla] = tieneAlgunValor ? relObj : null;
          }
        });
        return { ...newRow, ...row };
      });
    }

    return rows;
  } catch (e) {
    console.error("Error en getAllFrom:", e);
    return [];
  }
};

module.exports = { getAllFrom };
