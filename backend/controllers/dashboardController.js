const fs = require("fs");
const path = require("path");
const multer = require("multer");
const moment = require("moment");

const { queryWithRelations } = require("../db/functionsSQL");

// Controlador
exports.inicioData = async (req, res) => {
  const { compania_id, ramo_id, inicioVigencia, finVigencia, agente_id } =
    req.body; // Datos del formulario

  let queryPoliza = {
    modelo: "polizas",
    filtros: {},
  };

  if (compania_id) {
    queryPoliza.filtros["compania_id"] = compania_id;
  }
  if (ramo_id) {
    queryPoliza.filtros["ramo_id"] = ramo_id;
  }
  if (agente_id) {
    queryPoliza.filtros["agente_id"] = agente_id;
  }

  const rows = await queryWithRelations(queryPoliza);

  let indicadores = {
    recibosContador: 0,
    recibosSumatoria: 0,
    recibosPagadosSumatoria: 0,
    recibosPagadosContador: 0,
    recibosPendientesSumatoria: 0,
    recibosPendientesContador: 0,
    totalSiniestros: 0,
    polizasContador: 0,
    polizasSumatoria: 0,
    primaNetaSumatoria: 0,
    primaNetaContador: 0,
    primaTotalSumatoria: 0,
    primaTotalContador: 0,
    nuevosNegociosSumatoria: 0,
    nuevosNegociosContador: 0,
    renovacionesSumatoria: 0,
    renovacionesContador: 0,
    canceladasSumatoria: 0,
    canceladasContador: 0,
  };

  indicadores.polizasContador = rows.length;
  // prettier-ignore
  indicadores.primaNetaSumatoria = rows.reduce((sum, poliza) => sum + parseFloat(poliza.primaNeta || 0),0);
  // prettier-ignore
  indicadores.primaNetaContador = rows.reduce((sum) => sum + 1,0);
  // prettier-ignore
  indicadores.primaTotalSumatoria = rows.reduce((sum, poliza) => sum + parseFloat(poliza.primaTotal || 0),0);
  indicadores.polizasSumatoria = indicadores.primaTotalSumatoria;
  // prettier-ignore
  indicadores.primaTotalContador = rows.reduce((sum) => sum + 1,0);
  // prettier-ignore
  indicadores.renovacionesContador = rows.reduce((sum,poliza) => sum + (poliza.renovacion ? 1 : 0),0);
  // prettier-ignore
  indicadores.renovacionesSumatoria = rows.reduce((sum,poliza) => sum + (poliza.renovacion ?  parseFloat(poliza.primaTotal || 0) : 0),0);
  // prettier-ignore
  indicadores.canceladasContador = rows.reduce((sum,poliza) => sum + (poliza.estatus_id == 3 ? 1 : 0),0);
  // prettier-ignore
  indicadores.canceladasSumatoria = rows.reduce((sum,poliza) => sum + (poliza.estatus_id == 3?  parseFloat(poliza.primaTotal || 0) : 0),0);

  // Obtener el año actual
  const currentYear = moment().year();

  // Filtrar las pólizas según el rango de fechas o el año actual
  const filteredRows = rows.filter((poliza) => {
    const createdAt = moment(poliza.created_at); // Convertir `created_at` a un objeto moment
    // prettier-ignore
    const isCurrentYear = createdAt.year() === currentYear;
    return isCurrentYear;
  });

  // prettier-ignore
  indicadores.nuevosNegociosContador = filteredRows.reduce((sum, poliza) => sum + 1,0);
  // prettier-ignore
  indicadores.nuevosNegociosSumatoria = filteredRows.reduce((sum, poliza) =>sum + parseFloat(poliza.primaTotal || 0),0);

  let idsPolizas = rows.map((poliza) => poliza.id);

  let queryRecibos = {
    modelo: "poliza_recibos",
    filtros: {
      poliza_id: { $in: idsPolizas },
    },
  };

  const rowsRecibos = await queryWithRelations(queryRecibos);

  indicadores.recibosContador = rowsRecibos.length;
  // prettier-ignore
  indicadores.recibosSumatoria = rowsRecibos.reduce((sum, recibo) => sum + parseFloat(recibo.importe || 0),0);
  // prettier-ignore
  indicadores.recibosPagadosContador = rowsRecibos.reduce((sum, recibo) => sum + (recibo.fechaPago ? 1 : 0),0);
  // prettier-ignore
  indicadores.recibosPagadosSumatoria = rowsRecibos.reduce((sum, recibo) => sum + (recibo.fechaPago ? parseFloat(recibo.importe || 0) : 0),0);
  // prettier-ignore
  indicadores.recibosPendientesContador = rowsRecibos.reduce((sum, recibo) => sum + (!recibo.fechaPago ? 1 : 0),0);
  // prettier-ignore
  indicadores.recibosPendientesSumatoria = rowsRecibos.reduce((sum, recibo) => sum + (!recibo.fechaPago ? parseFloat(recibo.importe || 0) : 0),0);

  try {
    res.json({
      result: true,
      message: "Datos de inicio obtenidos con éxito.",
      data: indicadores,
    });
  } catch (error) {
    res.json({
      result: false,
      message: "Error al procesar el pago. " + error.message,
    });
  }
};
