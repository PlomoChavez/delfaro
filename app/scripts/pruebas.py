import json
import argparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
from bs4 import BeautifulSoup
import sys

import time

def set_input_value(driver, locator, value, by=By.ID):
    """
    Localiza un input por su tipo de localizador (ID, NAME, etc.) y le asigna un valor.
    """
    input_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((by, locator))
    )
    input_element.send_keys(value)

def click_element(driver, locator, by=By.LINK_TEXT):
    """
    Localiza un elemento por su tipo de localizador (ID, NAME, LINK_TEXT, etc.) y hace clic en él.
    """
    element = driver.find_element(by, locator)
    time.sleep(1)  # Esperar 1 segundo (opcional)
    element.click()

def select_mat_option(driver, select_locator, option_text, by=By.ID):
    try:
        # Localizar y abrir el mat-select
        mat_select = driver.find_element(by, select_locator)
        mat_select.click()

        # Esperar a que el mat-option con el texto deseado esté presente
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, f"//mat-option[.//span[normalize-space(text())='{option_text.strip()}']]"))
        )
        # Localizar el mat-option correspondiente
        option = driver.find_element(By.XPATH, f"//mat-option[.//span[normalize-space(text())='{option_text.strip()}']]")

        option.click()
    except Exception as e:
        print(f"Error al seleccionar la opción '{option_text.strip()}'")

