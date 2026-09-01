import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from utils.db import Base, engine
from models.usermodels import User, Profile
from models.problemmodel import Problem
from models.userroutes import router as user_router
from services.problemservice import start_codeforces_scheduler, fetch_and_sync_codeforces_problems, scheduler as cf_scheduler
from services.leetcodeservice import start_leetcode_scheduler, fetch_and_sync_leetcode_problems, scheduler as lc_scheduler

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"DB initialization warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        start_codeforces_scheduler()
        start_leetcode_scheduler()
        asyncio.create_task(fetch_and_sync_codeforces_problems())
        asyncio.create_task(fetch_and_sync_leetcode_problems())
        
        async def _init_knowledge_graph():
            from utils.db import LocalSession
            from services.langchainservice import build_problems_knowledge_graph
            db = LocalSession()
            try:
                await asyncio.to_thread(build_problems_knowledge_graph, db)
            except Exception as ex:
                print(f"Knowledge graph init warning: {ex}")
            finally:
                db.close()

        asyncio.create_task(_init_knowledge_graph())
    except Exception as e:
        print(f"Lifespan startup warning: {e}")
        
    yield
    try:
        if cf_scheduler.running:
            cf_scheduler.shutdown()
        if lc_scheduler.running:
            lc_scheduler.shutdown()
    except Exception as e:
        print(f"Lifespan shutdown warning: {e}")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)

@app.get("/hello")
def test():
    return {"message": "Hello World"}


