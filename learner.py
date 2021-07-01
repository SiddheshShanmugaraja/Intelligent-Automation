import os
import time
import random
import selenium
import numpy as np
import pandas as pd
import multiprocessing
from backend.utils import timeit
from selenium import webdriver as wb 
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from typing import List, Tuple, Optional, Type, Dict
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, InvalidElementStateException, StaleElementReferenceException, TimeoutException

# Training constants
GAMMA = 0.9
N_EPISODES = 10
LEARNING_RATE = 0.1
INITIAL_EPSILON = 1
SLEEP_BETWEEN_INTERVALS = 0.25

# Reward schemes
MICRO_REWARD = 2
MINOR_REWARD = 20
MOVE_PENALTY = -4
POSITIVE_REWARD = 32
NEGATIVE_REWARD = -5

# Toggle this to train with or without the browser 
HEADLESS_BROWSING = False
options = Options()
if HEADLESS_BROWSING:
    options.add_argument('--headless') 

# Clear console output window
clear_console = lambda : os.system('cls' if os.name=='nt' else 'clear')

class Website: 

    def __init__(self, urls: List[str], inputs: List[str], assertion_message: str, states: Optional[List[str]] = None, n_jobs: int = 3) -> None: 
        """Initializer for the Website object

        Args:
            urls (List[str]): Set of urls that the agent has to be trained on in appropriate order.
            inputs (List[str]): Inputs required by the agent to interact with the webpages.
            assertion_message (str): Assertion message to check for Major Assertion.
            states (Optional[List[str]], optional): States that the agent can interact with. Defaults to None. If None, it extracts all the DOM elements with an 'id' attribute.
            n_jobs (int, optional): Number of processes or browsers that will be used to train the agent. Defaults to 3.
        """
        self.urls =[url.replace('localhost', '127.0.0.1') if 'localhost' in url else url for url in urls]
        self.n_jobs = n_jobs
        self.drivers = [self.initialize_driver() for _ in range(self.n_jobs)]
        if states:
            self.states = states 
        else:
            self.states = self.get_states()
        self.actions = ['skip', 'click_button'] + [f'set_value={i}' for i in inputs] #+ [f'slide_button={i}' for i in inputs if isinstance(convert_to_float(i), float)] + [f'drag_and_drop={i}' for i in self.states] 
        self.assertion_message = assertion_message
        self.q_table = np.zeros((len(self.states), len(self.actions)))
        self.waits = [WebDriverWait(driver, 2) for driver in self.drivers]
        self.action_chains = [ActionChains(driver) for driver in self.drivers]

    def initialize_driver(self) -> Type[selenium.webdriver.chrome.webdriver.WebDriver]:
        """Initializes the Webdriver object.

        Returns:
            Type[selenium.webdriver.chrome.webdriver.WebDriver]: Selenium Webdriver object.
        """
        return wb.Chrome('./backend/chromedriver', options=options)

    def __repr__(self) -> str:
        """Dunder method for to override the string representation of the object.

        Returns:
            str: String representation of the Website object.
        """
        return f'\n\nURLS\t: {self.urls}\n\nSTATES\t: {list(map(lambda x: x.split("@")[-1], self.states))}\n\nACTIONS\t: {self.actions}\n\n'

    def get_ids(self, url: str, n_job: int = 0) -> List[str]:
        """Extracts DOM element IDs and shadow DOM element IDs for a given URL. 

        Args:
            url (str): URL to extract the DOM element IDs from.

        Returns:
            List[str]: List of the DOM element IDs ectracted from the URL.
        """
        def expand_shadow_element(element: Type[selenium.webdriver.remote.webelement.WebElement]):
            shadow_root = self.drivers[n_job].execute_script('return arguments[0].shadowRoot', element)
            return shadow_root

        self.drivers[n_job].get(url)
        elements = self.drivers[n_job].find_elements_by_xpath('//*[@id]')
        element_ids = list()
        for element in elements:
            element_ids.append(f'{url}@{element.get_attribute("id")}')
            shadow_section = expand_shadow_element(element)
            if shadow_section:
                shadow_elements = shadow_section.find_elements_by_xpath('//*[@id]')
                element_ids += [f'{url}@{shadow_element.get_attribute("id")}' for shadow_element in shadow_elements]
        return element_ids

    def get_states(self) -> List[str]:
        """Extracts DOM states with 'id' attribute.

        Returns:
            List[str]: Set of states with the url prefix.
        """
        states = list()
        for url in self.urls:
            states += self.get_ids(url)         
        return states

    def click_button(self, element_id: str, n_job: int) -> Type[selenium.webdriver.remote.webelement.WebElement]: 
        """Finds and clicks on the element with id=element_id.

        Args:
            element_id (str): ID of the DOM element.
            n_job (int): The process id to choose the correct browser for running the action.

        Returns:
            Type[selenium.webdriver.remote.webelement.WebElement]: Returns the element object.
        """
        try:
            element = self.waits[n_job].until(EC.element_to_be_clickable((By.ID, element_id)))
        except TimeoutException:
            element = self.drivers[n_job].find_element_by_id(element_id)
        
        try:
            element.click()
        except InvalidElementStateException:
            self.action_chains[n_job].move_to_element(element).click().perform()
        
        return element

    def set_value(self, element_id: str, value: str, n_job: int) -> Type[selenium.webdriver.remote.webelement.WebElement]:
        """Sets value to an element whose id=element_id.

        Args:
            element_id (str): ID of the DOM element.
            value (str): Value to set in the field.
            n_job (int): The process id to choose the correct browser for running the action.

        Returns:
            Type[selenium.webdriver.remote.webelement.WebElement]: Returns the element object.
        """
        self.drivers[n_job].implicitly_wait(SLEEP_BETWEEN_INTERVALS)
        element = self.drivers[n_job].find_element_by_id(element_id)
        element.clear()
        element.send_keys(value)
        return element

    def slide_button(self, element_id: str, x_offset: int, y_offset: int, n_job: int) -> Type[selenium.webdriver.remote.webelement.WebElement]:
        """Slides a slider button on a webpage whose id=element_id.

        Args:
            element_id (str): ID of the DOM element.
            x_offset (int): Value to slide in the X-direction.
            y_offset (int): Value to slide in the Y-direction.
            n_job (int): The process id to choose the correct browser for running the action.

        Returns:
            Type[selenium.webdriver.remote.webelement.WebElement]: Returns the element object.
        """
        element = self.waits[n_job].until(EC.element_to_be_clickable((By.ID, element_id)))
        self.action_chains[n_job].click_and_hold(element).move_by_offset(x_offset, y_offset).release().perform()
        return element

    def drag_and_drop(self, source_element_id: str, target_element_id: str, n_job: int) -> Type[selenium.webdriver.remote.webelement.WebElement]: 
        """Drags a source element with id=source_element_id and drops it on a target element with id=target_element_id.

        Args:
            source_element_id (str): ID of the source DOM element.
            target_element_id (str): ID of the target DOM element.
            n_job (int): The process id to choose the correct browser for running the action.

        Returns:
            Type[selenium.webdriver.remote.webelement.WebElement]: Returns the element object.
        """
        source = self.waits[n_job].until(EC.element_to_be_clickable((By.ID, source_element_id)))
        target = self.waits[n_job].until(EC.element_to_be_clickable((By.ID, target_element_id)))
        self.action_chains[n_job].drag_and_drop(source, target).perform()
        return source

    def take_action(self, state: str, action: str, n_job: int) -> Type[selenium.webdriver.remote.webelement.WebElement]:
        """Choose appropriate actions by using various methods defined for the Website object.

        Args:
            state (str): ID of the DOM element to perform the action on.
            action (str): Name of the action that you want to perform on the state
            n_job (int): The process id to choose the correct browser for running the action.

        Returns:
            Type[selenium.webdriver.remote.webelement.WebElement]: Returns the element object.
        """
        if 'set_value' in action:
            value = action.split('=')[-1]
            return self.set_value(state, value, n_job)
        elif 'click_button' in action:
            return self.click_button(state, n_job)
        elif 'slide_button' in action:
            value = action.split('=')[-1]
            return self.slide_button(state, value, value, n_job)
        elif 'drag_and_drop' in action:
            target_element_id = action.split('=')[-1]
            return self.drag_and_drop(state, target_element_id, n_job)

    def choose_action(self, epsilon: float, state: Optional[str] = None):
        if (np.random.random() > epsilon) and (state != None):
            action = self.actions[self.q_table[self.states.index(state)].argmax()]
        else:
            action = random.choice(self.actions)
        return action

    def step(self, state: str, epsilon: float, n_job: int, action: Optional[str] = None) -> Tuple[Type[selenium.webdriver.remote.webelement.WebElement],int]:
        """Performs one step in the Website environment while training.

        Args:
            state (str): ID of the DOM element to perform the action on.
            state_index (int): Index of the state from the self.states attribute
            epsilon (float): Epsilon value for the E-Greedy algorithm.
            n_job (int): The process id to choose the correct browser for running the action. 
            action (str, optional): Action to be conducted if not assigned will use the self.choose_action() function.

        Returns:
            Tuple[Type[selenium.webdriver.remote.webelement.WebElement],int]:  Returns the element object and the index for the action conducted.
        """
        if not action:
            action = self.choose_action(epsilon, state)
        action_index = self.actions.index(action)
        try:
            print(f'\nstate \t-->\t {state}\naction \t-->\t {action}')
            element = self.take_action(state, action, n_job)
        except (InvalidElementStateException, StaleElementReferenceException):
            element = action = 'skip'
            action_index = self.actions.index(action)
        return element, action_index

    def learn(self, state_index: int, action_index: int, reward: int) -> Type[np.ndarray]:
        """Updates the Q-Table with the appropriate rewards by using the Bellman's algorithm.

        Args:
            state_index (int): Index of the state where the action was performed w.r.t to the Q-Table.
            action_index (int): Index of the action that was performed w.r.t to the Q-Table.
            reward (int): Reward assigned for the current step.

        Returns:
            Type[np.ndarray]: Returns the Q-Table.
        """
        current_q = self.q_table[state_index, action_index]
        if state_index < len(self.states) - 1:
            max_future_q = self.q_table[state_index + 1, :].max()
        else:
            max_future_q = POSITIVE_REWARD
        new_q = (1 - LEARNING_RATE) * current_q + LEARNING_RATE * (reward + GAMMA * max_future_q)
        self.q_table[state_index, action_index] = new_q
        return self.q_table

    @timeit
    def micro_assertion(self, n_job: int, element: Optional[Type[selenium.webdriver.remote.webelement.WebElement]] = None) -> bool:
        """Checks for Data Mismatch error in the given element.

        Args:
            n_job (int): The process id to choose the correct browser for running the action. 
            element (Optional[Type[selenium.webdriver.remote.webelement.WebElement]], optional): Element whose sub tree would be checked for the data mismatch error. Defaults to None, if None checks for the Data Mismatch error from the page source.

        Returns:
            bool: Returns False if Data Mismatch error exists in the element else True.
        """
        if element != None:
            return True if (isinstance(element, selenium.webdriver.remote.webelement.WebElement) and ('Data mismatch' not in element.get_attribute('innerHTML'))) else False
        else:
            return True if ('Data mismatch' not in self.drivers[n_job].page_source) else False

    @timeit
    def minor_assertion(self, n_job: int) -> bool:
        """Checks for success Toast element.

        Args:
            n_job (int): The process id to choose the correct browser for running the action. 
            
        Returns:
            bool: Returns True if success Toast error exists else False.
        """
        try:
            self.drivers[n_job].implicitly_wait(SLEEP_BETWEEN_INTERVALS)
            self.drivers[n_job].find_element_by_class_name('Toastify__toast Toastify__toast--success')
            return True
        except NoSuchElementException:
            return False

    @timeit
    def major_assertion(self, n_job: int) -> bool:
        """Checks for Assertion message in the page source.

        Args:
            n_job (int): The process id to choose the correct browser for running the action. 
            
        Returns:
            bool: Returns True if assertion message exists in page source else False.
        """
        page_source = self.drivers[n_job].page_source
        if self.assertion_message in page_source:
            return True
        else:
            return False

    def episode(self, epsilon: float, n_job: int, episode: int) -> None:
        """Cycles through the states and performs action and updates the Q-Table to train the RL agent in the defined environment.

        Args:
            epsilon (float): Epsilon value for the E-Greedy algorithm.
            n_job (int): The process id to choose the correct browser for running the action. 
            episode (int): The current episode number.
        """
        major_success = False
        self.drivers[n_job].get(self.urls[0])
        while not major_success:
            history = list()
            print(f'Episode: {episode + 1}')
            print(self)
            for state_index, state in enumerate(self.states):
                
                state_url, state = state.split('@')
                
                if state_url != self.drivers[n_job].current_url:
                    print('URL Does not match', state_url, self.drivers[n_job].current_url)
                    continue
                
                element, action_index = self.step(state, epsilon, n_job)

                micro_success = self.micro_assertion(n_job, element)
                if micro_success:
                    print('Micro Assertion Passed!')

                minor_success = self.minor_assertion(n_job)
                if minor_success:
                    print('Minor Assertion Passed!')

                history.append((state_index, action_index))
            
                major_success = self.major_assertion(n_job)
                if major_success:
                    print('Major Assertion Passed!')
                    for state_index, action_index in history:
                        self.learn(state_index, action_index, (major_success * POSITIVE_REWARD) + (minor_success * MINOR_REWARD) + (micro_success * MICRO_REWARD) + MOVE_PENALTY)
                    clear_console()
                    break
                else:
                    for state_index, action_index in history:
                        self.learn(state_index, action_index, (major_success * POSITIVE_REWARD) + (minor_success * MINOR_REWARD) + (micro_success * MICRO_REWARD) + MOVE_PENALTY)

    def train(self, n_episodes: int, n_job: int, epsilon: float = INITIAL_EPSILON) -> None:
        """Performs the training for a given number of episodes.

        Args:
            n_episodes (int): Number of episodes to train the RL agent.
            n_job (int): The process id to choose the correct browser for running the action. 
            epsilon (float, optional): Initial epsilon value for the E-Greedy algorithm. Defaults to INITIAL_EPSILON.
        """
        episode = 0
        while episode < n_episodes:
            try:
                self.episode(epsilon, n_job, episode)
                # Decay the epsilon value.
                epsilon -= INITIAL_EPSILON / N_EPISODES
                episode += 1
            except Exception as e:
                print(f'Training ended abruptly in process - {n_job}\n{e}\nRetrying!')
                time.sleep(SLEEP_BETWEEN_INTERVALS * 4)
                continue
        data = pd.DataFrame(data=self.q_table, index=self.states, columns=self.actions)
        print(data)

    def multi_process(self, n_episodes: int = N_EPISODES) -> None: 
        """Initializes the processes to start multiple training browsers for the RL Agent.

        Args:
            n_episodes (int, optional):  Number of episodes to train the RL agent. Defaults to N_EPISODES.
        """
        processes = [multiprocessing.Process(target=self.train, kwargs=dict(n_episodes=n_episodes, n_job=n_job)) for n_job in range(self.n_jobs)]
        for process in processes:
            process.start()
        for process in processes: 
            process.join()

    def demo(self, data: Dict, n_job: int = 0):
        self.drivers[n_job].get(self.urls[n_job])
        for state, action in data:
            self.step(state=state, action=action, n_job=n_job, epsilon=0)
            time.sleep(SLEEP_BETWEEN_INTERVALS*4)

