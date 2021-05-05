from . import db
from datetime import datetime
from flask_login import UserMixin
from sqlalchemy.sql import func

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(500), unique=True, nullable=False)
    dob = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    device = db.Column(db.String(50), nullable=True)
    phone = db.column(db.String(15), nullable=True)
    about = db.Column(db.String(1000), nullable=True)
    photo = db.Column(db.String, nullable=False, default="./static/profile_pictures/default.jpg")
    password = db.Column(db.String(94), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=False)
    projects = db.relationship('Project', backref='creator', lazy=True)

    def __repr__(self):
        return f"User(User ID: '{self.id}', Username: '{self.username}', Email: '{self.email}', Gender: '{self.gender}', is_Admin: {user.is_admin})"

class Project(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    pages = db.relationship('Page', backref='task', lazy=True)
    goals = db.relationship('Goal', backref='priority', lazy=True)

    def __repr__(self):
        return f"Project(Project ID: '{self.id}', Creator ID: '{self.user_id}', Project Name: '{self.name}', Project URL: '{self.url}', Date Created: '{self.date_created}')"

class Page(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    goals = db.relationship('Goal', backref='target', lazy=True)

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