from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_experimental_option("detach", True)
driver=webdriver.Chrome(options=options)

driver.get("https://demo.testfire.net/")
driver.maximize_window
time.sleep(2)

driver.find_element(By.LINK_TEXT, "Sign In").click()
time.sleep(2)

driver.find_element(By.ID, "uid").send_keys("admin")
driver.find_element(By.ID, "passw").send_keys("admin")
driver.find_element(By.NAME, "btnSubmit").click()
time.sleep(2)

driver.find_element(By.LINK_TEXT, "Customize Site Language").click()
time.sleep(3)

driver.find_element(By.LINK_TEXT, "View Recent Transactions").click()
time.sleep(3)

driver.find_element(By.LINK_TEXT, "View Account Summary").click()
time.sleep(3)

driver.find_element(By.LINK_TEXT, "Transfer Funds").click()
time.sleep(3)

driver.find_element(By.LINK_TEXT, "Search News Articles").click()
time.sleep(3)
