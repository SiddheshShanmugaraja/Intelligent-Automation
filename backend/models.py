from . import db
from datetime import datetime
from flask_login import UserMixin
from sqlalchemy.sql import func

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)
    projects = db.relationship('Project', backref='creator', lazy=True)

    def __repr__(self):
        return f"User(User ID: '{self.id}', Username: '{self.username}')"

class Project(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    pages = db.relationship('Page', backref='project', lazy=True)
    goals = db.relationship('Goal', backref='goal', lazy=True)

    def __repr__(self):
        return f"Project(Project ID: '{self.id}', Creator ID: '{self.user_id}', Project Name: '{self.name}', Project URL: '{self.url}', Date Created: '{self.date_created}')"

class Page(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    goals = db.relationship('Goal', backref='goal', lazy=True)

    def __repr__(self):
        return f"Page(Page ID: '{self.id}', Project ID: '{self.project_id}', Page Name: '{self.name}', Page URL: '{self.url}')"

class Goal(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    training_status = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'), nullable=False)

    def __repr__(self):
        return f"Goal(Goal ID: '{self.id}', Project ID: '{self.project_id}', Page ID: '{self.page_id}',  Goal Name: '{self.name}', Training Status: {self.training_status})"