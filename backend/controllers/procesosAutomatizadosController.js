// const { ejecutarCotizacion } = require("../bots/pruebas");
const { ejecutarCotizacion } = require("../bots/planSeguroCotizacion");
const { handleEstimarCotizaciones } = require("../controllers/robotController");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.estimarCotizaciones = async (req, res) => {
  try {
    let data = req.body; // Obtener los datos del cuerpo de la solicitud
    let bot = data.bot || null; // Nombre del bot a ejecutar
    const resultado = [];

    const cotizaciones = data.configuracion.cotizaciones || [];

    await Promise.all(
      cotizaciones.map(async (cotizacion, idx) => {
        //pretty-ignore
        if (bot) {
          cotizacion = { bot: data.bot, ...cotizacion };
        }

        await delay(idx * 5000);

        const detalle = await handleEstimarCotizaciones(cotizacion);

        resultado.push({
          ...cotizacion,
          ...detalle,
        });
      })
    );

    res.json({
      result: true,
      message: "Cotizaciones estimadas con éxito",
      data: resultado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
