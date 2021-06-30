import json
import uvicorn
from backend import create_app

# Load the config file
with open('backend/config.json', 'r') as f:
    config = json.load(f)

HOST = config.get('HOST')
PORT = config.get('PORT')
RUN_COMMAND = config.get('RUN_COMMAND')

# Create the FastAPI app
app = create_app()

# Run the Backend Server on Uvicorn (ASGI Server)
if __name__ == '__main__':
    uvicorn.run(RUN_COMMAND, host=HOST, port=PORT, reload=True)