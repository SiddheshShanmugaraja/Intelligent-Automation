import json
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

with open("backend/config.json", "r") as f:
    config = json.load(f)

DB_HOST = config.get("DB_HOST")
DB_NAME = config.get("DB_NAME")
SECRET_KEY = config.get("SECRET_KEY")
DB_USERNAME = config.get("DB_USERNAME")
DB_PASSWORD = config.get("DB_PASSWORD")

DATABASE_URI = f'mysql+mysqlconnector://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'

engine = create_engine(DATABASE_URI)

Base = declarative_base()

session = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    """[summary]

    Yields:
        [type]: [description]
    """
    db = session()
    try:
        yield db 
    finally:
        db.close()