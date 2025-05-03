import json
import argparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
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
    """
    Cambia el valor de un mat-select en Angular Material.
    """
    mat_select = driver.find_element(by, select_locator)
    mat_select.click()

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//span[text()='{option_text}']"))
    )

    option = driver.find_element(By.XPATH, f"//span[text()='{option_text}']")
    option.click()

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

        # Variable que contiene el valor a buscar
        sectionGoTo = "Parámetros flexibles"

        # Buscar todas las secciones con la clase específica
        sections = driver.find_elements(By.CSS_SELECTOR, "section.card.m-3.add-params-form.closed")

        # Iterar sobre las secciones para encontrar la que contiene el texto en <h6>
        for section in sections:
            try:
                # Buscar el elemento <h6> dentro de la sección
                h6_element = section.find_element(By.CSS_SELECTOR, "div.param-info.col-9.add h6")
                h6_text = h6_element.text.strip()  # Obtener el texto y eliminar espacios en blanco

                # Verificar si el texto coincide con sectionGoTo
                if h6_text == sectionGoTo:
                    print(f"Se encontró la sección con el texto: {h6_text}")
                    
                    # Realizar alguna acción dentro de la sección (por ejemplo, hacer clic en el botón de edición)
                    edit_button = section.find_element(By.CSS_SELECTOR, "div.edit-param img")
                    edit_button.click()
                    print("Se hizo clic en el botón de edición")
                    break
            except Exception as e:
                print(f"No se encontró el texto en esta sección: {e}")
    finally:
        time.sleep(5)
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
            "fechaNacimiento": "2025-05-02",
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
                "label": "1000 UMAM",
                "id": "1000 UMAM"
            },
            "topeMaximo": {
                "label": "$40,000",
                "id": "$40,000"
            },
            "deducible": {
                "label": "4 UMAM",
                "id": "4 UMAM"
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
                "label": "0 %",
                "id": "0 %"
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
                "label": "500.00 por dia",
                "id": "500.00 por dia"
            },
            "reduccionCoaseguro": True,
            "sumaAsegurada": {
                "label": "S.A. 50,000 dls",
                "id": "S.A. 50,000 dls"
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
