# Intelligent Automation

Instructions to run the app on localhost:

**Setup:-**  
Clone the repository to your loacl machine
```
$git clone https://github.com/chirag-optisol/Intelligent-Automation.git
```

Install essential python libraries
```
$pip install -r requirements.txt
```

Move to the frontend folder and install necessary npm packages
```
$cd frontend
$npm i
```

**Run:-**  
To start the backend Flask server
```
$python main.py
```

To start the Frontend
```
$cd frontend
$npm start
```

## Q Learning:

<p align="justify">Given a State recommend/predict an action in a pre-defined environment based on Q Values. When the RL Agent Interacts with the environment while training, we have to update the Q Values such that, running a certain chain of actions gives us a desirable outcome. We achieve that by giving rewards to the agent for achieveing a certain long term goal.</p>

### Simplitic Overview
Reference: [Free Code Camp](https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/)

<p align="justify">Let’s say that a robot has to cross a maze and reach the end point. There are mines, and the robot can only move one tile at a time. If the robot steps onto a mine, the robot is dead. The robot has to reach the end point in the shortest time possible.</p>

The scoring/reward system is as below:

- The robot loses 1 point at each step. This is done so that the robot takes the shortest path and reaches the goal as fast as possible.
- If the robot steps on a mine, the point loss is 100 and the game ends.
- If the robot gets power ⚡️, it gains 1 point.
- If the robot reaches the end goal, the robot gets 100 points.

<p align="justify">Now, the obvious question is: How do we train a robot to reach the end goal with the shortest path without stepping on a mine?</p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/3JXI06jyHegMS1Yx8rhIq64gkYwSTM7ZhD25"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>
	
**Introducing the Q-Table**
<p align="justify">Q-Table is just a fancy name for a simple lookup table where we calculate the maximum expected future rewards for action at each state. Basically, this table will guide us to the best action at each state.</p>	
<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/CcNuUwGnpHhRKkERqJJ6xl7N2W8jcl1yVdE8"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

<p align="justify">There will be four numbers of actions at each non-edge tile. When a robot is at a state it can either move up or down or right or left. So, let’s model this environment in our Q-Table. In the Q-Table, the columns are the actions and the rows are the states.</p>
<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/AjVvggEquHgsnMN8i4N35AMfx53vZtELEL-l"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

<p align="justify">Each Q-table score will be the maximum expected future reward that the robot will get if it takes that action at that state. This is an iterative process, as we need to improve the Q-Table at each iteration. But how do we calculate the values of the Q-table? Are the values available or predefined? To learn each value of the Q-table, we use the Q-Learning algorithm.</p>

<p align="center"><a href="https://www.codecogs.com/eqnedit.php?latex=\begin{*align}&space;\text{}\\&space;\text{Q}&space;(s_{t},&space;a_{t})&space;=&space;(1&space;-&space;\eta)&space;*&space;(Q(s_{t-1},a_{t-1}))&space;&plus;&space;\eta&space;*&space;(\alpha(s_{t})&space;&plus;&space;\gamma&space;*&space;max(Q(s_{t&plus;1})))\\&space;\text{}\\&space;\text{Q&space;=&space;Q-Learning&space;Function}\\&space;\text{s&space;=&space;state}\\&space;\text{a&space;=&space;action}\\&space;\text{t&space;=&space;current&space;timestep}\\&space;\eta&space;=&space;\text{Learning&space;Rate}\\&space;\alpha&space;=&space;\text{Reward&space;for&space;current&space;state}\\&space;\gamma&space;=&space;\text{Discount&space;Factor}&space;\end{*align}" target="_blank"><img src="https://latex.codecogs.com/gif.latex?\begin{*align}&space;\text{}\\&space;\text{Q}&space;(s_{t},&space;a_{t})&space;=&space;(1&space;-&space;\eta)&space;*&space;(Q(s_{t-1},a_{t-1}))&space;&plus;&space;\eta&space;*&space;(\alpha(s_{t})&space;&plus;&space;\gamma&space;*&space;max(Q(s_{t&plus;1})))\\&space;\text{}\\&space;\text{Q&space;=&space;Q-Learning&space;Function}\\&space;\text{s&space;=&space;state}\\&space;\text{a&space;=&space;action}\\&space;\text{t&space;=&space;current&space;timestep}\\&space;\eta&space;=&space;\text{Learning&space;Rate}\\&space;\alpha&space;=&space;\text{Reward&space;for&space;current&space;state}\\&space;\gamma&space;=&space;\text{Discount&space;Factor}&space;\end{*align}" title="\begin{*align} \text{}\\ \text{Q} (s_{t}, a_{t}) = (1 - \eta) * (Q(s_{t-1},a_{t-1})) + \eta * (\alpha(s_{t}) + \gamma * max(Q(s_{t+1})))\\ \text{}\\ \text{Q = Q-Learning Function}\\ \text{s = state}\\ \text{a = action}\\ \text{t = current timestep}\\ \eta = \text{Learning Rate}\\ \alpha = \text{Reward for current state}\\ \gamma = \text{Discount Factor} \end{*align}" /></a></p>

