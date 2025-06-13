const { findOne } = require("../db/functionsSQL");

const findOneUser = async (filters = {}) => {
  return await findOne({
    table: "usuarios",
    filters,
    include: {
      tipo: {
        table: "tipos_de_usuarios",
        localKey: "tipo_id",
        foreignKey: "id",
      },
    },
  });
};

module.exports = { findOneUser };
