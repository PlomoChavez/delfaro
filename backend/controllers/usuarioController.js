const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function replacerBigInt(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany();
    // Convierte BigInt a string antes de enviar
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(usuarios, replacerBigInt));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
