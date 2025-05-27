const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { deleteById, getAllFrom } = require("./controller");
/**
 * Obtener todos los registros de la tabla clientes.
 */
exports.getAll = async (req, res) => {
  // Puedes recibir filtros por body o query
  const filtros = req.body || {};
  const result = await getAllFrom("cliente", filtros);
  return res.json(result);
};

/**
 * Eliminar un registro específico de la tabla clientes.
 */
exports.delete = async (req, res) => {
  const { id } = req.body;
  const result = await deleteById("cliente", id);
  return res.json(result);
};

/**
 * Crear o actualizar un registro en la tabla clientes.
 */
exports.createOrUpdate = async (req, res) => {
  try {
    const data = req.body;

    // Validación básica (puedes usar una librería como Joi para validaciones más robustas)
    if (!data.nombre || typeof data.nombre !== "string") {
      return res.json({ result: false, message: "El nombre es requerido" });
    }
    if (!data.rfc || typeof data.rfc !== "string") {
      return res.json({ result: false, message: "El RFC es requerido" });
    }
    if (!data.fechaNacimiento) {
      return res.json({
        result: false,
        message: "La fecha de nacimiento es requerida",
      });
    }

    // Validar unicidad de RFC
    const rfcExiste = await prisma.cliente.findFirst({
      where: {
        rfc: data.rfc,
        ...(data.id ? { NOT: { id: Number(data.id) } } : {}),
      },
    });
    if (rfcExiste) {
      return res.json({ result: false, message: "El RFC ya está registrado" });
    }

    // Si viene estado como objeto, extraer el id
    if (data.estado && data.estado.id) {
      data.estado_id = data.estado.id;
    }

    // Preparar datos para Prisma
    const clienteData = {
      nombre: data.nombre,
      rfc: data.rfc,
      fechaNacimiento: new Date(data.fechaNacimiento),
      direccion: data.direccion || null,
      colonia: data.colonia || null,
      codigoPostal: data.codigoPostal || null,
      estado_id: data.estado_id || null,
      ciudad: data.ciudad || null,
      correo: data.correo || null,
      telefono: data.telefono || null,
      celular: data.celular || null,
      oficina: data.oficina || null,
      casa: data.casa || null,
      observaciones: data.observaciones || null,
    };

    let cliente;
    if (data.id) {
      // Actualizar
      cliente = await prisma.cliente.update({
        where: { id: Number(data.id) },
        data: clienteData,
      });
      return res.json({
        result: true,
        message: "Registro actualizado con éxito",
        data: cliente,
      });
    } else {
      // Crear
      cliente = await prisma.cliente.create({ data: clienteData });
      return res.json({
        result: true,
        message: "Registro creado con éxito",
        data: cliente,
      });
    }
  } catch (e) {
    return res.json({
      result: false,
      message: "Error al crear o actualizar el registro: " + e.message,
      data: [],
    });
  }
};
