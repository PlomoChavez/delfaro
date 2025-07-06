const { getElement, sleep } = require("./seleniumHelper");

const { normalizarKey } = require("./GeneralHelper");
const { By } = require("selenium-webdriver");

async function getValoresTotales(driver, { locator, by = "xpath" }) {
  const elements = await getElement(driver, { locator, by, multiple: true });
  const valores = [];
  for (const el of elements) {
    valores.push(await el.getText());
  }
  return valores;
}
async function getValoresTotalesTable(driver) {
  const rows = await driver.findElements(
    By.xpath(`//table[@id="ValoresTarificados"]//tr`)
  );
  const result = {};

  for (const row of rows) {
    const tds = await row.findElements(By.xpath("./td"));
    if (tds.length === 2) {
      const key = normalizarKey((await tds[0].getText()).trim());
      const value = (await tds[1].getText()).trim();
      if (key && value) {
        result[key] = value;
      }
    }
  }
  return result;
}

async function waitForDivWithContent(driver, idDiv, timeout = 10000) {
  const end = Date.now() + timeout;
  let contenidoDetectado = false;

  while (Date.now() < end) {
    try {
      const div = await driver.findElement(By.id(idDiv));
      const content = await div.getAttribute("innerHTML");
      if (content && content.trim().length > 0) {
        if (!contenidoDetectado) {
          // console.log(`El div con id "${idDiv}" ya tiene contenido.`);
          contenidoDetectado = true;
        }
        // Ahora espera a que desaparezca el contenido
        while (true) {
          const div2 = await driver.findElement(By.id(idDiv));
          const content2 = await div2.getAttribute("innerHTML");
          if (!content2 || content2.trim().length === 0) {
            // console.log(`El contenido del div con id "${idDiv}" ha desaparecido.`);
            return true;
          }
          await sleep(300);
        }
      }
    } catch (e) {
      // Si no existe el div, sigue esperando
    }
    await sleep(300);
  }
}
async function waitForTablaCotizacionesConFilas(driver, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      // Busca la tabla por clase
      const tabla = await driver.findElement(By.css("table.datagrid-btable"));
      // Busca las filas dentro de la tabla
      const filas = await tabla.findElements(By.xpath("./tbody/tr"));
      if (filas.length > 0) {
        return true;
      }
    } catch (e) {
      // Si no existe la tabla, sigue esperando
    }
    await new Promise((res) => setTimeout(res, 300));
  }
  throw new Error(
    "La tabla de cotizaciones no tiene filas o no se encontró en el tiempo especificado."
  );
}

async function clickDetalleCotizacion(driver, cotizBuscada) {
  // Busca todas las filas de la tabla
  const filas = await driver.findElements(
    By.xpath('//table[contains(@class,"datagrid-btable")]//tr')
  );
  for (const fila of filas) {
    try {
      // Busca el td con el campo cpol_id_cotiz
      const tdCotiz = await fila.findElement(
        By.xpath(
          './/td[@field="cpol_id_cotiz"]/div[contains(@class,"datagrid-cell-c2-cpol_id_cotiz")]'
        )
      );
      const valorCotiz = (await tdCotiz.getText()).trim();
      if (valorCotiz === cotizBuscada) {
        // Busca el <a> cuyo id contenga el valor de cotización
        const link = await fila.findElement(
          By.xpath(`.//a[contains(@id,"${cotizBuscada}")]`)
        );
        await link.click();
        return true; // Éxito
      }
    } catch (e) {
      // Si no encuentra el td o el link, sigue con la siguiente fila
      continue;
    }
  }
  throw new Error(
    `No se encontró el enlace de detalle para la cotización ${cotizBuscada}`
  );
}

module.exports = {
  waitForTablaCotizacionesConFilas,
  clickDetalleCotizacion,
  getValoresTotales,
  waitForDivWithContent,
  getValoresTotalesTable,
};
