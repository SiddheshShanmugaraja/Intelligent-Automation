import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

with open("backend/config.json", "r") as f:
    config = json.load(f)

DB_ENGINE = config.get("DB_ENGINE")

if DB_ENGINE.upper() == 'MYSQL':
    MYSQL_DB_HOST = config.get("MYSQL_DB_HOST")
    MYSQL_DB_NAME = config.get("MYSQL_DB_NAME")
    MYSQL_SECRET_KEY = config.get("SECRET_KEY")
    MYSQL_DB_USERNAME = config.get("MYSQL_DB_USERNAME")
    MYSQL_DB_PASSWORD = config.get("MYSQL_DB_PASSWORD")
    DATABASE_URI = f'mysql+mysqlconnector://{MYSQL_DB_USERNAME}:{MYSQL_DB_PASSWORD}@{MYSQL_DB_HOST}/{MYSQL_DB_NAME}'
elif DB_ENGINE.upper() == 'SQLITE':
    SQLITE_DB_FILE_NAME = config.get("SQLITE_DB_FILE_NAME")
    if not os.path.isfile(SQLITE_DB_FILE_NAME):
        os.mknod(SQLITE_DB_FILE_NAME)
    DATABASE_URI = f'sqlite:///./{SQLITE_DB_FILE_NAME}'
else:
    print('Invalid Database engine selected, select either MySQL or SQLite')

engine = create_engine(DATABASE_URI)

Base = declarative_base()

session = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db() -> Session:
    """Yields the session for the Database engine to query, modify and commit.

    Yields:
        Iterator[Session]: Database Session object from SQL Alchemy Object Relational Mapper.
    """
    db = session()
    try:
        yield db 
    finally:
        db.close()