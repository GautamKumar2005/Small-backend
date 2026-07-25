from fastapi import FastAPI
from agent import Agent

app = FastAPI()
agent = Agent()

@app.get("/")
def read_root():
    return {"message": "Agent Backend is running"}

@app.post("/run")
def run_agent(task: str):
    result = agent.run(task)
    return {"result": result}
