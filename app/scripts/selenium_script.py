from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import datetime
import time
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

def set_input_value(driver, locator, value, by=By.ID):
    """
    Localiza un input por su tipo de localizador (ID, NAME, etc.) y le asigna un valor.

    :param driver: Instancia del navegador Selenium.
    :param locator: Valor del localizador (ID, NAME, etc.).
    :param value: Valor a asignar al input.
    :param by: Tipo de localizador (por defecto, By.ID).
    """
    input_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((by, locator))
    )
    input_element.send_keys(value)


def click_element(driver, locator, by=By.LINK_TEXT):
    """
    Localiza un elemento por su tipo de localizador (ID, NAME, LINK_TEXT, etc.) y hace clic en él.

    :param driver: Instancia del navegador Selenium.
    :param locator: Valor del localizador (ID, NAME, LINK_TEXT, etc.).
    :param by: Tipo de localizador (por defecto, By.LINK_TEXT).
    """
    element = driver.find_element(by, locator)
    time.sleep(1)  # Esperar 1 segundo (opcional)
    element.click()

def select_mat_option(driver, select_locator, option_text, by=By.ID):
    """
    Cambia el valor de un mat-select en Angular Material.

    :param driver: Instancia del navegador Selenium.
    :param select_locator: Localizador del mat-select (ID, NAME, etc.).
    :param option_text: Texto visible de la opción a seleccionar.
    :param by: Tipo de localizador (por defecto, By.ID).
    """
    # Localizar el mat-select y hacer clic para abrir el menú desplegable
    mat_select = driver.find_element(by, select_locator)
    mat_select.click()

    # Esperar a que las opciones sean visibles
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, f"//span[text()='{option_text}']"))
    )

    # Localizar la opción por su texto visible y hacer clic
    option = driver.find_element(By.XPATH, f"//span[text()='{option_text}']")
    option.click()

def main():
    # Configurar el controlador del navegador (Chrome en este caso)
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless')  # Ejecutar en modo headless (sin interfaz gráfica)
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')

    # Inicializar el navegador
    driver = webdriver.Chrome(options=options)

    try:
        # Navegar a Google
        driver.get("https://agentes.planseguro.com.mx/login")

        # Esperar 5 segundos
        time.sleep(1)

        set_input_value(driver, "numero", "5_14076")

        # Localizar el input con id="numero" y asignarle el valor "x"
        set_input_value(driver, "password", "ACEBBBAAEDCCA")

        click_element(driver, "input[type='submit'][value='Ingresar']" , By.CSS_SELECTOR)

        # Esperar hasta que un elemento específico esté presente en la nueva página
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.LINK_TEXT, "Emisión digital"))
        )
        
        click_element(driver, "Emisión digital" , By.LINK_TEXT)

        click_element(driver, "Cotizador" , By.LINK_TEXT)
        print("Esperando 5 segundos...")
        # Cambiar a la nueva pestaña
        print("Cambiando a la nueva pestaña...")
        driver.switch_to.window(driver.window_handles[1])
        time.sleep(1)

        print("Cambiando nombre")
        set_input_value(driver, "nombre", data["titular"]["nombre"], By.NAME)
        print("Cambiando sexo")
        select_mat_option(driver, "mat-select-0", "Hombre", By.ID)  
        fecha_original = data["titular"]["fechaNacimiento"]
        fecha_convertida = datetime.strptime(fecha_original, "%Y-%m-%d").strftime("%d/%m/%Y")

        set_input_value(driver, "mat-input-1", fecha_convertida)
        select_mat_option(driver, "mat-select-1", data["titular"]["localidad"]["label"], By.ID)
        
        # Habilitar el botón usando JavaScript
        driver.execute_script("document.querySelector('button[type=\"submit\"]').removeAttribute('disabled')")

        # Hacer clic en el botón
        click_element(driver, "button[type='submit']", By.CSS_SELECTOR)

        time.sleep(1)
        if not data["personas"]:  # Verifica si "personas" está vacío
            print("La lista 'personas' está vacía. Continuando con el clic en 'Cotizar'...")
            # Localizar y hacer clic en el botón "Cotizar"
            click_element(driver, "button.go-to-cotizar", By.CSS_SELECTOR)
        else:
            print("La lista 'personas' no está vacía. No se hará clic en 'Cotizar'.")

        time.sleep(4)
        # Localizar el elemento con la clase "plan-name" y obtener su texto
        plan_name_element = driver.find_element(By.CSS_SELECTOR, "span.plan-name")
        plan_name_text = plan_name_element.text.strip()  # Obtener el texto y eliminar espacios en blanco

        # Validar el texto extraído con el valor de data["plan"]["label"]
        if plan_name_text == data["plan"]["label"]:
            print(f"El plan coincide: {plan_name_text}")
            
            # Localizar el contenedor del plan que coincide
            plan_container = plan_name_element.find_element(By.XPATH, "./ancestor::div[contains(@class, 'card')]")
            
            # Localizar el botón "Personaliza el plan" dentro del contenedor
            personaliza_button = plan_container.find_element(By.CSS_SELECTOR, "h6.borderless-button")
            
            # Hacer clic en el botón
            personaliza_button.click()
            print("Se hizo clic en 'Personaliza el plan'")
        else:
            print(f"El plan no coincide. Valor esperado: {data['plan']['label']}, Valor encontrado: {plan_name_text}")
    finally:
        # Cerrar el navegador
        # Esperar 5 segundos
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    main()
