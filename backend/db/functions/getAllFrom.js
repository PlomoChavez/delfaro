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
const getAllFrom = async (modelo, filtros = {}, include = undefined) => {
  try {
    // 1. Construcción del WHERE y parámetros
    let whereClause = "";
    let params = [];
    if (filtros && Object.keys(filtros).length) {
      const conditions = Object.keys(filtros).map((key, idx) => {
        params.push(filtros[key]);
        return `\`${modelo}\`.\`${key}\` = $${idx + 1}`;
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
    // Esto permite construir el SELECT dinámicamente
    const [mainFieldsRows] = await executeQuery(
      `SHOW COLUMNS FROM \`${modelo}\``
    );
    const mainFields = mainFieldsRows.map((col) => col.Field);

    // 4. Preparar SELECT y JOINs
    // selectClause: lista de campos a seleccionar (con alias si es necesario)
    // joinClause: los LEFT JOINs necesarios para las relaciones
    let selectClause = mainFields.map(
      (field) => `\`${modelo}\`.\`${field}\` AS \`${field}\``
    );
    let joinClause = "";

    // 5. Para cada relación, agregar JOIN y los campos con prefijo o no según customName
    for (const rel of relaciones) {
      // Obtener los campos de la tabla relacionada
      const [relFieldsRows] = await executeQuery(
        `SHOW COLUMNS FROM \`${rel.tabla}\``
      );
      const relFields = relFieldsRows.map((col) => col.Field);

      // Guardar los campos en el objeto de relación para usarlos después
      rel._fields = relFields;

      relFields.forEach((field) => {
        let alias = field;
        if (rel.customName === true) {
          alias = `${rel.labelKey || rel.tabla}_${field}`;
        } else if (typeof rel.customName === "string") {
          alias = `${rel.customName}${field}`;
        }
        // Si customName === false, alias se queda igual (sin prefijo)
        selectClause.push(`\`${rel.tabla}\`.\`${field}\` AS \`${alias}\``);
      });

      joinClause += ` LEFT JOIN \`${rel.tabla}\` ON \`${modelo}\`.\`${rel.foreignKey}\` = \`${rel.tabla}\`.\`${rel.localKey}\``;
    }

    // 6. Construir y ejecutar el query final
    const sql = `SELECT ${selectClause.join(
      ", "
    )} FROM \`${modelo}\` ${joinClause} ${whereClause}`;
    const [rows] = await executeQuery(sql, params);

    // 7. Post-procesar para anidar los objetos relacionados si corresponde
    if (relaciones.length) {
      return rows.map((row) => {
        let newRow = {};
        // Copiar campos principales
        mainFields.forEach((field) => {
          newRow[field] = row[field];
        });
        // Procesar relaciones
        relaciones.forEach((rel) => {
          const relObj = {};
          // Determinar el prefijo real según customName
          let prefix = "";
          if (rel.customName === true) {
            prefix = (rel.labelKey || rel.tabla) + "_";
          } else if (typeof rel.customName === "string") {
            prefix = rel.customName;
          } // si es false, prefix = ""
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
        // Si no es integrado, los campos ya están en newRow por defecto
        return { ...newRow, ...row };
      });
    }

    // 8. Si no hay relaciones, devolver los registros tal cual
    return rows;
  } catch (e) {
    console.error("Error en getAllFrom:", e);
    return [];
  }
};

module.exports = { getAllFrom };