<p align="justify">Using the above function, we get the values of Q for the cells in the table. When we start, all the values in the Q-table are zeros. There is an iterative process of updating the values. As we start to explore the environment, the Q-function gives us better and better approximations by continuously updating the Q-values in the table. Now, let’s understand how the updating takes place.</p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/oQPHTmuB6tz7CVy3L05K1NlBmS6L8MUkgOud"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

Each of the colored boxes is one step. Let’s understand each of these steps in detail.

Step 1: initialize the Q-Table

<p align="justify">We will first build a Q-table. There are n columns, where n= number of actions. There are m rows, where m= number of states. We will initialise the values at 0.</p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/TQ9Wy3guJHUecTf0YA5AuQgB9yVIohgLXKIn"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/gWnhK5oLqjcQkSzuuT8WgMVOGdCEp68Xvt6F"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

In our robot example, we have four actions (a=4) and five states (s=5). So we will build a table with four columns and five rows.

Steps 2 and 3: Choose and Perform an Action

<p align="justify">This combination of steps is done for an undefined amount of time. This means that this step runs until the time we stop the training, or the training loop stops as defined in the code. We will choose an action (a) in the state (s) based on the Q-Table. But, as mentioned earlier, when the episode initially starts, every Q-value is 0. So now the concept of exploration and exploitation trade-off comes into play. <a href="https://medium.freecodecamp.org/a-brief-introduction-to-reinforcement-learning-7799af5840db">This article has more details</a>. We’ll use something called the epsilon greedy strategy. In the beginning, the epsilon rates will be higher. The robot will explore the environment and randomly choose actions. The logic behind this is that the robot does not know anything about the environment. As the robot explores the environment, the epsilon rate decreases and the robot starts to exploit the environment. During the process of exploration, the robot progressively becomes more confident in estimating the Q-values. For the robot example, there are four actions to choose from: up, down, left, and right. We are starting the training now — our robot knows nothing about the environment. So the robot chooses a random action, say right.</p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/k0IARc6DzE3NBl2ugpWkzwLkR9N4HRkpSpjw"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

We can now update the Q-values for being at the start and moving right using the Bellman equation.

Steps 4 and 5: Evaluate

<p align="justify">Now we have taken an action and observed an outcome and reward.We need to update the function Q(s,a).</p>
<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/TnN7ys7VGKoDszzv3WDnr5H8txOj3KKQ0G8o"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

In the case of the robot game, to reiterate the scoring/reward structure is:

- power = +1
- mine = -100
- end = +100

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/EpQDzt7lCbmFyMVUzNGaPam3WCYNuD1-hVxu"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

<p align="center"><a align="center" href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/"><img src="https://cdn-media-1.freecodecamp.org/images/xQtpQAhBocPC46-f0GRHDOK3ybrz4ZasaDo4"></a></p>
<p align="center"><a href="https://www.freecodecamp.org/news/an-introduction-to-q-learning-reinforcement-learning-14ac0b4493cc/">Source</a></p>

<p align="justify">We will repeat this again and again until the learning is stopped. In this way the Q-Table will be updated.</p>

## How to translate this to Webpages?

<p align="justify">The Intelligent Automation App utilizes Q-Learning to create bots that can do Automation Testing, Form Filling and much more. The concept of environment, state, action and reward csn be easily translated to a Webpage setting where the elements of the page can be defined as measureable state. The actions are the ways in which a user can potentially interact with the Webpage. Rewards can be assigned to a certain success messages appearing on the Webpage. Let's have a look at how to apply it to our use-case for form filling.</p>

<p align="justify">Lets consider the login page of the Intelligent Automation app for this example:- </p>

