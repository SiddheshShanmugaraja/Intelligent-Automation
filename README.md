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

Given a State recommend/predict an action based on Q Values. When the RL Agent Interacts with the environment while training, we have to update the Q Values such that, running a certain chain of actions gives us a desirable outcome. We achieve that by giving rewards to the agent for achieveing a certain long term goal.

## Problem Statement:

The Intelligent Automation App utilizes Q-Learning to create bots that can do Automation Testing, Form Filling and much more. The concept of environment, state, action and reward csn be easily translated to a Webpage setting where the elements of the page can be defined as measureable state. The actions are the ways in which a user can potentially interact with the Webpage. Rewards can be assigned to a certain success messages appearing on the Webpage

### Work-Flow:

The App is divided into Two sections --> 
1. Frontend
2. Backend
	
### Frontend: 

The frontend folder defines the UI/UX of the app. ReactJS and TypeScript are the primary tools used here

### Backend:

Backend defines the API layer which the frontend will use to interact with the app. The API's are hosted on a Flask Server and we have plans to move it to FAST API for faster API calls and better documentation. We use Bluprints in Flask to better structure our projects and combine it with our Flask App by registering them.

We also use MySQL Database which interacts with the Flask App using Flask-SQL Alchemy. The database currently only has a Users Table for storing the information of registered users. 

The RL Agent is defined in the learner.py and leraner.1.2.py files. We're still experimenting and improving the RL agent as we move forward.

**Tech Stack**

Frontend : ReactJS, TypeScript
Backend  : Python, Flask, Selenium, Numpy, MySQL

**References:**
- [Q Learning Fundamentals](https://www.youtube.com/watch?v=yMk_XtIEzH8&list=PLQVvvaa0QuDezJFIOU5wDdfy4e9vdnx-)

- [Selenium Tutorial](https://www.linkedin.com/learning/python-automation-and-testing/challenge-2?u=94149778)

- [Flask Tutorial](https://www.youtube.com/watch?v=mqhxxeeTbu0&list=PLzMcBGfZo4-n4vJJybUVV3Un_NFS5EOgX)

- [Flask SQL Alchemy Documentation](https://flask-sqlalchemy.palletsprojects.com/en/2.x/)

- [FAST API Tutorial](https://www.youtube.com/watch?v=-ykeT6kk4bk)