if __name__ == '__main__':
    
    URLS = ['http://localhost:3000/', 'http://localhost:3000/home', 'http://localhost:3000/profile']
    INPUTS = ['admin', 'password', 'James Bourne', 'UK', 'World class spy at British Secret Service', '05/07/1998', '1000000008']
    ASSERTION_MESSAGES = 'Profile update successful!'
    
    app = Website(urls=URLS, inputs=INPUTS, assertion_message=ASSERTION_MESSAGES, n_jobs=1)
    app.multi_process()
    # data = [ 
    #         ('signup','skip'), 
    #         ('name','set_value=admin'),
    #         ('password','set_value=password'), 
    #         ('login','click_button'), 
    #         ('side-toggle','click_button'), 
    #         ('profile','click_button'), 
    #         ('name','set_value=James Bourne'), 
    #         ('dob','set_value=05/07/1998'), 
    #         ('country','set_value=UK'),
            
    #         ('female','click_button'), 
    #         ('other','click_button'), 
    #         ('male','click_button'), 

    #         ('devices','skip'), 
    #         ('Mobile','click_button'),
    #         ('Computer','click_button'), 
    #         ('Tablet','click_button'), 
    #         ('Mobile','click_button'),
    #         ('Computer','click_button'), 
    #         ('Tablet','click_button'), 
    #         ('phone','set_value=1000000008'), 
    #         ('profilepicture','skip'), 
    #         ('about','set_value=World class spy at British Secret Service'), 
    #         ('update','click_button')
    #         ]
    # app.demo(data)