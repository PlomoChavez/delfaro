const { safeExecuteQuery } = require("../safeExecuteQuery");

const queryWithRelations = async ({
  modelo,
  filtros = {},
  include = undefined,
  printSQL = false,
  fields = [],
  fieldsExclude = [],
  limit = undefined,
}) => {
  try {
    // 1. Obtener las columnas de la tabla
    const columnsRows = await safeExecuteQuery(
      `SHOW COLUMNS FROM \`${modelo}\``
    );
    const allFields = columnsRows.map((col) => col.Field);

    // Asegurar que los campos clave para las relaciones estén incluidos
    const requiredFields = include ? include.map((rel) => rel.localKey) : [];
    const selectedFields =
      Array.isArray(fields) && fields.length
        ? fields
        : allFields.filter(
            (field) =>
              !fieldsExclude.includes(field) || requiredFields.includes(field)
          );

    let sql = `SELECT ${selectedFields
      .map((field) => `\`${modelo}\`.\`${field}\``)
      .join(", ")} FROM \`${modelo}\``;

    const params = [];

    // 2. Construir la cláusula WHERE
    if (Object.keys(filtros).length) {
      const whereClauses = Object.keys(filtros).map((key) => {
        const value = filtros[key];

        if (key === "$or" && Array.isArray(value)) {
          // Manejar el operador $or
          const orClauses = value.map((condition) => {
            const [field, val] = Object.entries(condition)[0];
            params.push(val);
            return `\`${field}\` = ?`;
          });
          return `(${orClauses.join(" OR ")})`;
        } else if (value && typeof value === "object" && "$in" in value) {
          // Manejar el operador $in
          const placeholders = value.$in.map(() => "?").join(", ");
          params.push(...value.$in);
          return `\`${key}\` IN (${placeholders})`;
        } else {
          if (value === undefined || value === null) {
            throw new Error(
              `El filtro '${key}' tiene un valor inválido: ${value}`
            );
          }
          params.push(value);
          return `\`${key}\` = ?`;
        }
      });
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // 3. Agregar límite si está definido
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    if (printSQL) {
      console.log("Consulta principal generada:", sql);
      console.log("Parámetros de consulta principal:", params);
    }

    // 4. Ejecutar la consulta principal
    let rows = await safeExecuteQuery(sql, params);

    // 5. Consultar y agregar las relaciones
    if (include && include.length) {
      for (const rel of include) {
        if (!rel.tabla || !rel.foreignKey || !rel.localKey) {
          throw new Error(
            `La relación está mal definida. Asegúrate de incluir 'tabla', 'foreignKey' y 'localKey'.`
          );
        }

        const ids = rows
          .map((row) => row[rel.localKey])
          .filter((id) => id != null);
        if (ids.length === 0) {
          console.warn(`No se encontraron IDs para la relación ${rel.tabla}.`);
          continue;
        }

        const relFieldsRows = await safeExecuteQuery(
          `SHOW COLUMNS FROM \`${rel.tabla}\``
        );
        const relFields = relFieldsRows.map((col) => col.Field);

        // Seleccionar solo los campos especificados en `fields`, incluyendo siempre el foreignKey
        const selectedFields =
          Array.isArray(rel.fields) && rel.fields.length
            ? [...new Set([...rel.fields, rel.foreignKey])]
            : relFields;

        const placeholders = ids.map(() => "?").join(", ");
        const relSql = `SELECT ${selectedFields
          .map((field) => `\`${rel.tabla}\`.\`${field}\``)
          .join(", ")} FROM \`${rel.tabla}\` WHERE \`${
          rel.foreignKey
        }\` IN (${placeholders})`;

        if (printSQL) {
          console.log("Consulta de relación generada:", relSql);
          console.log("Parámetros de relación:", ids);
        }

        const relRows = await safeExecuteQuery(relSql, ids);

        const groupedRelRows = relRows.reduce((acc, relRow) => {
          const key = relRow[rel.foreignKey];
          if (!acc[key]) acc[key] = [];
          acc[key].push(relRow);
          return acc;
        }, {});

        rows.forEach((row) => {
          const key = row[rel.localKey];
          const relationData =
            rel.type === "many"
              ? groupedRelRows[key] || []
              : groupedRelRows[key]?.[0] || null;

          // Eliminar el foreignKey (id) del resultado de la relación
          if (relationData && rel.type !== "many") {
            delete relationData[rel.foreignKey];
          } else if (relationData && rel.type === "many") {
            relationData.forEach((item) => {
              delete item[rel.foreignKey];
            });
          }

          row[rel.labelKey || rel.tabla] = relationData;
        });
      }
    }

    // 6. Excluir los campos especificados en fieldsExclude del resultado final
    if (fieldsExclude && fieldsExclude.length) {
      rows = rows.map((row) => {
        fieldsExclude.forEach((field) => {
          delete row[field];
        });
        return row;
      });
    }

    return rows;
  } catch (e) {
    console.error("Error en queryWithRelations:", e);
    throw e;
  }
};

module.exports = { queryWithRelations };
