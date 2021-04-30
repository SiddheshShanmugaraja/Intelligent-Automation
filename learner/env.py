import numpy,os
import pandas as pd
from .automation import Auto

INPUT_DATA_FILE = "../data/input_data.txt"

class Website:
    def __init__(self,site,element="",mode="t"):
        super(Website, self).__init__()
        with open(os.path.join(os.getcwd(), INPUT_DATA_FILE),"r") as f:
            contents = f.read()
        self.action_space = range(len(contents.split('\n'))+1) # +1 for terminal
        self.n_actions = len(self.action_space)
        self.state = 'username'
        if mode == "i":
            self.web = Auto(site,headless=False)
        else:
            self.web = Auto(site,headless=True)
        self._build_page(site)
        self.states = self.web.getstates(site,element)
        self.current_state = self.states[0]
        self.state_actions = []

    def _build_page(self,site):
        self.web.get_site(site)

    def reset(self):
        self.web.refresh()
        self.current_state = self.states[0]
        return self.current_state

    def step(self,action):
        s = self.current_state
        self.state_actions.append((s,action))
        reward,done = self.web.fill(s,action)
        idx = self.states.index(s)
        if idx != len(self.states) - 1:
            idx+=1
            s_ = self.states[idx]
            self.current_state = s_
        else:
            s_ = self.states[0]
            done = True
        self.state_actions.append(("\n"))
        return s_,reward,done
    
    def dump_state_dfn(self):
        df = pd.DataFrame(self.state_actions)
        df.to_csv("./state_actions.csv")
    
    def click_next(self,next_id):
        return self.web.click_next_button(next_id)

    def destroy_site(self):
        self.web.destroy_site()