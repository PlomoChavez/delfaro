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

        plan_name_element = driver.find_element(By.CSS_SELECTOR, "span.plan-name")
        plan_name_text = plan_name_element.text.strip()

        if plan_name_text == data["plan"]["label"]:
            plan_container = plan_name_element.find_element(By.XPATH, "./ancestor::div[contains(@class, 'card')]")
            personaliza_button = plan_container.find_element(By.CSS_SELECTOR, "h6.borderless-button")
            personaliza_button.click()
    finally:
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script para automatizar Selenium con datos dinámicos.")
    parser.add_argument("--data", type=str, required=True, help="Objeto JSON con los datos necesarios.")
    args = parser.parse_args()

    # Convertir el argumento JSON a un diccionario de Python
    data = json.loads(args.data)

    # Ejecutar el script principal con los datos proporcionados
    main(data)
