// const { ejecutarCotizacion } = require("../bots/pruebas");
const { ejecutarCotizacion } = require("../bots/planSeguroCotizacion");
const { handleEstimarCotizaciones } = require("../controllers/robotController");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

exports.obtenerTituloGoogle = async (req, res) => {
  try {
    // let data = {
    //   cotizacion1: {
    //     compania: {},
    //     configuracion: {
    //       titular: {
    //         nombre: "Jesus ramon",
    //         sexo: {
    //           label: "Hombre",
    //           id: "Hombre",
    //         },
    //         fechaNacimiento: "1994-05-02",
    //         localidad: {
    //           label: "Aguascalientes",
    //           id: 1,
    //         },
    //       },
    //       personas: [],
    //       inicio: "03/05/2025",
    //       fin: "03/05/2026",
    //       plan: {
    //         label: "Plan Seguro Óptimo Plus",
    //       },
    //       parametrosFlexibles: {
    //         sumaAsegurada: {
    //           label: " 3000 UMAM ",
    //           id: " 3000 UMAM ",
    //         },
    //         topeMaximo: {
    //           label: "$40,000",
    //           id: "$40,000",
    //         },
    //         deducible: {
    //           label: " 7 UMAM",
    //           id: "7 UMAM",
    //         },
    //         nivelHospitalario: {
    //           label: "Serie 300",
    //           id: "Serie 300",
    //         },
    //         frecuenciaPago: {
    //           label: "Trimestral",
    //           id: "Trimestral",
    //         },
    //         coaseguro: {
    //           label: "0%",
    //           id: "0%",
    //         },
    //         thq: {
    //           label: "36",
    //           id: "36",
    //         },
    //       },
    //       proteccionAdicional: {
    //         emergenciaExtranjero: true,
    //         atencionDental: true,
    //         indemnizacionDiariaSelect: {
    //           label: "500.00 por día",
    //           id: "500.00 por día",
    //         },
    //         reduccionCoaseguro: true,
    //         sumaAsegurada: {
    //           label: "SA 50,000 dlls",
    //           id: "SA 50,000 dlls",
    //         },
    //         atencionDentalSelect: {
    //           label: "Atención Dental Total",
    //           id: "Atención Dental Total",
    //         },
    //         coberturaExtranjero: true,
    //         indemnizacionDiaria: true,
    //         eliminacionDeducible: true,
    //       },
    //     },
    //   },
    //   //   cotizacion2: {
    //   //     titular: {
    //   //       nombre: "Jesus ramon",
    //   //       sexo: {
    //   //         label: "Hombre",
    //   //         id: "Hombre",
    //   //       },
    //   //       fechaNacimiento: "1994-05-02",
    //   //       localidad: {
    //   //         label: "Aguascalientes",
    //   //         id: 1,
    //   //       },
    //   //     },
    //   //     personas: [],
    //   //     inicio: "03/05/2025",
    //   //     fin: "03/05/2026",
    //   //     plan: {
    //   //       label: "Plan Seguro Óptimo Plus",
    //   //     },
    //   //     parametrosFlexibles: {
    //   //       sumaAsegurada: {
    //   //         label: " 3000 UMAM ",
    //   //         id: " 3000 UMAM ",
    //   //       },
    //   //       topeMaximo: {
    //   //         label: "$40,000",
    //   //         id: "$40,000",
    //   //       },
    //   //       deducible: {
    //   //         label: " 7 UMAM",
    //   //         id: "7 UMAM",
    //   //       },
    //   //       nivelHospitalario: {
    //   //         label: "Serie 300",
    //   //         id: "Serie 300",
    //   //       },
    //   //       frecuenciaPago: {
    //   //         label: "Trimestral",
    //   //         id: "Trimestral",
    //   //       },
    //   //       coaseguro: {
    //   //         label: "0%",
    //   //         id: "0%",
    //   //       },
    //   //       thq: {
    //   //         label: "36",
    //   //         id: "36",
    //   //       },
    //   //     },
    //   //     proteccionAdicional: {
    //   //       emergenciaExtranjero: true,
    //   //       atencionDental: true,
    //   //       indemnizacionDiariaSelect: {
    //   //         label: "500.00 por día",
    //   //         id: "500.00 por día",
    //   //       },
    //   //       reduccionCoaseguro: true,
    //   //       sumaAsegurada: {
    //   //         label: "SA 50,000 dlls",
    //   //         id: "SA 50,000 dlls",
    //   //       },
    //   //       atencionDentalSelect: {
    //   //         label: "Atención Dental Total",
    //   //         id: "Atención Dental Total",
    //   //       },
    //   //       coberturaExtranjero: true,
    //   //       indemnizacionDiaria: true,
    //   //       eliminacionDeducible: true,
    //   //     },
    //   //   },
    //   //   cotizacion3: {
    //   //     titular: {
    //   //       nombre: "Jesus ramon",
    //   //       sexo: {
    //   //         label: "Hombre",
    //   //         id: "Hombre",
    //   //       },
    //   //       fechaNacimiento: "1994-05-02",
    //   //       localidad: {
    //   //         label: "Aguascalientes",
    //   //         id: 1,
    //   //       },
    //   //     },
    //   //     personas: [],
    //   //     inicio: "03/05/2025",
    //   //     fin: "03/05/2026",
    //   //     plan: {
    //   //       label: "Plan Seguro Óptimo Plus",
    //   //     },
    //   //     parametrosFlexibles: {
    //   //       sumaAsegurada: {
    //   //         label: " 3000 UMAM ",
    //   //         id: " 3000 UMAM ",
    //   //       },
    //   //       topeMaximo: {
    //   //         label: "$40,000",
    //   //         id: "$40,000",
    //   //       },
    //   //       deducible: {
    //   //         label: " 7 UMAM",
    //   //         id: "7 UMAM",
    //   //       },
    //   //       nivelHospitalario: {
    //   //         label: "Serie 300",
    //   //         id: "Serie 300",
    //   //       },
    //   //       frecuenciaPago: {
    //   //         label: "Trimestral",
    //   //         id: "Trimestral",
    //   //       },
    //   //       coaseguro: {
    //   //         label: "0%",
    //   //         id: "0%",
    //   //       },
    //   //       thq: {
    //   //         label: "36",
    //   //         id: "36",
    //   //       },
    //   //     },
    //   //     proteccionAdicional: {
    //   //       emergenciaExtranjero: true,
    //   //       atencionDental: true,
    //   //       indemnizacionDiariaSelect: {
    //   //         label: "500.00 por día",
    //   //         id: "500.00 por día",
    //   //       },
    //   //       reduccionCoaseguro: true,
    //   //       sumaAsegurada: {
    //   //         label: "SA 50,000 dlls",
    //   //         id: "SA 50,000 dlls",
    //   //       },
    //   //       atencionDentalSelect: {
    //   //         label: "Atención Dental Total",
    //   //         id: "Atención Dental Total",
    //   //       },
    //   //       coberturaExtranjero: true,
    //   //       indemnizacionDiaria: true,
    //   //       eliminacionDeducible: true,
    //   //     },
    //   //   },
    // };
    let data = req.body.cotizaciones; // Obtener los datos del cuerpo de la solicitud
    // console.dir(data, { depth: null, colors: true });
    const resultado = {};

    console.log("Iniciando cotizaciones...");
    const entries = Object.entries(data);
    // Lanzar procesos con delay de 5 segundos entre cada inicio
    await Promise.all(
      entries.map(async ([key, item], idx) => {
        await delay(idx * 5000); // Espera 0ms para el primero, 5s para el segundo, 10s para el tercero, etc.
        console.dir(item, { depth: null, colors: true });

        const detalle = await ejecutarCotizacion(item);
        resultado[key] = {
          ...item,
          detalle: detalle,
        };
      })
    );

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.estimarCotizaciones = async (req, res) => {
  try {
    let data = req.body; // Obtener los datos del cuerpo de la solicitud
    const resultado = [];

    const cotizaciones = Object.entries(data.configuracion.compania);

    // Lanzar procesos con delay de 5 segundos entre cada inicio
    await Promise.all(
      cotizaciones.map(async ([key, cotizacion], idx) => {
        await delay(idx * 5000); // Espera 0ms para el primero, 5s para el segundo, 10s para el tercero, etc.

        let dataCotizacion = {
          titular: data.configuracion.titular,
          numeroCotizacion: cotizacion?.numeroCotizacion ?? null,
          detalles: cotizacion?.detalles ?? {},
          cotizacion: cotizacion,
        };

        const detalle = await handleEstimarCotizaciones(dataCotizacion);

        resultado.push({
          ...cotizacion,
          numeroCotizacion: detalle.numeroCotizacion,
          detalles: detalle.detalles,
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
