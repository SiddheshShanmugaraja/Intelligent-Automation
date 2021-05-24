import re, os, json, time
import logging
from learner.env import Website
from learner.brain import QLearningTable
from argparse import ArgumentParser
from yaml import load, dump
try:
    from yaml import CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import Loader, Dumper

with open("backend/config.json", "r") as f:
    config = json.load(f)

INPUT_DATA_FILE = config.get("INPUT_DATA_FILE")
CONFIG_FILE = config.get("CONFIG_FILE")

logging.basicConfig(filename=os.getcwd()+'/../logs/app.log', filemode='w',format='%(asctime)s - %(message)s', datefmt='%d-%b-%y %H:%M:%S')

def update(site,mode):
    """[summary]

    Args:
        site ([type]): [description]
        mode ([type]): [description]
    """
    count = 0
    site_over = False
    iteration = 200
    for episode in range(iteration):
        # initial observation
        logging.warning("Episode: "+str(count+1))
        # print("Episode: ",count+1)
        observation = env.reset()
        try:
            while True:
                # fresh env
                # env.render()
                # RL choose action based on observation
                action = RL.choose_action(str(observation))

                # RL take action and get next observation and reward
                observation_, reward, done = env.step(action)

                # RL learn from this transition
                RL.learn(str(observation), action, reward, str(observation_))
                
                # swap observation
                observation = observation_
                # print(reward,done)
                # break while loop when end of this episode
                if done:
                    # RL.save_each_value(model_name,episode)
                    if reward == 3:
                        site_over = True
                    break
        except KeyboardInterrupt:
            break
        if site_over:
            logging.warning("Page training completed in "+str(episode)+"th episode")
            break
        count+=1
        # time.sleep(1)
    # end of game
    if args.mode == 't':
        env.dump_state_dfn()

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("-m", "--mode", help="Mode can be either t for training and i for inference",default='t', type=str)
    parser.add_argument("-d", "--data", help="data input path", type=str, default=INPUT_DATA_FILE)
    parser.add_argument("-n", "--model_name", help="Model name to save for training mode", type=str, default='test')
    parser.add_argument("-r", "--routes", help="Routes needed for training mode accepts yml files", type=str, default=CONFIG_FILE)
    parser.add_argument("-vt", "--validator_type", help="Validator type can be either individual or global", type=str, default="individual")    
    args = parser.parse_args()
    start_time = time.time()
    mode = args.mode
    model_name = args.model_name
    assert (args.routes !=None),"Specify routes for training"
    assert (args.model_name !=None),"Model name is required"
    assert (args.validator_type !=None),"Validator type is required"
    model_path = os.path.join(os.getcwd()+"/models/"+args.model_name)
    if not os.path.exists(INPUT_DATA_FILE):
        print("Input data cannot be empty")
    if (mode == "t") and (not os.path.exists(model_path)):
        os.mkdir(model_path)
        if not os.path.exists(model_path+"/routes"):
            os.mkdir(model_path+"/routes")
        if not os.path.exists(model_path+"/logs"):
            os.mkdir(model_path+"/logs")
    f = open(args.routes)
    sites = []
    finished_sites = []
    data = load(f.read(), Loader=Loader)
    count = 0
    for d in data:
        urls = d["start_url"]
        current_url = d['start_url']
        next_id = None
        if "minor_goal" in d:
            next_id = d['minor_goal']
        while current_url not in finished_sites:
            site = current_url
            selector_element = d['main_selector']
            if site:
                next_url = None
                # try:
                if True:
                    env = Website(site,selector_element,mode=mode)
                # except Exception as e:
                #     message = f"Training has been terminated due to this following error :{e} -terminated"
                #     print(message)
                #     logging.error(message)
                #     exit()
                RL = QLearningTable(actions=list(range(env.n_actions)),model_name=args.model_name,mode=mode,page_count=count)
                time.sleep(0.01)
                update(site,mode)
                finished_sites.append(current_url)
                if next_id:
                    print("Next page:", next_id)
                    next_url = env.click_next(next_id)
                print("Next URL......", next_url)
                if next_url:
                    current_url = next_url
                if mode == "t":
                    RL.save_q_values(args.model_name,model_path)
                count +=1
    env.destroy_site()
    time_taken = time.time() - start_time
    logging.warning("completed")
    print("Total time taken",round(time_taken),'secs')