<p align="center"><a href="https://imgur.com/rQ12eDx"><img src="https://i.imgur.com/rQ12eDx.png" title="source: imgur.com" /></a></p>

<p align="justify">We'll extract all the elements in the webpage that has an 'id' to define our states. We can easily search for these elements later by using the find_element_by_id() function in selenium. In this case we'll get 4 states -- </p>

1. "Signup Button"  
2. "Username Field"  
3. "Password Field"  
4. "Login Button"  

<p align="justify">We'll need to define a set of generic actions. In this case we'll need just two --</p>

1. "Click Button"  
2. "Set value to a Field"  
3. "Skip an Element"  

<p align="justify">We'll need to get the inputs for the action "Set value to a Field", here we'll give two inputs -- </p>

1. "admin"  
2. "password"  
 
<p algin="justify">We dont have to specify which input belongs to what field here, thats the job of the RL agent to figure out. We can give multiple combination of usernames, passwords or some dummy information and the RL agent is supposed to figure out atleast one correct combinations of username and password in this case. With all the information present we can create a Q-Table. The Q Table will look like this after we initialize the Q Values with zeros</p>

</p align="center"><a href="https://imgur.com/XQrWlXM"><img src="https://i.imgur.com/XQrWlXM.png" title="source: imgur.com" /></a></p>

<p align="justify">Next step will be to define rewards depneding on the goals. For each interaction with the elements we'll induce a small negative reward, this is necessary so that the RL agent learns to get to the objective in the least amount of steps possible. In the training phase we'll randomly iterate over various combination of states and actions until the login is succesful. Whenever a login attempt is succesful we get a Toast with the message 'Login success' we can use this to define the goal for the RL Agent. After the goal is achieved we'll assign a large positive reward to the chain of actions that led to the achivement. This way we ensure that the RL agent achieves the target every episode. After the model is trained for a set number of episodes we'll have an updated Q-Table wherein the action with the highest Q-Value for each state will be the appropriate action to achieve the goal</p>

<p align="center"><a href="https://imgur.com/SM8ogfZ"><img src="https://i.imgur.com/SM8ogfZ.png" title="source: imgur.com" /></a></p>

1. Small Negative reward for every interaction with an element.   
2. Large Positive reward for achieving the goal / passing the assertion test.  

<p align="justify">After the model is trained for a set number of episodes we'll have an updated Q-Table wherein the action with the highest Q-Value for each state will be the appropriate action to achieve the goal. We can use the updated Q-Table to run the agent on this login page, or generate Automated Test Cases for quality testing of the page.</p>
<p align="center"><a href="https://imgur.com/OeR2m1D"><img src="https://i.imgur.com/OeR2m1D.png" title="source: imgur.com" /></a></p>  

### Work-Flow:

The App is divided into Two sections --> 
1. Frontend
2. Backend
	
### Frontend: 

<p align="justify">The frontend folder defines the UI/UX of the app. ReactJS and TypeScript are the primary tools used here.</p>

### Backend:

<p align="justify">The backend defines the API layer which the frontend will use to interact with the app. The API's are hosted on a Flask Server and we have plans to move it to FAST API for faster API calls and better documentation. We use Bluprints in Flask to better structure our projects and combine it with our Flask App by registering them.</p>

<p align="justify">We also use MySQL Database which interacts with the Flask App using Flask-SQL Alchemy. The database currently only has a Users Table for storing the information of registered users.</p> 

<p align="justify">The RL Agent is defined in the learner.py and leraner.1.2.py files. We're still experimenting and improving the RL agent as we move forward.</p>

**Tech Stack**

Frontend : ReactJS, TypeScript  
Backend  : Python, Flask, Selenium, Numpy, MySQL  

**References:**
- [Q Learning Fundamentals](https://www.youtube.com/watch?v=yMk_XtIEzH8&list=PLQVvvaa0QuDezJFIOU5wDdfy4e9vdnx-)

- [Selenium Tutorial](https://www.linkedin.com/learning/python-automation-and-testing/challenge-2?u=94149778)

- [Flask Tutorial](https://www.youtube.com/watch?v=mqhxxeeTbu0&list=PLzMcBGfZo4-n4vJJybUVV3Un_NFS5EOgX)

- [Flask SQL Alchemy Documentation](https://flask-sqlalchemy.palletsprojects.com/en/2.x/)

- [FAST API Tutorial](https://www.youtube.com/watch?v=-ykeT6kk4bk)
