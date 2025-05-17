const { ejecutarCotizacion } = require('../bots/pruebas');

exports.obtenerTituloGoogle = async (req, res) => {
  try {
    let    data = {
        "titular": {
            "nombre": "Jesus ramon",
            "sexo": {
                "label": "Hombre",
                "id": "Hombre"
            },
            "fechaNacimiento": "1994-05-02",
            "localidad": {
                "label": "Aguascalientes",
                "id": 1
            }
        },
        "personas": [],
        "inicio": "03/05/2025",
        "fin": "03/05/2026",
        "plan": {
            "label": "Plan Seguro Óptimo Plus"
        },
        "parametrosFlexibles": {
            "sumaAsegurada": {
                "label": " 3000 UMAM ",
                "id": " 3000 UMAM "
            },
            "topeMaximo": {
                "label": "$40,000",
                "id": "$40,000"
            },
            "deducible": {
                "label": " 7 UMAM",
                "id": "7 UMAM"
            },
            "nivelHospitalario": {
                "label": "Serie 300",
                "id": "Serie 300"
            },
            "frecuenciaPago": {
                "label": "Trimestral",
                "id": "Trimestral"
            },
            "coaseguro": {
                "label": "0%",
                "id": "0%"
            },
            "thq": {
                "label": "36",
                "id": "36"
            }
        },
        "proteccionAdicional": {
            "emergenciaExtranjero": true,
            "atencionDental": true,
            "indemnizacionDiariaSelect": {
                "label": "500.00 por día",
                "id": "500.00 por día"
            },
            "reduccionCoaseguro": true,
            "sumaAsegurada": {
                "label": "SA 50,000 dlls",
                "id": "SA 50,000 dlls"
            },
            "atencionDentalSelect": {
                "label": "Atención Dental Total",
                "id": "Atención Dental Total"
            },
            "coberturaExtranjero": true,
            "indemnizacionDiaria": true,
            "eliminacionDeducible": true
        }
    };
    const title = await ejecutarCotizacion(data);
    res.json({ title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
