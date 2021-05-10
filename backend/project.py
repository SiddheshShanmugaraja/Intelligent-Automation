from PIL import Image
from . import db, return_response
from flask_cors import cross_origin
from flask import Blueprint, request
from .models import User, Project, Page, Goal

project = Blueprint('project', __name__)

################################################################################################################

@project.route('/get-projects', methods=['GET','POST'])
@cross_origin()
def get_projects():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == 'GET':
        projects = Project.query.all()
    elif request.method == 'POST':
        username = request.form.get('username')
        user = User.query.filter_by(username=username).first()
        projects = user.projects
    data = [project.to_dict() for project in projects]
    status = 200
    message = "Projects queried successfully!"
    return return_response(status, message, data)

@project.route('/create-project', methods=['POST'])
@cross_origin()
def create_project():
    """[summary]

    Returns:
        [type]: [description]
    """
    name = request.form.get('name')
    url = request.form.get('url')
    username = request.form.get('username')
    user = User.query.filter_by(username=username).first()
    if user:
        project = Project(name=name, url=url, user_id=user.id)
        db.session.add(project)
        db.session.commit()
        status = 200
        message = "Project created successfully!"
        data = project.to_dict()
    else:
        status = 400
        message = f"No user found with username - '{username}'!"
        data = None
    return return_response(status, message, data)

@project.route('/get-pages', methods=['GET','POST'])
@cross_origin()
def get_pages():
    """[summary]

    Returns:
        [type]: [description]
    """
    if request.method == 'GET':
        pages = Page.query.all()
    elif request.method == 'POST':
        project_id = int(request.form.get('project_id'))
        project = Project.query.filter_by(id=project_id).first()
        pages = project.pages
    data = [page.to_dict() for page in pages]
    status = 200
    message = "Pages queried successfully!"
    return return_response(status, message, data)

@project.route('/create-page', methods=['POST'])
@cross_origin()
def create_page():
    """[summary]

    Returns:
        [type]: [description]
    """
    name = request.form.get('name')
    url = request.form.get('url')
    project_id = int(request.form.get('project_id'))
    project = Project.query.filter_by(id=project_id)
    if project:
        page = Page(name=name, url=url, project_id=project.id)
        db.session.add(page)
        db.session.commit()
        status = 200
        message = "Page created successfully!"
        data = project.to_dict()
    else:
        status = 400
        message = f"No project found with id - '{project_id}'!"
        data = None
    return return_response(status, message, data)