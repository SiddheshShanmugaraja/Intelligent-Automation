import os
import json 

with open('backend/config.json', 'r') as f:
    config = json.load(f)

STATIC_DIRECTORY_PATH = config.get('STATIC_DIRECTORY_PATH')
STATIC_DIRECTORY_NAME = STATIC_DIRECTORY_PATH.replace('/', '')

def create_app():   
    """Creates and returns an object of type FastAPI(), creates and connects to the database tables and add the routers to the main app."""
    from fastapi import FastAPI
    from . import database, auth, agent
    from fastapi.staticfiles import StaticFiles
    from fastapi.middleware.cors import CORSMiddleware

    # Initialize the FastAPI object
    app = FastAPI()

    # Include routers for agent.py and auth.py
    app.include_router(auth.auth)
    app.include_router(agent.agent)

    # Mount the static directory to the FastAPI app
    app.mount(STATIC_DIRECTORY_PATH, StaticFiles(directory=STATIC_DIRECTORY_NAME), name=STATIC_DIRECTORY_NAME)
    
    # Add CORS middleware for Cross Origin Resource Sharing
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    
    # Bind the Database engine to the FastAPI app object
    database.Base.metadata.create_all(bind=database.engine)
    return app