const { deleteById, getAllFrom } = require("./controller");
const { PrismaClient } = require("@prisma/client");
const { exportData } = require("./controller");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const {
  createTokenJWT,
  verifyEncryptedJWT,
} = require("../utils/encryptHelper"); // Importa tu helper
const tabla = "cliente";

/**
 * Obtener todos los registros de la tabla clientes.
 */

function segundosAHorasMinutosSegundos(segundos) {
  const hrs = Math.floor(segundos / 3600);
  const mins = Math.floor((segundos % 3600) / 60);
  const secs = segundos % 60;
  return {
    horas: hrs,
    minutos: mins,
    segundos: secs,
  };
}

exports.verificarToken = async (req, res) => {
  let params = req.body || {};
  let token = params.token || req.headers.authorization;
  if (!token) {
    return res.json({
      result: false,
      message: "Token no proporcionado",
    });
  }
  try {
    // Verifica y decodifica el token JWT
    const decoded = verifyEncryptedJWT(token);
    console.log("Token decodificado:", decoded);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000); // tiempo actual en segundos
      const segundosRestantes = decoded.exp - now;
      console.log("Segundos restantes de vida del token:", segundosRestantes); // Ejemplo de uso:
      const tiempoRestante = segundosAHorasMinutosSegundos(segundosRestantes);
      console.log(
        `Tiempo restante: ${tiempoRestante.horas}h ${tiempoRestante.minutos}m ${tiempoRestante.segundos}s`
      );
    }
    if (!decoded) {
      return res.json({
        result: false,
        message: "Token inválido",
      });
    }

    // Busca al usuario por ID
    let user = await prisma.usuarios.findUnique({
      where: { id: decoded.id },
      include: { tipo: true }, // Incluye el tipo de usuario
    });

    if (!user) {
      return res.json({
        result: false,
        message: "Usuario no encontrado",
      });
    }

    user = await exportData(user);
    return res.json({
      result: true,
      message: "Usuario verificado",
      data: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        tipo: user.tipo.label,
        tipo_id: user.tipo.id,
      },
    });
  } catch (error) {
    console.log("Error al verificar el token:", error.message);
    return res.json({
      result: false,
      message: "Error al verificar el token",
    });
  }
};
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
  const encryptedToken = createTokenJWT(
    {
      id: user.id,
      correo: user.correo,
      tipo: user.tipo.label,
      tipo_id: user.tipo.id,
    },
    "20s"
  );

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
