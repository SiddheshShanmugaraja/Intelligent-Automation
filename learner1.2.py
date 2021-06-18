import gc
import json
import time
import random
import selenium
import numpy as np
import pandas as pd
from numpy.linalg import norm
from argparse import ArgumentParser
from selenium import webdriver as wb 
from typing import List, Dict, Tuple, Optional, Type
from urllib3.exceptions import ProtocolError, MaxRetryError
from requests.exceptions import ConnectionError
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, InvalidElementStateException, StaleElementReferenceException

pd.set_option('display.max_columns', None)

with open("./backend/config.json", "r") as f:
    config = json.load(f)

DATA_FILE = config.get("DATA_FILE")

N_EPISODES = 10
LEARNING_RATE = 0.1
GAMMA = 0.9
INITIAL_EPSILON = 0.9
SLEEP_BETWEEN_INTERVALS = 0.1
SCALING_FACTOR = 10

MOVE_REWARD = -2
POSITIVE_REWARD = 15
NEGATIVE_REWARD = -5

class Webpage: 

    def __init__(self, url: str, inputs: List, assertion_message: str, driver: Optional[Type[selenium.webdriver.chrome.webdriver.WebDriver]] = None): 
        """[summary]

        Args:
            url (str): [description]
            inputs (List): [description]
            assertion_message (str): [description]
            driver (Optional[Type[ selenium.webdriver.chrome.webdriver.WebDriver]], optional): [description]. Defaults to None.
        """
        self.url = url.replace('localhost', '127.0.0.1') if 'localhost' in url else url
        if driver:
            self.driver = driver
        else:
            self.initialize_driver()
        self.states = self.get_states()
        self.actions = ['skip', 'click_button'] + [f'set_value={i}' for i in inputs] + [f'slide_button={i}' for i in inputs] + [f'drag_and_drop={i}' for i in self.states] 
        self.assertion_message = assertion_message
        self.q_table = np.zeros((len(self.states), len(self.actions)))
        self.wait = WebDriverWait(self.driver, 2)
        self.action_chain = ActionChains(driver)
        with open('test_cases.txt', 'a') as f:
            f.write(str(self))

    def initialize_driver(self):
        self.driver = wb.Chrome('./backend/chromedriver')

    def __repr__(self):
        return f'\nURL\t: {self.url}\nSTATES\t: {self.states}\nACTIONS\t: {self.actions}\n'

    def get_states(self):
        self.driver.get(self.url)
        elements = self.driver.find_elements_by_xpath('//*[@id]')
        states = [element.get_attribute('id') for element in elements if element.get_attribute('id') not in ['', 'root']]
        return states

    def click_button(self, element_id: str): 
        element = self.wait.until(EC.element_to_be_clickable((By.ID, element_id)))
        try:
            element.clear()
        except InvalidElementStateException:
            pass
        self.driver.execute_script("arguments[0].click();", element)

    def set_value(self, element_id: str, value: str):
        self.driver.implicitly_wait(SLEEP_BETWEEN_INTERVALS)
        element = self.driver.find_element_by_id(element_id)
        element.clear()
        element.send_keys(value)

    def slide_button(self, element_id: str, x_offset: int, y_offset: int):
        element = self.wait.until(EC.element_to_be_clickable((By.ID, element_id)))
        self.action_chain.click_and_hold(element).move_by_offset(x_offset, y_offset).release().perform()

    def drag_and_drop(self, source_element_id: str, target_element_id: str): 
        source = self.wait.until(EC.element_to_be_clickable((By.ID, source_element_id)))
        target = self.wait.until(EC.element_to_be_clickable((By.ID, target_element_id)))
        self.action_chain.drag_and_drop(source, target).perform()

    def take_action(self, state: str, action: str):
        if 'set_value' in action:
            value = action.split('=')[-1]
            self.set_value(state, value)
        elif 'click_button' in action:
            self.click_button(state)
        elif 'slide_button' in action:
            value = action.split('=')[-1]
            self.slide_button(state, value, value)
        elif 'drag_and_drop' in action:
            target_element_id = action.split('=')[-1]
            self.drag_and_drop(state, target_element_id)

    def learn(self, state_index: int, action_index: int, reward: int):
        current_q = self.q_table[state_index, action_index]
        if state_index < len(self.states) - 1:
            max_future_q = self.q_table[state_index + 1, :].max()
        else:
            max_future_q = POSITIVE_REWARD
        new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + GAMMA * max_future_q)
        self.q_table[state_index, action_index] = new_q
        return self.q_table

    def episode(self, epsilon: float):
        success = False
        while not success:
            history = list()
            self.driver.get(self.url)
            for state_index, state in enumerate(self.states):
                if np.random.random() > epsilon == 0.9:
                    action = self.actions[self.q_table[state_index].argmax()]
                else:
                    action = random.choice(self.actions)
                action_index = self.actions.index(action)
                try:
                    self.take_action(state, action)
                except InvalidElementStateException:
                    action = 'skip'
                    action_index = self.actions.index(action)
                except StaleElementReferenceException:
                    break
                self.learn(state_index, action_index, MOVE_REWARD)
                history.append((state_index, action_index))
            try:
                self.driver.implicitly_wait(SLEEP_BETWEEN_INTERVALS * 4)
                self.driver.find_element_by_class_name('Toastify__toast Toastify__toast--success')
            except NoSuchElementException:
                pass
            page_source = self.driver.page_source
            if self.assertion_message in page_source:
                success = True
                episode_reward = POSITIVE_REWARD
            else:
                episode_reward = NEGATIVE_REWARD
            with open('test_cases.txt', 'a') as f:
                if success:
                    f.write(f'\n{"#"*5} TEST CASE PASSED {"#"*5}\n')
                for state_index, action_index in history:
                    self.learn(state_index, action_index, episode_reward)
                    if success:
                        state, action = self.states[state_index], self.actions[action_index]
                        log = f"STATE\t: {state}\nACTION\t: {action}\n\n"
                        f.write(log)
        self.driver.delete_all_cookies()

    def train(self, n_episodes: int):
        epsilon = INITIAL_EPSILON
        episode = 0
        while episode < n_episodes:
            try:
                self.episode(epsilon)
                epsilon -= INITIAL_EPSILON / N_EPISODES
                episode += 1
            except Exception as e:
                print(f'Training ended abruptly due to Error: {e}, Retrying!')
                self.teardown()
                self.initialize_driver()
                time.sleep(SLEEP_BETWEEN_INTERVALS)
                continue
        data = pd.DataFrame(data=self.q_table, index=self.states, columns=self.actions)
        print(data)

    def teardown(self):
        gc.collect()
        self.driver.quit()

