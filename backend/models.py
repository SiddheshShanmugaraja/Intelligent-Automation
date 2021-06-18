import json
from . import database
from datetime import datetime, date
from sqlalchemy.orm import relationship
from .utils import calculate_age, get_crawled_urls
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey

with open("backend/config.json", "r") as f:
    config = json.load(f)

DELIMITER = config.get("DELIMITER") 

class User(database.Base):
    __tablename__ = 'users'
    id = Column(Integer, nullable=False, primary_key=True)
    username = Column(String(25), unique=True, nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    name = Column(String(254), nullable=True)
    dob = Column(Date, nullable=True)
    country = Column(String(55), nullable=True)
    credit = Column(Integer, nullable=False, default=1000)
    gender = Column(String(10), nullable=True)
    device = Column(String(25), nullable=True)
    phone = Column(String(15), nullable=True)
    about = Column(String(1000), nullable=True)
    photo = Column(String(55), nullable=False, default="static/profile_pictures/default.jpg")
    password = Column(String(94), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=True)
    projects = relationship('Project', backref='creator', lazy=True)

    def __repr__(self):
        return f"User(User ID: '{self.id}', Username: '{self.username}', Email: '{self.email}', Gender: '{self.gender}', Device: '{self.device}', is_Admin: {user.is_admin})"

    def to_dict(self):
        return dict(
                    username = self.username,
                    email = self.email,
                    name = self.name,
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

class Project(database.Base):
    __tablename__ = 'projects'
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String(50), nullable=False)
    url = Column(String(200), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date_created = Column(DateTime, nullable=False, default=datetime.utcnow)
    goals = relationship('Goal', backref='project_associated', lazy=True)

    def __repr__(self):
        return f"Project(Project ID: '{self.id}', Creator ID: '{self.user_id}', Project Name: '{self.name}', Project URL: '{self.url}', Date Created: '{self.date_created}')"

    def to_dict(self):
        return dict(
                    name = self.name,
                    url = self.url,
                    creator = self.creator.username,
                    date_created = self.date_created.strftime("%d/%m/%Y %H:%M:%S"),
                    sub_domains = get_crawled_urls(self.url),
                    goals = list(map(lambda x: x.to_dict(), self.goals))
                )

class Goal(database.Base):
    __tablename__ = 'goals'
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String(50), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    pages = relationship('Page', backref='goal_associated', lazy=True)

    def __repr__(self):
        return f"Goal(Goal ID: '{self.id}', Project ID: '{self.project_id}', Name: '{self.name}')"

    def to_dict(self):
        return dict(
                    name = self.name,
                    project = self.project_associated.name,
                    pages = list(map(lambda x: x.to_dict(), self.pages))
                )

class Page(database.Base):
    __tablename__ = 'pages'
    id = Column(Integer, nullable=False, primary_key=True)
    name = Column(String(50), nullable=False)
    url = Column(String(200), nullable=False)
    inputs = Column(String(1024), nullable=False)
    terminal_state = Column(String(100), nullable=False)
    goal_id = Column(Integer, ForeignKey('goals.id'), nullable=False)

    def __repr__(self):
        return f"Page(Page ID: '{self.id}', Goal ID: '{self.project_id}', Name: '{self.name}', URL: '{self.url}')"

    def to_dict(self):
        return dict(
                    name = self.name,
                    url = self.url,
                    inputs = self.inputs.split(DELIMITER),
                    terminal_state = self.terminal_state,
                    goal = self.goal_associated.name
                )