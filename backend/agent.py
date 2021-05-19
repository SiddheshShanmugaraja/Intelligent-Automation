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
from .crawler import main as crawlerMain, get_filename

agent = Blueprint('agent', __name__)

with open("backend/config.json", "r") as f:
    config = json.load(f)

RL_SCRIPT = config.get("RL_SCRIPT") 
EXCEL_DIR = config.get("EXCEL_DIR")
INPUT_DATA_FILE = config.get("INPUT_DATA_FILE")
LOG_FILE = config.get("LOG_FILE")
CSV_EXTENSION = ".csv"

################################################################################################################

def _make_url_tree(data, page_titles) -> List:
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

################################################################################################################

@agent.route("/extract-sitemap", methods=["POST"])
@cross_origin()
def extract_sitemap():
    """[summary]

    Returns:
        [type]: [description]
    """
    url = request.form.get("url")
    if url:
        if os.path.exists(os.path.join(EXCEL_DIR, get_filename(url) + CSV_EXTENSION)):
            status = 200
            message = "File already exists!"
            data = None
        else:
            crawlerMain(url)
            status = 200
            message = "Job started!"
            data = None
    else:
        status = 400
        message = "URL parameter is missing!"
        data = None
    return return_response(status, message, data)

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
            crawlerMain(domain)
        if os.path.exists(xl_name):
            df = pd.read_csv(xl_name)
            df.dropna(subset=["URL", "PAGE_TITLE"], inplace=True)
            data = df["URL"].values.tolist()
            page_titles = df['PAGE_TITLE'].values.tolist()
            if len(data):
                status = 200
                message = "Sites extracted!"
                data = _make_url_tree(data, page_titles)
            else:
                status = 400
                message = "No data found!"
                data = None
    else:
        status = 400
        message = "Domain is missing!"
        data = None
    return return_response(status, message, data)

@agent.route("/page-list", methods=["POST"])
@cross_origin()
def get_page_list():
    """[summary]

    Returns:
        [type]: [description]
    """                
    domain = request.form.get("domain")
    xl_name = os.path.join(EXCEL_DIR, get_filename(domain) + CSV_EXTENSION)
    if domain:
        if os.path.exists(xl_name):
            df = pd.read_csv(xl_name)
            df.dropna(subset=["URL", "PAGE_TITLE"], inplace=True)
            df.columns = ["name","url"]
            status = 200
            message = "Success!"
            data = df.to_dict(orient="row")
        else:
            status = 400
            message = "No file found!"
            data = None
    else:
        status = 400
        message = "Not a valid URL!"
        data = None
    return return_response(status, message, data)

@agent.route("/train-data", methods=["POST"])
@cross_origin()
def train_site():
    """[summary]

    Returns:
        [type]: [description]
    """
    goal_name = request.form.get("goal_name")
    page_details = json.loads(request.form.get("pageDetail"))
    input_file = request.files["input_data"]
    input_data = input_file.read()
    mode = request.form.get("mode")
    goal_name = "_".join(goal_name.split(" "))
    with open(INPUT_DATA_FILE, "wb") as f:
        f.write(input_data)
    abs_input_path = os.path.abspath(INPUT_DATA_FILE)
    config = []
    for p in list(page_details):
        data = dict()
        data['start_url'] = p["startUrl"]
        data['main_selector'] = p["mainSelector"]
        if "minorGoal" in p:
            data["minor_goal"] = p["minorGoal"]
        config.append(data.copy())
    stream = open(CONFIG_FILE, "w")
    route_path = os.path.abspath(CONFIG_FILE)
    dump(config, stream)
    if mode and route_path and goal_name and abs_input_path:
        subprocess.Popen(["python", RL_SCRIPT, "-m", mode, "-r", route_path, "-n", goal_name, "-d", abs_input_path])
        status = 200
        data = None
        if mode == "t":
            message = "Training has been started!"
        else:
            message = "Inference has been started!"
    else:
        status = 400
        message = "Mode, Route path, goal name and abs_input_path should not be None!"
        data = None
    return return_response(status, message, data)

@agent.route("/get_training_status", methods=["GET"])
@cross_origin()
def get_training_status():
    """[summary]

    Returns:
        [type]: [description]
    """
    with open(LOG_FILE, "r", os.O_NONBLOCK) as f:
        data = f.read()
    split = data.split("\n")
    status = 200
    done_flag = "In progress"
    if len(split) > 0:
        for i in list(reversed(range(len(split)))):
            if split[i].split("-")[-1] == " completed":
                done_flag = "Completed"
                status = 201
                break
            elif split[i].split("-")[-1] == "terminated":
                status = 202
                done_flag = "Terminated"
    message = "Success!"
    data = dict(log=data, training_status=done_flag)
    return return_response(status, message, data)

@agent.route("/projects", methods=["POST", "GET", "DELETE"])
@cross_origin()
def action_projects():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == "POST":
        name = request.form.get("name")
        url = request.form.get("url")
        user_id = int(request.form.get("user_id"))
        new_project = Project(name=name, url=url, user_id=user_id)
        db.session.add(new_project)
        db.session.commit()
        status = 200
        message = "Project created successfully!"
        data = new_project.to_dict()
    elif request.method == "GET":
        status = 200
        message = "Projects loaded!"
        data = list(map(lambda x: x.to_dict(), Project.query.all()))
    return return_response(status, message, data)

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