class Domain:

    def __init__(self, urls: List[str], inputs: List[List[str]], assertion_messages: List[str]):
        """[summary]

        Args:
            urls (List[str]): [description]
            inputs (List[List[str]]): [description]
            assertion_messages (List[str]): [description]
        """
        self.environment = dict()
        self.initialize_driver()
        for url_, input_, assertion_message_ in zip(urls, inputs, assertion_messages):
            self.environment[url_] = Webpage(url=url_, inputs=input_, assertion_message=assertion_message_, driver=self.driver)
    
    def initialize_driver(self):
        self.driver = wb.Chrome('./backend/chromedriver')

    def train(self, n_episodes: int = N_EPISODES):
        print('\n'.join([str(self.environment[url]) for url in self.environment]))
        for episode in range(n_episodes):
            print(f'Episode: {episode + 1}')
            for url in self.environment:
                self.environment[url].train(n_episodes=1)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-u", "--user", help="Username of the creator for the project", required=True, type=str)
    parser.add_argument("-p", "--project", help="Project name", required=True, type=str)
    args = parser.parse_args()
    try:
        with open(DATA_FILE, 'r') as f:
            DATA = json.load(f)[args.user][args.project]
    except KeyError:
        print(f"Username - '{args.user}' or/and Project - {args.project} do not exist!")
        exit()
    URLS = ['http://localhost:3000']# [d['url'] for d in DATA]
    INPUTS = [['admin', 'password']]# [d['actions'] for d in DATA]
    ASSERTION_MESSAGES = ['Login Success']# [d['terminalState'] for d in DATA]
    domain = Domain(urls=URLS, inputs=INPUTS, assertion_messages=ASSERTION_MESSAGES)
    domain.train()