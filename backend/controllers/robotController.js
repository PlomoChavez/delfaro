// const { ejecutarCotizacion } = require("../bots/pruebas");
const { ejecutarCotizacion } = require("../bots/planSeguroCotizacion");
const CotizadorAutosAXA = require("../bots/cotizadorAutosAXA");
const CotizadorAutosHDI = require("../bots/cotizadorAutosHDI");
const CotizadorAutosQualitas = require("../bots/qualitas/cotizadorAutosQualitas");

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
    let data = req.body.data || {}; // Obtener los datos del cuerpo de la solicitud

    data.bot = bot;
    resultado = await exports.handleEstimarCotizaciones(data);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleEstimarCotizaciones = async (data) => {
  console.log("handleEstimarCotizaciones", data);
  let resultado = null;
  let bot = data.bot || null; // Nombre del bot a ejecutar
  if (bot == null) {
    if (data.ramo == "AUTOS") {
      if (data.compania == "QUALITAS") {
        bot = "cotizadorAutosQualitas";
      }
    }
  }

  console.log("Bot a ejecutar:", bot);

  switch (bot) {
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

    case "cotizadorAutosQualitas":
      // resultado = await CotizadorAutosQualitas.ejecutarCotizacionAutos(data);
      resultado = {
        numeroCotizacion: "0988013582",
        detalles: {
          numeroCotizacion: "0988013582",
          primerPago: "$44,209.76",
          pagoSubsecuente: "-",
          primaNeta: "$38,236.59",
          tasaFin: "$-764.73",
          expedicionPoliza: "$640",
          iVA: "$6,097.90",
          subtotal: "$38,111.86",
          direcciones: [
            {
              value: "FRONTERA, ACAPULCO DE JUAREZ, GUERRERO, CP 39600",
              id: "ui-id-14",
            },
            {
              value:
                "CUAUHTEMOC INFONAVIT, ACAPULCO DE JUAREZ, GUERRERO, CP 39600",
              id: "ui-id-15",
            },
            {
              value:
                "LA LAJA PARTE ALTA, ACAPULCO DE JUAREZ, GUERRERO, CP 39600",
              id: "ui-id-16",
            },
            {
              value: "LA LAJA, ACAPULCO DE JUAREZ, GUERRERO, CP 39600",
              id: "ui-id-17",
            },
          ],
          versiones: [
            {
              value: "",
              label: "",
              selected: false,
            },
            {
              value: "219",
              label: "TOURING 5P L4 BA MP3 USB AC AUT 5 OCUP",
              selected: true,
            },
            {
              value: "23538",
              label: "TURBO 5P L4 1.5T ABS BA AC AUT 5 OCUP",
              selected: false,
            },
            {
              value: "409",
              label: "TURBO PLUS 5P L4 1.5L ABS BA AC R18 CAM TRAS CVT 5 OCU",
              selected: false,
            },
            {
              value: "8159",
              label: "EX 5P L4 2.4L BA MP3 USB AC R17 AUT 5 OCUP",
              selected: false,
            },
          ],
        },
        archivo:
          "http://localhost:3000/files/cotizaciones/qualitas/cotizacion_0988013582.pdf",
      };
      break;

    default:
      resultado = "Bot no encontrado, " + compania;
  }

  return resultado;
};
