const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient().$extends({
  result: {
    $allModels: {
      $allFields: {
        needs: {},
        compute(value) {
          // Si es BigInt, lo convierte a string
          if (typeof value === "bigint") {
            return value.toString();
          }
          return value;
        },
      },
    },
  },
});

module.exports = prisma;
