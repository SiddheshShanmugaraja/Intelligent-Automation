def create_app():   
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from . import database, models, auth, agent

    app = FastAPI()
    app.include_router(auth.auth)
    app.include_router(agent.agent)
    app.mount("/static", StaticFiles(directory="static"), name="static")

    database.Base.metadata.create_all(bind=database.engine)
    return app