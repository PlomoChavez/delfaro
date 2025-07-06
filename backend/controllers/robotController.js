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

    data.bot = bot;
    console.log("Datos recibidos:", data);
    resultado = await exports.handleEstimarCotizaciones(data);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleEstimarCotizaciones = async (data) => {
  let resultado = null;
  let compania = data?.cotizacion?.nombreCorto ?? data.bot;

  console.log("data: ", data);
  switch (compania) {
    case "planSeguroCotizacion":
      resultado = await ejecutarCotizacion(data);
      break;
    case "cotizadorAutosAXA":
    case "AXA":
      resultado = await CotizadorAutosAXA.ejecutarCotizacion(data);
      break;
    case "cotizadorAutosHDI":
    case "HDI":
      resultado = await CotizadorAutosHDI.ejecutarCotizacionAutos(data);
      break;
    default:
      resultado = "Bot no encontrado, " + compania;
  }
  return resultado;
};