def customParametrosFlexibles(driver, data):
    # print("Suma aseclearclear
    select_mat_option(driver, "sumaaseguradaId", data["parametrosFlexibles"]["sumaAsegurada"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "deducibleId", data["parametrosFlexibles"]["deducible"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "coaseguroId", data["parametrosFlexibles"]["coaseguro"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "topeDropdown", data["parametrosFlexibles"]["topeMaximo"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "basehospitalariaId", data["parametrosFlexibles"]["nivelHospitalario"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "honorariosquirurgicosId", data["parametrosFlexibles"]["thq"]["label"], By.NAME)
    time.sleep(1)
    select_mat_option(driver, "pago", data["parametrosFlexibles"]["frecuenciaPago"]["label"], By.NAME)
    time.sleep(1)

def customParametrosProteccion(driver, data):
    # Emergencia Extranjero
    if data["proteccionAdicional"]["emergenciaExtranjero"]:
        click_element(driver, "emergenciaExtranjero", By.ID)
        time.sleep(1)
        select_mat_option(driver, "emergenciaExtranjeroFactor", data["proteccionAdicional"]["sumaAsegurada"]["label"], By.NAME)
        time.sleep(1)

    # Cobertura en el Extranjero (CE)
    if data["proteccionAdicional"]["coberturaExtranjero"]:
        click_element(driver, "coberturaExtranjero", By.ID)
        time.sleep(1)
        # select_mat_option(driver, "coberturaExtranjeroFactor", data["proteccionAdicional"]["sumaAsegurada"]["label"], By.NAME)
        # time.sleep(1)

    # Atencion dental
    if data["proteccionAdicional"]["atencionDental"]:
        click_element(driver, "primaCoberturaDentalBool", By.ID)
        time.sleep(1)
        select_mat_option(driver, "primaCoberturaDentalTarifa", data["proteccionAdicional"]["atencionDentalSelect"]["label"], By.NAME)
        time.sleep(1)

    # Indemnización Diaria por Hospitalización por Accidente (IDHA)
    if data["proteccionAdicional"]["indemnizacionDiaria"]:
        click_element(driver, "indemnizacionDiariaHospitalizacion", By.NAME)
        time.sleep(1)
        select_mat_option(driver, "indemnizacionDiariaFactor", data["proteccionAdicional"]["indemnizacionDiariaSelect"]["label"], By.NAME)
        time.sleep(1)

    # Reducción de coaseguro por Padecimiento de Nariz en caso de Accidente.
    if data["proteccionAdicional"]["reduccionCoaseguro"]:
        click_element(driver, "reduccionCoaseguroNarizAccidente", By.ID)
        time.sleep(1)
        
    # Eliminación de Deducible por Accidente
    if data["proteccionAdicional"]["eliminacionDeducible"]:
        click_element(driver, "eliminacionDeducibleAccidente", By.ID)
        time.sleep(1)
        
def extraer_etiquetas_y_valores(contenedor):
    resultados = []
    filas = contenedor.find_elements(By.XPATH, ".//div[contains(@class, 'row')]")
    for fila in filas:
        # Busca el span (etiqueta)
        spans = fila.find_elements(By.TAG_NAME, "span")
        if not spans:
            continue  # Si no hay etiqueta, ignora la fila

        etiqueta = spans[0].text.strip()

        # Busca el div con clase numbers
        numbers_divs = fila.find_elements(By.CLASS_NAME, "numbers")
        if not numbers_divs:
            continue  # Si no hay valor, ignora la fila

        numbers_div = numbers_divs[0]
        # Caso especial: <h6> anidados (ejemplo: Suma Asegurada)
        h6s = numbers_div.find_elements(By.TAG_NAME, "h6")
        if h6s:
            valor = " ".join([h6.text.strip() for h6 in h6s if h6.text.strip()])
        else:
            valor = numbers_div.text.strip()
        resultados.append(f"{etiqueta} {valor}")
    return resultados  


def extraer_etiquetas_y_valores2(html):
    soup = BeautifulSoup(html, "html.parser")
    bloque = soup.find("div", class_="params")
    resultado = []
    actual = ""
    concepto_pendiente = None

    for elem in bloque.children:
        if getattr(elem, "name", None) == "h5":
            # Si hay un bloque pendiente, lo agregamos
            if actual:
                resultado.append(actual)
            actual = elem.get_text(strip=True)
            concepto_pendiente = None
        elif getattr(elem, "name", None) == "div" and "col-6" in elem.get("class", []):
            span = elem.find("span")
            h6 = elem.find("h6")
            if span:
                concepto_pendiente = span.get_text(strip=True)
            if h6:
                if concepto_pendiente:
                    actual += f": {concepto_pendiente}: {h6.get_text(strip=True)}"
                    concepto_pendiente = None
                else:
                    actual += f": {h6.get_text(strip=True)}"
        elif getattr(elem, "name", None) == "hr":
            if actual:
                resultado.append(actual)
                actual = ""
                concepto_pendiente = None
    if actual:
        resultado.append(actual)
    return resultado

def main(data):
    # Configurar el controlador del navegador (Chrome en este caso)
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    driver = webdriver.Chrome(options=options)

    try:
        driver.get("https://agentes.planseguro.com.mx/login")
        time.sleep(1)

        set_input_value(driver, "numero", "5_14076")
        set_input_value(driver, "password", "ACEBBBAAEDCCA")
        click_element(driver, "input[type='submit'][value='Ingresar']", By.CSS_SELECTOR)

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, "Emisión digital"))
        )
        click_element(driver, "Emisión digital", By.LINK_TEXT)
        click_element(driver, "Cotizador", By.LINK_TEXT)

        driver.switch_to.window(driver.window_handles[1])
        time.sleep(1)

        set_input_value(driver, "nombre", data["titular"]["nombre"], By.NAME)
        select_mat_option(driver, "mat-select-0", data["titular"]["sexo"]["label"], By.ID)

        fecha_original = data["titular"]["fechaNacimiento"]
        fecha_convertida = datetime.strptime(fecha_original, "%Y-%m-%d").strftime("%d/%m/%Y")
        set_input_value(driver, "mat-input-1", fecha_convertida)

        select_mat_option(driver, "mat-select-1", data["titular"]["localidad"]["label"], By.ID)

        driver.execute_script("document.querySelector('button[type=\"submit\"]').removeAttribute('disabled')")
        click_element(driver, "button[type='submit']", By.CSS_SELECTOR)

        if not data["personas"]:
            click_element(driver, "button.go-to-cotizar", By.CSS_SELECTOR)
        
        time.sleep(1)
        plan_name_element = driver.find_element(By.CSS_SELECTOR, "span.plan-name")
        plan_name_text = plan_name_element.text.strip()

        if plan_name_text == data["plan"]["label"]:
            plan_container = plan_name_element.find_element(By.XPATH, "./ancestor::div[contains(@class, 'card')]")
            personaliza_button = plan_container.find_element(By.CSS_SELECTOR, "h6.borderless-button")
            personaliza_button.click()

            # Lista de pasos a realizar
            # steps = ["Protección con costo adicional", "Reconocimiento de Antigüedad"]
            steps = ["Parámetros flexibles", "Protección con costo adicional", "Reconocimiento de Antigüedad"]
            for index, step in enumerate(steps):
                # Esperar a que el elemento <section> con el texto correspondiente esté presente
                section = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, f"//section[contains(@class, 'card') and .//h6[text()='{step}']]"))
                )
                time.sleep(2)

                # Dentro de esa sección, localizar el botón (imagen) y hacer clic
                edit_button = section.find_element(By.CSS_SELECTOR, "div.edit-param img")
                driver.execute_script("arguments[0].click();", edit_button)
                # Switch basado en la posición del array
                match index:
                    case 0:
                    #     print("Acción para 'Parámetros flexibles'")
                        customParametrosFlexibles(driver, data)
                    case 1:
                        customParametrosProteccion(driver, data)

                click_element(driver, "//button[normalize-space(text())='Actualizar costo']", By.XPATH)
                WebDriverWait(driver, 50).until( EC.presence_of_element_located((By.XPATH, "//button[normalize-space(text())='Ver Resumen']")) )
            click_element(driver, "//button[normalize-space(text())='Ver Resumen']", By.XPATH)

        # Definir datos como un diccionario
        datos = {}
        # Espera hasta 10 segundos a que aparezca el div con clase 'payment'
        resumen = WebDriverWait(driver, 50).until(
            EC.presence_of_element_located((By.CLASS_NAME, "payment"))
        )
        # 1. Resumen de Cotización
        # resumen = driver.find_element(By.CLASS_NAME, "payment")
        resumen_info = extraer_etiquetas_y_valores(resumen)
        params_flex = driver.find_element(By.XPATH, "//div[contains(@class, 'basic-params') and .//h3[contains(text(),'Parámetros flexibles')]]//div[contains(@class, 'params')]")
        params_costo = driver.find_element(By.XPATH, "//div[contains(@class, 'basic-params') and .//h3[contains(text(),'Protección con costo')]]//div[contains(@class, 'params')]")
        resumen_info = extraer_etiquetas_y_valores(resumen)
        params_flex_info = extraer_etiquetas_y_valores(params_flex)
        params_costo_html = params_costo.get_attribute("outerHTML")
        params_costo_info = extraer_etiquetas_y_valores2(params_costo_html)

        # Junta todo en un diccionario
        resultado = {
            "resumen": resumen_info,
            "parametros_flexibles": params_flex_info,
            "proteccion_con_costo": params_costo_info
        }

        # Imprime el JSON (esto es lo que shell_exec captura)
        try:
            print(json.dumps(resultado, ensure_ascii=False))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
        
    finally:
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script para automatizar Selenium con datos dinámicos.")

    # Convertir el argumento JSON a un diccionario de Python
    # Objeto con la información
    data = {
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
            "emergenciaExtranjero": True,
            "atencionDental": True,
            "indemnizacionDiariaSelect": {
                "label": "500.00 por día",
                "id": "500.00 por día"
            },
            "reduccionCoaseguro": True,
            "sumaAsegurada": {
                "label": "SA 50,000 dlls",
                "id": "SA 50,000 dlls"
            },
            "atencionDentalSelect": {
                "label": "Atención Dental Total",
                "id": "Atención Dental Total"
            },
            "coberturaExtranjero": True,
            "indemnizacionDiaria": True,
            "eliminacionDeducible": True
        }
    }


    # Ejecutar el script principal con los datos proporcionados
    main(data)
