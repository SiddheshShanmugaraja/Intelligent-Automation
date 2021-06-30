def create_app():   
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from . import database, models, auth, agent
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI()
    app.include_router(auth.auth)
    app.include_router(agent.agent)
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    database.Base.metadata.create_all(bind=database.engine)
    return app