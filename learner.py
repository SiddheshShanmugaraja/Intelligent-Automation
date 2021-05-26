import os, json, random, time
import pandas as pd
import numpy as np 
from selenium import webdriver
from argparse import ArgumentParser
from typing import List, Dict, Tuple, Optional

with open("./backend/config.json", "r") as f:
    config = json.load(f)

pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)

LEARNING_RATE = 0.1
GAMMA = 0.9
EPSILON = 0.9

MOVE_REWARD = -2
POSITIVE_REWARD = 10
NEGATIVE_REWARD = -5

N_EPISODES = 10
SLEEP_BETWEEN_INTERVALS = 0.1

CHROME_DRIVER = config.get("CHROME_DRIVER")
MODELS_DIR = config.get("MODELS_DIR")
DATA_FILE = config.get("DATA_FILE")
CSV_EXTENSION = '.csv'

class QLearningTable:

    def __init__(self, states: List, actions: List, name: str, page_number: int, learning_rate: float = LEARNING_RATE, gamma: float = GAMMA, epsilon: float = EPSILON, epsilon_decay: float = EPSILON / N_EPISODES):
        self.states = states 
        self.actions = actions
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.name = name
        self.page_number = page_number
        if not os.path.exists(os.path.join(MODELS_DIR, self.name, f"Page:{self.page_number}-Episode:{N_EPISODES}{CSV_EXTENSION}")):
            self.table = np.zeros((len(states), len(actions)))
        else:
            df = pd.read_csv(os.path.join(MODELS_DIR, self.name, f"Page:{self.page_number}-Episode:{N_EPISODES}{CSV_EXTENSION}"), index_col='Unnamed: 0')
            self.table = df.values

    def learn(self, state_index: int, action_index: int, reward: int, success: bool = False) -> None:
        current_q = self.table[state_index, action_index]
        if state_index + 1 < len(self.states):
            max_future_q = self.table[state_index + 1, :].max()
        else:
            max_future_q = POSITIVE_REWARD
        new_q = (1 - self.learning_rate) * current_q + self.learning_rate * (reward + self.gamma * max_future_q)
        self.table[state_index, action_index] = new_q

    def save_table(self, episode=0):
        if not os.path.exists(MODELS_DIR):
            os.mkdir(MODELS_DIR)
        if not os.path.exists(os.path.join(MODELS_DIR, self.name)):
            os.mkdir(os.path.join(MODELS_DIR, self.name))
        df = pd.DataFrame(data=self.table, index=self.states, columns=self.actions)
        df.to_csv(os.path.join(MODELS_DIR, self.name, f"Page{self.page_number}-Episode{episode}{CSV_EXTENSION}"))
        return df

    def decay_epsilon(self):
        self.epsilon -= self.epsilon_decay

class Webpage:

    def __init__(self, name: str, page_number: int, url: str, states: List, actions: List, terminal_state: str, driver=None):
        self.url = url
        if not driver:
            self.driver = webdriver.Chrome(executable_path=CHROME_DRIVER)
        else:
            self.driver = driver
        self.q_table = QLearningTable(states=states, actions=actions, name=name, page_number=page_number)
        self.terminal_state = terminal_state
    
    def fill_page(self):
        success = False
        while not success:
            self.driver.get(self.url)
            history = list()
            actions_copy = self.q_table.actions.copy()
            for state_index, state in enumerate(self.q_table.states):
                if np.random.random() > self.q_table.epsilon:
                    action = self.q_table.actions[self.q_table.table[state_index].argmax()]
                    if action not in actions_copy:
                        action = random.choice(actions_copy)
                else:
                    action = random.choice(actions_copy)
                action_index = self.q_table.actions.index(action)
                input_element = self.driver.find_element_by_css_selector(state)
                input_element.clear()
                input_element.send_keys(action)
                history.append((state_index, action_index))
                actions_copy.remove(action)
                self.q_table.learn(state_index=state_index, action_index=action_index, reward=MOVE_REWARD, success=success)
                if (state_index + 1) == len(self.q_table.states):
                    self.driver.find_element_by_css_selector(self.terminal_state).click()
                    time.sleep(SLEEP_BETWEEN_INTERVALS)
                    current_url = self.driver.current_url[:-1] if self.driver.current_url[-1] == '/' else self.driver.current_url
                    page_url = self.url[:-1] if self.url[-1] == '/' else self.url
                    if current_url != page_url:
                        success = True
                        for state_index, action_index in history:
                            self.q_table.learn(state_index=state_index, action_index=action_index, reward=POSITIVE_REWARD, success=success)
                    else:
                        for state_index, action_index in history:
                            self.q_table.learn(state_index=state_index, action_index=action_index, reward=NEGATIVE_REWARD, success=success)
        self.q_table.decay_epsilon()

    def train(self, n_episodes):
        for episode in range(1, n_episodes + 1):
            print(f'Episode: {episode}')
            self.fill_page()    
        table = self.q_table.save_table(episode=episode)
        print('\nFinal Q Table')
        print(table)
                        
    def inference(self):
        if self.driver.current_url != self.url:
            self.driver.get(self.url)
        for state_index, state in enumerate(self.q_table.states):
            action_index = self.q_table.table[state_index].argmax()
            action = self.q_table.actions[action_index]
            input_element = self.driver.find_element_by_css_selector(state)
            input_element.clear()
            input_element.send_keys(action)
        self.driver.find_element_by_css_selector(self.terminal_state).click()

    def to_dict(self):
        return dict(name=self.name, url=self.url, states=self.states, actions=self.actions, terminal_state=self.terminal_state)

class Domain:

    def __init__(self, name: str, urls: List, states: List[List], actions: List[List], terminal_states: List):
        self.driver = webdriver.Chrome(executable_path=CHROME_DRIVER)
        self.environment = dict()
        for index_, (url, state, action, terminal_state) in enumerate(zip(urls, states, actions, terminal_states), 1):
            self.environment[url] = Webpage(url=url, states=state, actions=action, terminal_state=terminal_state, name=name, page_number=index_, driver=self.driver)
    
    def train(self, n_episodes):
        prev_url = None
        for url in self.environment:
            if prev_url:
                self.environment[url].inference()
            print(f"Training - '{self.environment[url].url}'")
            self.environment[url].train(n_episodes=n_episodes)
            prev_url = self.environment[url]

    def inference(self):
        for url in self.environment:
            print(f"Inference - '{self.environment[url].url}'")
            self.environment[url].inference()

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-m", "--mode", help="Mode, either train, inference or both", choices=["both", "train", "inference"], default="both", type=str)
    parser.add_argument("-u", "--user", help="Username of the creator for the project", required=True, type=str)
    parser.add_argument("-p", "--project", help="Project name", required=True, type=str)
    args = parser.parse_args()

    MODE = args.mode
    USERNAME = args.user # 'admin'
    PROJECT_NAME = args.project # 'localhost'

    if args.mode == 'train':
        train = True
        inference = False 
    elif args.mode == 'inference':
        train = False
        inference = False
    else:
        train = True
        inference = True

    with open(DATA_FILE, 'r') as f:
        DATA = json.load(f)[USERNAME][PROJECT_NAME]

    website = Domain(name=PROJECT_NAME, urls=[d['url'] for d in DATA], states=[d['states'] for d in DATA], actions=[d['actions'] for d in DATA], terminal_states=[d['terminal_state'] for d in DATA])
    if train:
        website.train(N_EPISODES)
    if inference:
        website.inference()