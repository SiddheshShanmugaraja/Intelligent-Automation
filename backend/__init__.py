import os, json
from flask_cors import CORS
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from typing import List, Dict, Tuple, Optional

with open("backend/config.json", "r") as f:
    config = json.load(f)

DB_USERNAME = config.get("DB_USERNAME")
DB_PASSWORD = config.get("DB_PASSWORD")
DB_HOST = config.get("DB_HOST")
DB_NAME = config.get("DB_NAME")
SECRET_KEY = config.get("SECRET_KEY")

db = SQLAlchemy()

def return_response(status: int, message:str, data: Optional[Dict] = None) -> str:
    """[summary]

    Args:
        status (int): [description]
        message (str): [description]
        data (Optional[Dict], optional): [description]. Defaults to None.

    Returns:
        str: [description]
    """
    response = dict(status=status, message=message}
    if data:
        response["data"] = data
    return jsonify(response)


def create_app() -> object:
    """[summary]

    Returns:
        object: [description]
    """
    from .models import User, Project, Page, Goal
    from .auth import auth
    from .agent import agent
    from .project import project
    app = Flask(__name__, static_folder=os.path.abspath('./static'))
    CORS(app)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(agent, url_prefix='/')
    app.register_blueprint(project, url_prefix='/')
    db.init_app(app)
    db.create_all(app=app)
    return app
