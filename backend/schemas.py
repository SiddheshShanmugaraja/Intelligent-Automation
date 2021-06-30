from pydantic import BaseModel
from typing import List
class Page(BaseModel):
    actions: List[str]
    terminalState: str
    pageName: str
    url: str
class Goal(BaseModel): 
    goal: str
    pages: List[Page]
class Project(BaseModel):
    projectName: str
    username: str   
    data: List[Goal]