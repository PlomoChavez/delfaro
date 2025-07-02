const { By, until } = require("selenium-webdriver");
const {
  sleep,
  clickElement,
  selectMatOption,
  demo,
} = require("./seleniumHelper");
// ...otros requires y helpers...

async function cerrarModalSiExiste(driver) {
  try {
    // Espera hasta 3 segundos por el botón de cerrar (ajusta si es necesario)
    const closeBtn = await driver.wait(
      until.elementLocated(By.css('div[role="dialog"] button[type="button"]')),
      3000
    );
    await closeBtn.click();
    // Espera un poco para que el modal desaparezca
    await sleep(500);
    console.log("Modal cerrado automáticamente.");
  } catch (e) {
    // Si no existe el modal, no pasa nada
    console.log("No se encontró modal para cerrar (o ya estaba cerrado).");
  }
}

async function handleStepsForm(driver, step, data) {
  const stepTitle = step[0];
  const stepKey = step[1];

  const section = await driver.wait(
    until.elementLocated(
      By.xpath(
        `//section[contains(@class, 'card') and .//h6[text()='${stepTitle}']]`
      )
    ),
    10000
  );
  await sleep(2000);

  const editButton = await section.findElement(By.css("div.edit-param img"));

  await driver.executeScript("arguments[0].click();", editButton);

  await sleep(1000);

  if (stepKey === "parametrosFlexibles") {
    await customParametrosFlexibles(driver, data);
  }
  if (stepKey === "proteccionAdicional") {
    await customParametrosProteccion(driver, data);
  }

  await clickElement(driver, {
    locator: "//button[normalize-space(text())='Actualizar costo']",
    by: "xpath",
  });

  await driver.wait(
    until.elementLocated(
      By.xpath("//button[normalize-space(text())='Ver Resumen']")
    ),
    50000
  );
}

async function customParametrosFlexibles(driver, data) {
  await selectMatOption(driver, {
    locator: "sumaaseguradaId",
    optionText: data.parametrosFlexibles.sumaAsegurada.label,
    by: "name",
  });
  await sleep(1000);

  await selectMatOption(driver, {
    locator: "deducibleId",
    optionText: data.parametrosFlexibles.deducible.label,
    by: "name",
  });
  await sleep(1000);

  await selectMatOption(driver, {
    locator: "coaseguroId",
    optionText: data.parametrosFlexibles.coaseguro.label,
    by: "name",
  });
  await sleep(1000);

  // Si el coaseguro es del 10%, selecciona el tope máximo
  if (data.parametrosFlexibles.coaseguro.label == "10%") {
    await selectMatOption(driver, {
      locator: "topeDropdown",
      optionText: data.parametrosFlexibles.topeMaximo.label,
      by: "name",
    });
    await sleep(1000);
  }

  await selectMatOption(driver, {
    locator: "basehospitalariaId",
    optionText: data.parametrosFlexibles.nivelHospitalario.label,
    by: "name",
  });
  await sleep(1000);

  await selectMatOption(driver, {
    locator: "honorariosquirurgicosId",
    optionText: data.parametrosFlexibles.thq.label,
    by: "name",
  });
  await sleep(1000);

  await selectMatOption(driver, {
    locator: "pago",
    optionText: data.parametrosFlexibles.frecuenciaPago.label,
    by: "name",
  });
}

async function customParametrosProteccion(driver, data) {
  // if (data.proteccionAdicional.emergenciaExtranjero) {
  //   await clickElement(driver, {
  //     locator: "label[for='emergenciaExtranjero']",
  //     by: "css",
  //   });
  //   console.log(
  //     "emergenciaExtranjeroFactor",
  //     ` '${data.proteccionAdicional.sumaAsegurada.label}' `
  //   );
  //   console.log(
  //     "emergenciaExtranjeroFactor",
  //     ` '${data.proteccionAdicional.sumaAsegurada.label.trim()}' `
  //   );
  //   await demo(driver);
  //   await selectMatOption(driver, {
  //     locator: "emergenciaExtranjeroFactor",
  //     optionText: data.proteccionAdicional.sumaAsegurada.label.trim(),
  //     by: "name",
  //   });
  // }
  if (data.proteccionAdicional.coberturaExtranjero) {
    await clickElement(driver, {
      locator: "label[for='coberturaExtranjero']",
      by: "css",
    });
    await sleep(1000);
  }
  if (data.proteccionAdicional.atencionDental) {
    await clickElement(driver, {
      locator: "label[for='primaCoberturaDentalBool']",
      by: "css",
    });
    await sleep(1000);

    await selectMatOption(driver, {
      locator: "primaCoberturaDentalTarifa",
      optionText: data.proteccionAdicional.atencionDentalSelect.label,
      by: "name",
    });
    await sleep(1000);
  }
  if (data.proteccionAdicional.indemnizacionDiaria) {
    await clickElement(driver, {
      locator: "label[for='indemnizacionDiariaHospitalizacion']",
      by: "css",
    });
    await sleep(1000);

    await selectMatOption(driver, {
      locator: "indemnizacionDiariaFactor",
      optionText: data.proteccionAdicional.indemnizacionDiariaSelect.label,
      by: "name",
    });
    await sleep(1000);
  }
  if (data.proteccionAdicional.reduccionCoaseguro) {
    await clickElement(driver, {
      locator: "label[for='reduccionCoaseguroNarizAccidente']",
      by: "css",
    });
    await sleep(1000);
  }
  if (data.proteccionAdicional.eliminacionDeducible) {
    await clickElement(driver, {
      locator: "label[for='eliminacionDeducibleAccidente']",
      by: "css",
    });
    await sleep(1000);
  }
}

module.exports = {
  cerrarModalSiExiste,
  handleStepsForm,
  customParametrosFlexibles,
  customParametrosProteccion,
};
