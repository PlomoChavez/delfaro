const { deleteById, getAllFrom } = require("./controller");
const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const { createTokenJWT } = require("../utils/encryptHelper"); // Importa tu helper
const tabla = "cliente";

/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.login = async (req, res) => {
  let params = req.body || {};

  if (!params.email || !params.password) {
    return res.json({
      result: false,
      message: "Correo y contraseña son requeridos",
    });
  }

  let user = await prisma.usuarios.findFirst({
    where: {
      correo: params.email,
      estatus: true, // Solo usuarios activos
    },
    include: {
      tipo: true, // Incluye el tipo de usuario
    },
  });

  if (!user) {
    return res.json({
      result: false,
      message: "Usuario no encontrado o inactivo",
    });
  }

  user = await exportData(user);
  // Aquí deberías validar la contraseña con bcrypt.compare(params.password, user.password)
  const passwordValida = await bcrypt.compare(params.password, user.password);
  if (!passwordValida) {
    return res.json({
      result: false,
      message: "Usuario o contraseña incorrectos",
    });
  }

  // Genera y cifra el token JWT
  const encryptedToken = createTokenJWT({
    id: user.id,
    correo: user.correo,
    tipo: user.tipo.label,
    tipo_id: user.tipo.id,
  });

  return res.json({
    result: true,
    message: "Usuario encontrado",
    data: {
      userData: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        tipo: user.tipo.label,
        tipo_id: user.tipo.id,
      },
      token: encryptedToken, // Devuelve el token cifrado
    },
  });
};
