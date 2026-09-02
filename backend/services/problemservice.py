import httpx
import logging
from sqlalchemy.orm import Session
from utils.db import LocalSession
from models.problemmodel import Problem
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger("uvicorn")

scheduler = AsyncIOScheduler()

def get_difficulty(rating: int | None) -> str | None:
    if rating is None:
        return None
    if rating <= 1000:
        return "Easy"
    elif 1000 < rating < 1700:
        return "Medium"
    else:
        return "Hard"

TOPIC_WEIGHTS = {
    "dynamic programming": 35.0, "dp": 35.0,
    "segment tree": 45.0, "fenwick tree": 40.0, "trees": 30.0, "tree": 30.0,
    "graphs": 35.0, "graph": 35.0, "shortest paths": 35.0, "dfs and similar": 25.0, "bfs": 25.0,
    "flows": 45.0, "matching": 40.0,
    "math": 25.0, "number theory": 35.0, "combinatorics": 35.0, "geometry": 35.0,
    "string": 20.0, "strings": 20.0, "string suffix structures": 45.0,
    "bit manipulation": 20.0, "bitmasks": 25.0,
    "binary search": 20.0, "two pointers": 15.0, "sliding window": 20.0,
    "divide and conquer": 25.0, "greedy": 15.0,
    "data structures": 20.0, "constructive algorithms": 20.0,
    "implementation": 10.0, "brute force": 10.0, "sorting": 10.0,
}

def calculate_embedding_score(rating: int | float | None, topics: list[str] | None, difficulty: str | None) -> float:
    if rating is not None:
        base_rating = float(rating)
    else:
        base_rating = {"Easy": 800.0, "Medium": 1400.0, "Hard": 2000.0}.get(str(difficulty), 1200.0)

    if topics and isinstance(topics, list) and len(topics) > 0:
        weights = [TOPIC_WEIGHTS.get(str(t).lower().strip(), 15.0) for t in topics]
        max_weight = max(weights)
        avg_weight = sum(weights) / len(weights)
        topic_score = max_weight * 0.7 + avg_weight * 0.3
    else:
        topic_score = 10.0

    return round(base_rating + topic_score, 2)

async def fetch_and_sync_codeforces_problems():
    url = "https://codeforces.com/api/problemset.problems"
    logger.info("Fetching Codeforces problems...")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code != 200:
                logger.error(f"Failed to fetch Codeforces problems: {response.status_code}")
                return
            data = response.json()
    except Exception as e:
        logger.error(f"Error fetching Codeforces problems: {e}")
        return

    if data.get("status") != "OK":
        logger.error("Codeforces API response status is not OK")
        return

    problems_list = data.get("result", {}).get("problems", [])
    if not problems_list:
        logger.info("No problems returned from Codeforces API")
        return

    db: Session = LocalSession()
    try:
        db_count = db.query(Problem).filter(Problem.platform == "codeforces").count()
        fetched_count = len(problems_list)

        logger.info(f"Codeforces API returned {fetched_count} problems. Existing in DB: {db_count}")

        if fetched_count == db_count:
            logger.info("No new problems found. Skipping DB sync.")
            return

        existing_urls = set(
            u[0] for u in db.query(Problem.url).filter(Problem.platform == "codeforces").all()
        )

        new_problem_objects = []
        for p in problems_list:
            contest_id = p.get("contestId")
            index = p.get("index")
            name = p.get("name")

            if not contest_id or not index or not name:
                continue

            problem_url = f"https://codeforces.com/problemset/problem/{contest_id}/{index}"

            if problem_url in existing_urls:
                continue

            rating = p.get("rating")
            topics = p.get("tags", [])
            difficulty = get_difficulty(rating)
            embedding_score = calculate_embedding_score(rating, topics, difficulty)

            new_problem = Problem(
                title=name,
                url=problem_url,
                platform="codeforces",
                rating=rating,
                difficulty=difficulty,
                topics=topics,
                embedding_score=embedding_score
            )
            new_problem_objects.append(new_problem)
            existing_urls.add(problem_url)

        if new_problem_objects:
            db.add_all(new_problem_objects)
            db.commit()
            logger.info(f"Successfully added {len(new_problem_objects)} new Codeforces problems to DB.")
        else:
            logger.info("No new unique Codeforces problems to insert.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error syncing Codeforces problems: {e}")
    finally:
        db.close()

def start_codeforces_scheduler():
    scheduler.add_job(
        fetch_and_sync_codeforces_problems,
        trigger=CronTrigger(hour=0, minute=0),
        id="codeforces_sync_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Codeforces problem sync scheduler started (runs daily at 12:00 AM).")
