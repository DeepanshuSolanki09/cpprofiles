import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from utils.db import Base, engine
from models.usermodels import User, Profile
from models.problemmodel import Problem
from models.userroutes import router as user_router

IS_VERCEL = os.environ.get("VERCEL") == "1" or os.environ.get("VERCEL_ENV") is not None


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database initialization warning: {exc}")

    if not IS_VERCEL:
        try:
            from services.problemservice import start_codeforces_scheduler, fetch_and_sync_codeforces_problems
            from services.leetcodeservice import start_leetcode_scheduler, fetch_and_sync_leetcode_problems
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
    else:
        print("Running in Vercel Serverless environment. Disabling background schedulers.")
        
    yield
    
    if not IS_VERCEL:
        try:
            from services.problemservice import scheduler as cf_scheduler
            from services.leetcodeservice import scheduler as lc_scheduler
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



