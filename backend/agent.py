import pandas as pd
from rq import Queue
from rq.job import Job
from yaml import load, dump
from urllib.parse import urlparse
from . import db, return_response
from flask_cors import cross_origin
from flask import Blueprint, request
import os, re, time, json, subprocess
from .models import User, Project, Page, Goal
from typing import List, Dict, Tuple, Optional
from .crawler import crawl_url as crawl, get_filename, get_page_title
from learner import Domain

agent = Blueprint('agent', __name__)

with open("backend/config.json", "r") as f:
    config = json.load(f)

RL_SCRIPT = config.get("RL_SCRIPT") 
EXCEL_DIR = config.get("EXCEL_DIR")
DATA_FILE = config.get("DATA_FILE")
LOG_FILE = config.get("LOG_FILE")
CSV_EXTENSION = ".csv"

################################################################################################################

def create_tree(data, page_titles) -> List:
    """[summary]

    Args:
        data ([type]): [description]
        page_titles ([type]): [description]

    Returns:
        List: [description]
    """
    data = [str(x)[:-1] if x[-1] == "/" else x for x in data]
    result = []
    while len(data) > 0:
        d = data[0]
        t = page_titles[0]
        form_dict = {}
        l = d.split("/")
        parent = "/".join(l[:-1])
        data.pop(0)
        page_titles.pop(0)
        form_dict["children"] = list()
        form_dict["url"] = d
        form_dict["name"] = t
        option = find_match(parent, result)
        if (option):
            option["children"].append(form_dict)
        else:
            result.append(form_dict)
    return prune_children(result[0])

def find_match(d, res):
    """ To find a matching parent

    Args:
        d ([type]): [description]
        res ([type]): [description]

    Returns:
        [type]: [description]
    """
    for t in res:
        if d == t["url"]:
            return t
        elif (len(t["children"]) > 0):
            temp = find_match(d, t["children"])
            if (temp):
                return temp
    return None

def prune_children(data):
    if not len(data['children']):
        data.pop('children')
    else:
        for d in data['children']:
            prune_children(d)
    return data

def get_crawled_urls(domain):
    xl_name = os.path.join(EXCEL_DIR, get_filename(domain) + CSV_EXTENSION)
    df = pd.read_csv(xl_name)
    data = df["url"].tolist()
    page_titles = df['title'].tolist()
    return create_tree(data, page_titles)

################################################################################################################

@agent.route("/get-sites", methods=["POST"])
@cross_origin()
def extract_from_data():
    """Reads the CSV and return the data in a tree structure

    Returns:
        [type]: [description]
    """
    domain = request.form.get("domain")
    xl_name = os.path.join(EXCEL_DIR, get_filename(domain) + CSV_EXTENSION)
    if domain:
        if not os.path.exists(xl_name):
            crawl(domain)
        if os.path.exists(xl_name):
            df = pd.read_csv(xl_name)
            data = df["url"].tolist()
            page_titles = df['title'].tolist()
            if len(data):
                status = 200
                message = "Sites extracted!"
                data = create_tree(data, page_titles)
            else:
                status = 400
                message = "No data found!"
                data = None
    else:
        status = 400
        message = "Domain is missing!"
        data = None
    return return_response(status, message, data)

@agent.route("/train", methods=["POST"])
@cross_origin()
def train_site():
    """[summary]

    Returns:
        [type]: [description]
    """
    response = request.get_json(silent=True)
    username = response["username"]
    project_name = response['projectName']
    data = response['data']
    for d in data:
        d['states'] = d.pop('selectors')
        d['terminal_state'] = d.pop('terminalState')
    with open(DATA_FILE, 'r') as f:
        content = json.load(f)
    if not username in content:
        content[username] = dict()
    if not project_name in content[username]:
        content[username][project_name] = dict()
    content[username][project_name] = data
    url = urlparse(data[0]['url']).netloc
    user = User.query.filter_by(username=username).first()
    new_project = Project(name=project_name, url=url, user_id=user.id)
    db.session.add(new_project)
    db.session.commit()
    with open(DATA_FILE, 'w') as f:
        json.dump(content, f, indent=4)
    process = subprocess.Popen(f"python {RL_SCRIPT} --user {username} --project {project_name}".split())
    status = 200
    data = None
    message = f'Process with id - {process.pid} has been started!'
    return return_response(status, message, data)

@agent.route("/projects", methods=['POST'])
@cross_origin()
def get_projects():
    """
    Returns:
        [type]: [description]
    """
    username = request.form.get('username')
    user = User.query.filter_by(username=username).first()
    projects = user.projects
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)[username]
    for project in data:
        for d in data[project]:
            d['selectors'] = d.pop('states')
            d['terminalState'] = d.pop('terminal_state')
            if 'pageName' not in d:
                d['pageName'] = get_page_title(d['url'])
    domains = {project.name:dict(crawled_urls=get_crawled_urls(project.url), domain=project.url) for project in projects}
    response = dict(pages=data, domains=domains)
    status = 200
    message = "Projects loaded successfully!"
    return return_response(status, message, response)

@agent.route("/pages", methods=["POST", "GET", "DELETE"])
@cross_origin()
def action_pages():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == "POST":
        name = request.form.get("name")
        url = request.form.get("url")
        project_id = int(request.form.get("project_id"))
        new_page = Page(name=name, url=url, project_id=project_id)
        db.session.add(new_page)
        db.session.commit()
        status = 200
        message = "Page created successfully!"
        data = {"page_id": new_page.id, "page_name": new_page.name, "page_url": new_page.url}
    elif request.method == "GET":
        status = 200
        message = "Pages loaded!"
        data = list(map(lambda x: x.to_dict(), Page.query.all()))
    return return_response(status, message, data)

@agent.route("/goals", methods=["POST", "GET", "DELETE"])
@cross_origin()
def action_goals():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == "POST":
        data = request.get_json()
        new_goal = Goal(name=data["name"], training_status=data["training_status"], project_id=data["project_id"], page_id=data["page_id"])
        db.session.add(new_goal)
        db.session.commit()
        status = 200
        message = "Goal created successfully!"
        data = new_goal.to_dict()
    elif request.method == "GET":
        status = 200
        message = "Goals loaded!"
        data = list(map(lambda x: x.to_dict(), Goal.query.all())) #{"Goals": Goal.query.all()}
    return return_response(status, message, data)