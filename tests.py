from main import app
from tests import users, projects
from fastapi.testclient import TestClient

client = TestClient(app)

if __name__ == '__main__':
    users.main(client)
    projects.main(client)