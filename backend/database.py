import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

class InvalidDatabaseEngine(Exception):
    """Exception raised for errors in the database engine name.

    Attributes:
        db_engine (str): Input databse engine name which caused the error.
        message (str): Explanation of the error.
    """
    def __init__(self, db_engine: str, message: str = "Invalid Database engine selected, select either MySQL or SQLite and update it in the backend/config.json file"):
        self.db_engine = db_engine
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f'{self.db_engine} -> {self.message}'

with open("backend/config.json", "r") as f:
    config = json.load(f)

MODE = config.get("MODE")

# Choose a database engine, either MySQL or SQLite
# SQLite configuration for Testing
if MODE.upper() == 'TEST':
    SQLITE_TEST_DB_FILE_NAME = config.get("SQLITE_TEST_DB_FILE_NAME")
    if os.path.isfile(SQLITE_TEST_DB_FILE_NAME):
        os.remove(SQLITE_TEST_DB_FILE_NAME)
    if not os.path.isfile(SQLITE_TEST_DB_FILE_NAME):
        os.mknod(SQLITE_TEST_DB_FILE_NAME)
    DATABASE_URI = f'sqlite:///./{SQLITE_TEST_DB_FILE_NAME}'
    connect_args = dict(check_same_thread=False)

# SQLite Databse configuration for Development
elif MODE.upper() == 'DEVELOPMENT':
    SQLITE_DEV_DB_FILE_NAME = config.get("SQLITE_DEV_DB_FILE_NAME")
    if not os.path.isfile(SQLITE_DEV_DB_FILE_NAME):
        os.mknod(SQLITE_DEV_DB_FILE_NAME)
    DATABASE_URI = f'sqlite:///./{SQLITE_DEV_DB_FILE_NAME}'
    connect_args = dict(check_same_thread=False)

# MySQL Database configuration for Production
elif MODE.upper() == 'PRODUCTION':
    MYSQL_DB_HOST = config.get("MYSQL_DB_HOST")
    MYSQL_DB_NAME = config.get("MYSQL_DB_NAME")
    MYSQL_SECRET_KEY = config.get("SECRET_KEY")
    MYSQL_DB_USERNAME = config.get("MYSQL_DB_USERNAME")
    MYSQL_DB_PASSWORD = config.get("MYSQL_DB_PASSWORD")
    DATABASE_URI = f'mysql+mysqlconnector://{MYSQL_DB_USERNAME}:{MYSQL_DB_PASSWORD}@{MYSQL_DB_HOST}/{MYSQL_DB_NAME}'
    connect_args = dict()

engine = create_engine(DATABASE_URI, connect_args=connect_args)

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