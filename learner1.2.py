import gc
import time
import random
import selenium
import numpy as np
import pandas as pd
from numpy.linalg import norm
from selenium import webdriver as wb 
from typing import List, Dict, Tuple, Optional, Type
from urllib3.exceptions import ProtocolError, MaxRetryError
from requests.exceptions import ConnectionError
from selenium.common.exceptions import NoSuchElementException, InvalidElementStateException, StaleElementReferenceException

pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)

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

    def __init__(self, url: str, inputs: List, assertion_message: str, driver: Optional[Type[ selenium.webdriver.chrome.webdriver.WebDriver]] = None): 
        """[summary]

        Args:
            url (str): [description]
            inputs (List): [description]
            assertion_message (str): [description]
            driver (Optional[Type[ selenium.webdriver.chrome.webdriver.WebDriver]], optional): [description]. Defaults to None.
        """
        self.url = url
        if driver:
            self.driver = driver
        else:
            self.initialize_driver()
        self.states = self.get_states()
        self.actions = ['skip', 'click_button'] + [f'set_value={i}' for i in inputs] 
        self.assertion_message = assertion_message
        self.q_table = np.zeros((len(self.states), len(self.actions)))
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

    def set_value(self, element_id, value):
        self.driver.implicitly_wait(SLEEP_BETWEEN_INTERVALS)
        element = self.driver.find_element_by_id(element_id)
        element.clear()
        element.send_keys(value)

    def click_button(self, element_id): 
        self.driver.implicitly_wait(SLEEP_BETWEEN_INTERVALS)
        element = self.driver.find_element_by_id(element_id)
        try:
            element.clear()
        except InvalidElementStateException:
            pass
        self.driver.execute_script("arguments[0].click();", element)

    def take_action(self, state, action):
        if self.driver.current_url != self.url:
            self.driver.get(self.url)
        if 'set_value' in action:
            value = action.split('=')[-1]
            self.set_value(state, value)
        elif 'click_button' in action:
            self.click_button(state)

    def learn(self, state_index, action_index, reward):
        current_q = self.q_table[state_index, action_index]
        if state_index < len(self.states) - 1:
            max_future_q = self.q_table[state_index + 1, :].max()
        else:
            max_future_q = POSITIVE_REWARD
        new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + GAMMA * max_future_q)
        self.q_table[state_index, action_index] = new_q
        return self.q_table

    def episode(self, epsilon):
        success = False
        while not success:
            history = list()
            self.driver.get(self.url)
            for state_index, state in enumerate(self.states):
                if np.random.random() > epsilon:
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
                self.driver.implicitly_wait(SLEEP_BETWEEN_INTERVALS)# * 4)
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

    def train(self, n_episodes):
        epsilon = INITIAL_EPSILON
        episode = 0
        while episode < n_episodes:
            try:
                print(f'\nEpisode: {episode + 1}')
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

    def __init__(self, urls: List, inputs: List[List], assertion_messages: List):
        self.environment = dict()
        self.initialize_driver()
        for url_, input_, assertion_message_ in zip(urls, inputs, assertion_messages):
            self.environment[url_] = Webpage(url=url_, inputs=input_, assertion_message=assertion_message_, driver=self.driver)
    
    def initialize_driver(self):
        self.driver = wb.Chrome('./backend/chromedriver')

    def train(self, n_episodes=N_EPISODES):
        for url in self.environment:
            print(self.environment[url])
            print(f"Training - '{self.environment[url].url}'")
            self.environment[url].train(n_episodes=n_episodes)

if __name__ == '__main__':
    URLS = ['http://127.0.0.1:3000/', 'http://127.0.0.1:3000/search/']
    INPUTS = [['admin', 'password'], ['10']]
    ASSERTION_MESSAGES = ['Login Success', 'Credits transferred from admin to user1 successfully!']
    domain = Domain(urls=URLS, inputs=INPUTS, assertion_messages=ASSERTION_MESSAGES)
    domain.train()