from . import db
from sqlalchemy.sql import func
from flask_login import UserMixin
from datetime import datetime, date

def calculate_age(born):
    """[summary]

    Args:
        born ([type]): [description]

    Returns:
        [type]: [description]
    """
    if not born:
        return None
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    username = db.Column(db.String(25), unique=True, nullable=False)
    email = db.Column(db.String(500), unique=True, nullable=False)
    dob = db.Column(db.Date, nullable=True)
    country = db.Column(db.String(50), nullable=True)
    credit = db.Column(db.Integer, nullable=False, default=100)
    gender = db.Column(db.String(10), nullable=True)
    device = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(15), nullable=True)
    about = db.Column(db.String(1000), nullable=True)
    photo = db.Column(db.String(55), nullable=False, default="static/profile_pictures/default.jpg")
    password = db.Column(db.String(94), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False, default=True)
    projects = db.relationship('Project', backref='creator', lazy=True)

    def __repr__(self):
        return f"User(User ID: '{self.id}', Username: '{self.username}', Email: '{self.email}', Gender: '{self.gender}', Device: '{self.device}', is_Admin: {user.is_admin})"

    def to_dict(self):
        return dict(
                    id = self.id,
                    username = self.username,
                    email = self.email,
                    dob = self.dob.strftime("%d/%m/%Y") if self.dob is not None else None,
                    age = calculate_age(self.dob),
                    country = self.country,
                    credit = self.credit,
                    gender = self.gender,
                    device = self.device.split(",") if (self.device is not None) and (self.device != "") else list(),
                    phone = self.phone,
                    about = self.about,
                    photo = self.photo,
                    is_admin = self.is_admin,
                    projects = list(map(lambda x: x.to_dict(), self.projects))
                )

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

    def to_dict(self):
        return dict(
                    id = self.id,
                    name = self.name,
                    url = self.url,
                    user_id = self.user_id,
                    date_created = self.date_created.strftime("%d/%m/%Y %H:%M:%S"),
                    pages = list(map(lambda x: x.to_dict(), self.pages)),
                    goals = list(map(lambda x: x.to_dict(), self.goals))
                )

class Page(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    goals = db.relationship('Goal', backref='target', lazy=True)

    def __repr__(self):
        return f"Page(Page ID: '{self.id}', Project ID: '{self.project_id}', Page Name: '{self.name}', Page URL: '{self.url}')"

    def to_dict(self):
        return dict(
                    id = self.id,
                    name = self.name,
                    url = self.url,
                    project_id = self.project_id,
                    goals = list(map(lambda x: x.to_dict(), self.goals))
                )

class Goal(db.Model):
    id = db.Column(db.Integer, nullable=False, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    training_status = db.Column(db.Boolean, default=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'), nullable=False)

    def __repr__(self):
        return f"Goal(Goal ID: '{self.id}', Project ID: '{self.project_id}', Page ID: '{self.page_id}',  Goal Name: '{self.name}', Training Status: {self.training_status})"

    def to_dict(self):
        return dict(
                    id = self.id,
                    name = self.name,
                    training_status = self.training_status,
                    project_id = self.project_id,
                    page_id = self.page_id,
                )