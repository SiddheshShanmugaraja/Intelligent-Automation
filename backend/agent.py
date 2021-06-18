import os, re, time, json, subprocess
import pandas as pd
from . import utils
from sqlalchemy import and_
from sqlalchemy.orm import Session
from . import database, models, schemas
from typing import List, Dict, Tuple, Optional
from fastapi import APIRouter, Form, File, UploadFile, Depends, Response, status as STATUS

agent = APIRouter()

with open('backend/config.json', 'r') as f:
    config = json.load(f)

RL_SCRIPT = config.get('RL_SCRIPT') 
EXCEL_DIR = config.get('EXCEL_DIR')
DATA_FILE = config.get('DATA_FILE')
LOG_FILE = config.get('LOG_FILE')
DELIMITER = config.get('DELIMITER')
CSV_EXTENSION = '.csv'

USER_NOT_FOUND_ERROR = 'User not found!'
PROJECT_NOT_FOUND_ERROR = 'Project not found!'
GOAL_NOT_FOUND_ERROR = 'Goal not found!'
PAGE_NOT_FOUND_ERROR = 'Page not found!'

@agent.post('/get-sites', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def extract_subdomains(response: Response, domain: str = Form(...)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        domain (str, optional): [description]. Defaults to Form(...).

    Returns:
        Dict: [description]
    '''
    xl_name = os.path.join(EXCEL_DIR, utils.get_filename(domain) + CSV_EXTENSION)
    if domain:
        if not os.path.exists(xl_name):
            utils.crawl(domain)
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
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        project_name (str, optional): [description]. Defaults to Form(...).
        url (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        for project in user.projects:
            if project.name == project_name:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = f'The user - {username} already has a project with name - {project_name}'
                return dict(status=status, message=message) 
        new_project = models.Project(name=project_name, url=url, user_id=user.id)
        db.add(new_project)
        db.commit()
        status = response.status_code = STATUS.HTTP_200_OK
        message = f'Project created successfully!'
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)

@agent.post('/create-goal', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def create_goal(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        train_info (schemas.Project): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
    if user:    
        if project:
            for goal in project.goals:
                if goal.name == goal_name:
                    status = response.status_code = STATUS.HTTP_201_CREATED
                    message = f'The project - {project_name} already has a goal with name - {goal_name}'
                    return dict(status=status, message=message) 
            new_goal = models.Goal(name=goal_name, project_id=project.id)
            db.add(new_goal)
            db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = f'Goal created successfully!'
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = PROJECT_NOT_FOUND_ERROR
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)

@agent.post('/create-page', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def create_page(response: Response,  pages: schemas.Project, db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        train_info (schemas.Project): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    pages = pages.dict()
    username = pages.get('username')
    project_name = pages.get('projectName')
    data = pages.get('data')
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:        
            for goal in project.goals:
                for d in data:
                    if (goal.name == d.get('goal')):
                        for page in d.get('pages'):
                            if not bool(db.query(models.Goal).filter_by(name=page.get('pageName')).first()):
                                new_page = models.Page(name=page.get('pageName'), url=page.get('url'), inputs=DELIMITER.join(page.get('actions')), terminal_state=page.get('terminalState'), goal_id=goal.id)
                                db.add(new_page)
                                db.commit()
                        status = response.status_code = STATUS.HTTP_200_OK
                        message = f'Pages created successfully!'
                        break
                else:
                    status = response.status_code = STATUS.HTTP_201_CREATED
                    message = GOAL_NOT_FOUND_ERROR
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = PROJECT_NOT_FOUND_ERROR
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)

@agent.post('/get-projects', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def get_projects(response: Response, username: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str): [description]
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
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
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message, data=data)

@agent.delete('/delete-project', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_project(response: Response, username: str = Form(...), project_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        project_name (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:
            for goal in project.goals:
                for page in goal.pages:
                    db.delete(page)
                    db.commit()
                db.delete(goal)
                db.commit()
            db.delete(project)
            db.commit()
            status = response.status_code = STATUS.HTTP_200_OK
            message = 'Project deleted successfully!'
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = PROJECT_NOT_FOUND_ERROR
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)

@agent.delete('/delete-goal', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_goal(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        project_name (str, optional): [description]. Defaults to Form(...).
        goal_name (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:
            goal = db.query(models.Goal).filter(and_(models.Goal.name==goal_name, models.Goal.project_id==project.id)).first()
            if goal:
                for page in goal.pages:
                    db.delete(page)
                    db.commit()
                db.delete(goal)
                db.commit()
                status = response.status_code = STATUS.HTTP_200_OK
                message = 'Goal deleted successfully!'
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = GOAL_NOT_FOUND_ERROR
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = PROJECT_NOT_FOUND_ERROR
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)

@agent.delete('/delete-page', status_code=STATUS.HTTP_200_OK, tags=['Projects'])
def delete_page(response: Response, username: str = Form(...), project_name: str = Form(...), goal_name: str = Form(...), page_name: str = Form(...), db: Session = Depends(database.get_db)) -> Dict:
    '''[summary]

    Args:
        response (Response): [description]
        username (str, optional): [description]. Defaults to Form(...).
        project_name (str, optional): [description]. Defaults to Form(...).
        goal_name (str, optional): [description]. Defaults to Form(...).
        page_name (str, optional): [description]. Defaults to Form(...).
        db (Session, optional): [description]. Defaults to Depends(database.get_db).

    Returns:
        Dict: [description]
    '''
    user = db.query(models.User).filter_by(username=username).first()
    if user:
        project = db.query(models.Project).filter(and_(models.Project.user_id==user.id, models.Project.name==project_name)).first()
        if project:
            goal = db.query(models.Goal).filter(and_(models.Goal.name==goal_name, models.Goal.project_id==project.id)).first()
            if goal:
                page = db.query(models.Page).filter(and_(models.Page.name==page_name, models.Page.goal_id==goal.id)).first()
                if page:
                    db.delete(page)
                    db.commit()
                    status = response.status_code = STATUS.HTTP_200_OK
                    message = 'Page deleted successfully!'
                else:
                    status = response.status_code = STATUS.HTTP_201_CREATED
                    message = PAGE_NOT_FOUND_ERROR
            else:
                status = response.status_code = STATUS.HTTP_201_CREATED
                message = GOAL_NOT_FOUND_ERROR
        else:
            status = response.status_code = STATUS.HTTP_201_CREATED
            message = PROJECT_NOT_FOUND_ERROR
    else:
        status = response.status_code = STATUS.HTTP_201_CREATED
        message = USER_NOT_FOUND_ERROR
    return dict(status=status, message=message)