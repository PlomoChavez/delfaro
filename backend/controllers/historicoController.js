const { createOrUpdate, queryWithRelations } = require("../db/functionsSQL");

// Controlador
exports.createAccion = async (req, res) => {
  const result = await registrarAccion(req.body);

  res.json(result);
};

// Controlador
const registrarAccion = async (props) => {
  let { polizaID, poliza, accion } = props; // Datos del formulario

  try {
    if (!accion) {
      return {
        result: false,
        message: "El campo acción es obligatorio.",
      };
    }
    if (!polizaID && poliza) {
      let polizas = await queryWithRelations({
        modelo: "polizas",
        filtros: { numeroPoliza: poliza },
      });

      if (polizas.length == 1) {
        polizaID = polizas[0].id;
      } else {
        return {
          result: false,
          message: "No se encontró la póliza proporcionada.",
        };
      }
    }

    if (!polizaID) {
      return {
        result: false,
        message: "No se encontró la póliza proporcionada.",
      };
    }

    // Guardar la información en la base de datos
    const response = await createOrUpdate({
      estatusDefault: false,
      tabla: "poliza_historial",
      data: {
        poliza_id: polizaID,
        accion: accion,
      },
    });

    return {
      result: true,
      message: "Acción registrada con éxito.",
      data: response,
    };
  } catch (error) {
    return {
      result: false,
      message: "Error al procesar la acción. " + error.message,
    };
  }
};
