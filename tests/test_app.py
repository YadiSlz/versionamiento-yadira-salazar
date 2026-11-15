import os
import time

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.environ.get("BASE_URL", "https://versionamiento-yadira-salazar.onrender.com/")


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,800")
    drv = webdriver.Chrome(options=options)
    drv.get(BASE_URL)
    yield drv
    drv.quit()


def test_homepage_loads(driver):
    """La pagina carga y muestra el titulo y el formulario de alta de productos."""
    assert "Yadira's List App" in driver.title
    name_input = driver.find_element(By.ID, "name")
    price_input = driver.find_element(By.ID, "price")
    add_button = driver.find_element(By.ID, "addProduct")
    assert name_input.is_displayed()
    assert price_input.is_displayed()
    assert add_button.is_displayed()


def test_add_product(driver):
    """Al agregar un producto, aparece como fila nueva en la tabla."""
    wait = WebDriverWait(driver, 10)

    product_name = f"Producto Selenium {int(time.time())}"

    driver.find_element(By.ID, "name").send_keys(product_name)
    driver.find_element(By.ID, "price").send_keys("99.99")
    driver.find_element(By.ID, "addProduct").click()

    row = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, f"//table[@id='productsTable']//td[text()='{product_name}']")
        )
    )
    assert row.text == product_name
