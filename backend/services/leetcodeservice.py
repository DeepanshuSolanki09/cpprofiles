import os
import httpx
import logging
from sqlalchemy.orm import Session
from utils.db import LocalSession
from models.problemmodel import Problem
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger("uvicorn")

scheduler = AsyncIOScheduler()

def calculate_rating(difficulty: str, acceptance: float | None) -> int:
    base = {
        "Easy": 800,
        "Medium": 1400,
        "Hard": 2000
    }.get(difficulty, 1200)

    if acceptance is None:
        return base

    acr = acceptance / 100.0
    rating = base + 400 * (0.5 - acr)
    return round(rating)

from services.problemservice import calculate_embedding_score

async def fetch_and_sync_leetcode_problems():
    base_url = os.environ.get("LEETCODE_API_URL", "https://alfa-leetcode-api-main.vercel.app").rstrip("/")
    url = f"{base_url}/problems/?limit=4033"
    logger.info("Fetching LeetCode problems...")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code != 200:
                logger.error(f"Failed to fetch LeetCode problems: {response.status_code}")
                return
            data = response.json()
    except Exception as e:
        logger.error(f"Error fetching LeetCode problems: {e}")
        return

    problems_list = data.get("problemsetQuestionList", [])
    if not problems_list:
        logger.info("No problems returned from LeetCode API")
        return

    db: Session = LocalSession()
    try:
        db_count = db.query(Problem).filter(Problem.platform == "leetcode").count()
        fetched_count = len(problems_list)

        logger.info(f"LeetCode API returned {fetched_count} problems. Existing in DB: {db_count}")

        existing_urls = set(
            u[0] for u in db.query(Problem.url).filter(Problem.platform == "leetcode").all()
        )

        new_problem_objects = []
        for p in problems_list:
            title_slug = p.get("titleSlug")
            name = p.get("title")

            if not title_slug or not name:
                continue

            problem_url = f"https://leetcode.com/problems/{title_slug}"

            if problem_url in existing_urls:
                continue

            difficulty = p.get("difficulty")
            acceptance = p.get("acRate")
            rating = calculate_rating(difficulty, acceptance)
            
            topic_tags = p.get("topicTags", [])
            topics = [tag.get("name") for tag in topic_tags if tag.get("name")]
            
            embedding_score = calculate_embedding_score(rating, topics, difficulty)

            new_problem = Problem(
                title=name,
                url=problem_url,
                platform="leetcode",
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
            logger.info(f"Successfully added {len(new_problem_objects)} new LeetCode problems to DB.")
        else:
            logger.info("No new unique LeetCode problems to insert.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error syncing LeetCode problems: {e}")
    finally:
        db.close()

def start_leetcode_scheduler():
    scheduler.add_job(
        fetch_and_sync_leetcode_problems,
        trigger=CronTrigger(hour=0, minute=0),
        id="leetcode_sync_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("LeetCode problem sync scheduler started (runs daily at 12:00 AM).")