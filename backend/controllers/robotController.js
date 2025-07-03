// const { ejecutarCotizacion } = require("../bots/pruebas");
const { ejecutarCotizacion } = require("../bots/planSeguroCotizacion");
const CotizadorAutosAXA = require("../bots/CotizadorAutosAXA");
const CotizadorAutosHDI = require("../bots/CotizadorAutosHDI");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.demoRobots = async (req, res) => {
  try {
    let bot = req.body.bot || null; // Nombre del bot a ejecutar
    if (!bot) {
      return res.status(200).json({ error: "Falto el nombre del bot" });
    }
    let resultado = null; // Variable para almacenar el resultado de la ejecución del bot
    let data = req.body.data || null; // Obtener los datos del cuerpo de la solicitud
    switch (bot) {
      case "planSeguroCotizacion":
        resultado = await ejecutarCotizacion(data);
        break;
      case "cotizadorAutosAXA":
        resultado = await CotizadorAutosAXA.ejecutarCotizacion(data);
        break;
      case "cotizadorAutosHDI":
        resultado = await CotizadorAutosHDI.ejecutarCotizacionAutos(data);
        break;

      default:
        return res.status(200).json({ error: "Bot no reconocido" });
    }

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
