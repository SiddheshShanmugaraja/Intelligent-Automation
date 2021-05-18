import sys, os, re, string,random
from random import randint
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains

INPUT_DATA_FILE = "../data/input_data.txt"
CHROME_DRIVER = "../backend/chromedriver"

class Auto():
    """docstring for Auto"""
    def __init__(self, site, headless):
        super(Auto, self).__init__()
        chrome_options = Options()
        if headless is True:
            chrome_options.add_argument('--headless')
        with open(os.path.join(os.getcwd(), INPUT_DATA_FILE),"r") as f:
            contents = f.read()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(executable_path=CHROME_DRIVER, chrome_options=chrome_options)
        self.site = site
        self.action_space = contents.split('\n')
        self.action_space.append('submit')
        self.values = []

    def get_site(self,site):
        self.driver.get(site)
        self.driver.delete_all_cookies()

    def fill(self,state,action,validator_type="individual"):
        temp = state.split('-')
        state = temp[1]
        url = temp[0]
        
        if self.url == url:
            if state != 'terminal':
                if action < len(self.action_space)-1:
                    return self.fill_value(state,action,validator_type)
                elif action == len(self.action_space)-1:
                    if validator_type != "individual":
                        return self.submit_form()
                    else:
                        return self.get_result_by_fields()
            else:
                if validator_type != "individual":
                    return self.submit_form()
                else:
                    return self.get_result_by_fields()
        else:
            print("State is not available in this page")
            return (-1,False)

    def refresh(self):
        self.driver.refresh()

    def fill_value(self,state,value,validator_type="individual"):
        input_element = self.driver.find_element_by_id(state)
        objtype = input_element.get_attribute('type')
        if objtype == 'text' or objtype == "password" or objtype == 'email' or objtype == 'file' or objtype == 'textarea' or objtype == 'number':
            try:
                input_element.send_keys(str(value))
            except Exception as e:
                print(f"Error: {e}")
        elif objtype == 'select-one':
            elem = Select(input_element)
            try:
                elem.select_by_visible_text(str(value))
            except NoSuchElementException as e:
                return (-1,False)
        elif objtype == 'range':
            try:
                self.driver.execute_script(f"$('#{state}').val({value}).change()",input_element)
            except Exception as e:
                print(f"Error: {e}")
        self.values.append(value)
        if validator_type == "global":
            return self.check_status()
        else:
            return self.check_field_status(input_element)

    def submit_form(self):
        button = self.driver.find_element_by_id('submit')
        button.send_keys(Keys.ENTER)
        return self.get_result()

    def random_string(self,letters,length=10):
        """Generate a random string of fixed length """
        return ''.join(random.choice(letters) for i in range(length))

    def check_status(self):
        try:
            result = self.driver.find_element_by_id("error")
            if result.text != "":
                return (-1, False)
            else:
                return (1,False)
        except Exception as e:
            print(f"Error: {e}")
            return (1,False)
    
    def check_field_status(self,elem):
        try:
            classes = elem.get_attribute("class").split(" ")
            if "is-success" not in classes:
                return (-1, False)
            else:
                return (1,False)
        except Exception as e:
            print(f"Error: {e}")
            return (1,False)

    def get_result(self):
        try:
            result = self.driver.find_element_by_id("error")
            print("Result: ",result.text)
            if result.text == "failure":
                return (-3, True)
            elif result.text == "success":
                self.values = []
                return (3,True)
            else:
                return (-1,True)
        except Exception as e:
            print(str(e))
            return (-1,True)

    def get_result_by_fields(self):
        states = self.getstates(self.site)
        states = [s.split("-")[1] for s in states]
        states.remove("terminal")
        for state in states:
            try:
                input_element = self.driver.find_element_by_id(state)
            except NoSuchElementException:
                continue
            reward = self.check_field_status(input_element)[0]
            if reward != 1:
                print("Result: Failure")
                return (-3,True)
        print("Result: Success")
        return (3,True)

    def getstates(self,site,element=""):
        self.site = site
        url = re.search(r'http(s)?://([a-zA-Z:\.0-9]*)/([a-zA-Z0-9\.\s]*)',site,re.I|re.M)
        if url:
            print("Current site is",site)
            self.url = url.group(3)
        else:
            self.url = "Unnamed"
        raw = self.driver.page_source
        soup = BeautifulSoup(raw, features="html5lib")
        if element != "":
            soup = soup.select_one(element)
        inputs = soup.find_all('input')
        text_area = soup.find_all("textarea")
        select_boxes = soup.find_all("select")
        select_ids = [i.get('id') for i in select_boxes]
        text_ids = [i.get('id') for i in text_area]
        ids = [i.get('id') for i in inputs]
        ids = ids + text_ids + select_ids
        ids = list(filter(None, ids))
        if len(ids) > 0:
            a = [self.url+"-"+i for i in ids]
            a.append(self.url+"-"+"terminal")
        return a
    
    def click_next_button(self,next_id):
        try:
            elem = self.driver.find_element_by_css_selector(next_id)
            elem.click()
            return self.driver.current_url
        except Exception as e:
            print(str(e))
            return None

    def destroy_site(self):
        self.driver.close()
        self.driver.quit()