import numpy as np
import pandas as pd
import os

class QLearningTable:
    def __init__(self, actions, learning_rate=0.01, reward_decay=0.9, e_greedy=0.9,mode=None,csv=None,model_name=None,page_count=0):
        self.actions = actions  # a list
        self.lr = learning_rate
        self.gamma = reward_decay
        self.epsilon = e_greedy
        self.model_path = f'../models/{model_name}/maze.csv'
        self.q_table = pd.DataFrame(columns=self.actions, dtype=np.float64)
        if mode == "t":
            if os.path.exists(os.path.join(os.getcwd(),self.model_path)):
                if page_count != 0:
                    self.q_table = pd.read_csv(os.path.join(os.getcwd(),self.model_path),index_col=0)
                elif page_count == 0:
                    os.remove(os.path.join(os.getcwd(),self.model_path))
        else:
            print("Inference mode")
            if os.path.exists(os.path.join(os.getcwd(),self.model_path)):
                self.epsilon = 1
                self.q_table = pd.read_csv(os.path.join(os.getcwd(),self.model_path),index_col=0)
            else:
                print("Cannot infer when there is no q learning model inside the model name")
        self.q_table.iloc[:,0:5].astype(np.float)
        try:
            self.q_table.columns = self.actions
        except ValueError as e:
            print("Value error",str(e))
            self.q_table = pd.DataFrame(columns=self.actions, dtype=np.float64)
            self.q_table.columns = self.actions
    def choose_action(self, observation):
        self.check_state_exist(observation)
        # action selection
        if np.random.uniform() < self.epsilon:
            # choose best action
            state_action = self.q_table.loc[observation, :]
            # some actions may have the same value, randomly choose on in these actions
            action = np.random.choice(state_action[state_action == np.max(state_action)].index)
        else:
            # choose random action
            action = np.random.choice(self.actions)
        return action

    def learn(self, s, a, r, s_):
        self.check_state_exist(s_)
        q_predict = self.q_table.loc[s, a]
        if s_ != 'terminal':
            q_target = r + self.gamma * self.q_table.loc[s_, :].max()  # next state is not terminal
        else:
            q_target = r  # next state is terminal
        self.q_table.loc[s, a] += self.lr * (q_target - q_predict)  # update

    def check_state_exist(self, state):
        # print("Checking states",self.q_table)
        if state not in self.q_table.index:
            # append new state to q table
            self.q_table = self.q_table.append(
                pd.Series(
                    [0]*len(self.actions),
                    index=self.q_table.columns,
                    name=state,
                )
            )
    
    
    def save_each_value(self,model_name,episode):
        self.q_table.to_csv(os.getcwd()+'/../models/{}/logs/log_{}.csv'.format(model_name,episode))
        
    def save_q_values(self,filename,path):
        # filename = "Unnamed" if filename == '' else filename
        self.q_table.to_csv(os.getcwd()+'/../models/{}/maze.csv'.format(filename))