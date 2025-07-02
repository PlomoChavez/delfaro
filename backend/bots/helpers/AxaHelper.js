const { By, until } = require("selenium-webdriver");
const {
  sleep,
  clickElement,
  selectMatOption,
  demo,
  saveCurrentHtmlToTxt,
} = require("./seleniumHelper");
const e = require("express");

async function cerrarModalSiExiste(driver) {
  try {
    // Espera hasta 5 segundos a que el modal aparezca (ajusta el tiempo si es necesario)
    await driver.wait(
      until.elementLocated(By.id("frmHeader:popUpMensajeAlerta")),
      20000
    );
    // Si llega aquí, el modal existe
    const boton = await driver.findElement(By.id("frmHeader:btnAceptarAlerta"));
    await boton.click();
  } catch (err) {
    console.log(
      "No se encontró el modal o no se pudo hacer clic:",
      err.message
    );
  }
}

module.exports = {
  cerrarModalSiExiste,
};
