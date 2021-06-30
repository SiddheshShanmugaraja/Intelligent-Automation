import os
import json
import pandas as pd
from . import utils
from typing import Dict
from sqlalchemy import and_
from sqlalchemy.orm import Session
from . import database, models, schemas
from fastapi import APIRouter, Form, Depends, Response, status as STATUS

agent = APIRouter()

with open('backend/config.json', 'r') as f:
    config = json.load(f)

RL_SCRIPT = config.get('RL_SCRIPT') 
EXCEL_DIR = config.get('EXCEL_DIR')
DATA_FILE = config.get('DATA_FILE')
LOG_FILE = config.get('LOG_FILE')
DELIMITER = config.get('DELIMITER')
CSV_EXTENSION = '.csv'

@agent.post('/get-sites', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def extract_subdomains(response: Response, domain: str = Form(...)) -> Dict:
    '''Extracts sub-domians of a Parent domain and write it to a csv file.

    Args:
        response (Response): Response object for the FastAPI app.
        domain (str): URL of the parent domain. Defaults to Form(...).

    Returns:
        Dict: Returns a tree structure of parent and child domains.
    '''
    xl_name = os.path.join(EXCEL_DIR, utils.get_filename(domain) + CSV_EXTENSION)
    if domain:
        # Crawl the URL to find sub-domains.
        if not os.path.exists(xl_name):
            utils.crawl(domain)
        # Read the csv file and create the Tree structure.
        if os.path.exists(xl_name):
            df = pd.read_csv(xl_name)
            data = df['url'].tolist()
            page_titles = df['title'].tolist()
            if len(data):
                status = response.status_code = STATUS.HTTP_200_OK
                message = 'Sites extracted!'
                data = utils.create_tree(data, page_titles)
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = 'No data found!'
                data = None
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = 'Domain is missing!'
        data = None
    return dict(status=status, message=message, data=data)

@agent.post('/create-project', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def create_project(response: Response, username: str = Form(...), project_name: str = Form(...), url: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Creates a project for given user in the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        project_name (str): Unique name for the project. Defaults to Form(...).
        url (str): Parent domain URL for the project. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in creating the project.
    '''
    # Check if the user exists with the given username
    user = db.query(models.User).filter_by(username=username).first()
    # Check if a user exists with the given username.
    if user:
        # Check if a project exists with the given project name.
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = f'The user - {username} already has a project with name - {project_name}'
            return dict(status=status, message=message) 
        # If no project exists with the name, create a new one.
        new_project = models.Project(name=project_name, url=url, user_id=user.id)
        db.add(new_project);db.commit()
        status = response.status_code = STATUS.HTTP_200_OK
        message = f'Project created successfully!'
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.post('/create-goal', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def create_goal(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Creates a goal for a given project in the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        train_info (schemas.Project): Project information in JSON schema. (Checkout the Project class from backend/schemas.py file)
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in creating the goal.
    '''
    user = db.query(models.User).filter_by(username=username).first()
    # Check if a user exists with the given username.
    if user:    
        # Check if a project exists with the given project name.
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:
            # Check if a goal exists with the given goal name.
            goal = db.query(models.Goal).filter(and_(models.Goal.name==goal_name, models.Goal.project_id==project.id)).first()
            if goal:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = f'The project - {project_name} already has a goal with name - {goal_name}'
                return dict(status=status, message=message) 
            # If no goal exists with the name, create a new one.
            new_goal = models.Goal(name=goal_name, project_id=project.id)
            db.add(new_goal);db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = f'Goal created successfully!'
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = utils.not_found_error('Project')
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.post('/create-page', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def create_page(response: Response,  pages: schemas.Project, db: Session = Depends(database.get_db)) -> Dict:
    '''Creates a page for a given goal in the Intelligent Automation app.

    Args:
        response (Response): Response object for the FastAPI app.
        train_info (schemas.Project): Project information in JSON schema. (Checkout the Project class from backend/schemas.py file)
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in creating the page.
    '''
    pages = pages.dict()
    username = pages.get('username')
    project_name = pages.get('projectName')
    data = pages.get('data')
    user = db.query(models.User).filter_by(username=username).first()
    # Check is a user exists with the given username.
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        # Check if a project exists with the given project name.
        if project:        
            for d in data:
                goal = db.query(models.Goal).filter(and_(models.Goal.name==d.get('goal'), models.Goal.project_id==project.id)).first()
                # Check if a goal exists with the given goal name.
                if goal:
                    for page in d.get('pages'):
                        # Check if a page exists with the given page name.
                        page = db.query(models.Page).filter(and_(models.Page.name==page.get('pageName'), models.Page.goal_id==goal.id)).first()
                        if not page:
                            # Create new page and commit to the database.
                            new_page = models.Page(name=page.get('pageName'), url=page.get('url'), inputs=DELIMITER.join(page.get('actions')), terminal_state=page.get('terminalState'), goal_id=goal.id)
                            db.add(new_page);db.commit()
                    status = response.status_code = STATUS.HTTP_200_OK
                    message = f'Pages created successfully!'
                    break
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = utils.not_found_error('Goal')
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = utils.not_found_error('Project')
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.delete('/delete-project', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_project(response: Response, username: str = Form(...), project_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Delete a project from the Intelligent Automation app for the given user.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        project_name (str): Unique name of the project. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in deleting the project.
    '''
    user = db.query(models.User).filter_by(username=username).first()
    # Check if a user exists with the given username.
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        # Check if a project exists with the given project name.
        if project:
            # Delete everything and commit to the databse.
            for goal in project.goals:
                for page in goal.pages:
                    db.delete(page);db.commit()
                db.delete(goal);db.commit()
            db.delete(project);db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Project deleted successfully!'
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = utils.not_found_error('Project')
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.delete('/delete-goal', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_goal(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Delete a goal from the Intelligent Automation app for the given project and user.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        project_name (str): Unique name of the project. Defaults to Form(...).
        goal_name (str): Unique name for the goal. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in deleting the goal.
    '''
    user = db.query(models.User).filter_by(username=username).first()
    # Check if a user exists with the given username.
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        # Check if a project exists with the given project name.
        if project:
            goal = db.query(models.Goal).filter(and_(models.Goal.name==goal_name, models.Goal.project_id==project.id)).first()
            # Check if a goal exists with the given goal name.
            if goal:
                # Delete all pages associated with the goal
                for page in goal.pages:
                    db.delete(page);db.commit()
                db.delete(goal);db.commit()
                status = response.status_code = STATUS.HTTP_200_OK
                message = 'Goal deleted successfully!'
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = utils.not_found_error('Goal')
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = utils.not_found_error('Project')
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.delete('/delete-page', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_page(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), page_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Delete a page from the Intelligent Automation app for the given goal, project and user.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        project_name (str): Unique name for the project. Defaults to Form(...).
        goal_name (str): Unique name for the goal. Defaults to Form(...).
        page_name (str): Unique name for the page. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a message with success or failure in deleting the page.
    '''
    user = db.query(models.User).filter_by(username=username).first()
    # Check if a user exists with the given username.
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        # Check if a project exists with the given project name.
        if project:
            goal = db.query(models.Goal).filter(and_(models.Goal.name==goal_name, models.Goal.project_id==project.id)).first()
            # Check if a goal exists with the given goal name.
            if goal:
                page = db.query(models.Page).filter(and_(models.Page.name==page_name, models.Page.goal_id==goal.id)).first()
                # Check if a page exists with the given page name.
                if page:
                    # Delete the specific page and commit to the database.
                    db.delete(page);db.commit()
                    status = response.status_code = STATUS.HTTP_200_OK
                    message = 'Page deleted successfully!'
                else:
                    status = response.status_code = STATUS.HTTP_201_CREATED
                    message = utils.not_found_error('Page')
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = utils.not_found_error('Goal')
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = utils.not_found_error('Project')
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message)

@agent.post('/get-projects', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def get_projects(response: Response, username: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''Get all the projects for a given username.

    Args:
        response (Response): Response object for the FastAPI app.
        username (str): Unique username of the user. Defaults to Form(...).
        db (Session): Database session to commit changes to the Database. Defaults to Depends(database.get_db).

    Returns:
        Dict: Returns a list of projects associated with the user.
    '''
    user = db.query(models.User).filter_by(username=username).first()
    # Check if the user exists with given username.
    if user:
        # Convert all the projects to a List of Dict.
        data = [project.to_dict() for project in user.projects]
        if len(data):
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Projects queried successfully!'
        else:
            data = None
            status = response.status_code = STATUS.HTTP_200_OK
            message = f'No projects found for user - {username}'
    else:
        data = None
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = utils.not_found_error('User')
    return dict(status=status, message=message, data=data)