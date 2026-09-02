import asyncio
import json
import logging
import os
import httpx
from typing import Dict, Any, List
from utils.settings import settings

logger = logging.getLogger("uvicorn")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini"
]


def _get_groq_api_key() -> str:
    key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
    if key:
        return key.strip()
    
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("GROQ_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return ""

def _get_gemini_api_key() -> str:
    key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if key:
        return key.strip()
    
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip().startswith("GEMINI_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return ""

def _sanitize_dashboard_data(dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(dashboard_data, dict):
        return {}

    sanitized = {}

    # LeetCode
    lc = dashboard_data.get("leetcode", {})
    if isinstance(lc, dict):
        lc_prof = lc.get("profile", {})
        if isinstance(lc_prof, dict):
            sanitized["leetcode"] = {
                "totalSolved": lc_prof.get("totalSolved"),
                "easySolved": lc_prof.get("easySolved"),
                "mediumSolved": lc_prof.get("mediumSolved"),
                "hardSolved": lc_prof.get("hardSolved"),
                "ranking": lc_prof.get("ranking")
            }

    # Codeforces
    cf = dashboard_data.get("codeforces", {})
    if isinstance(cf, dict):
        cf_info = cf.get("profile", {}).get("info", {}).get("result", [])
        user_info = cf_info[0] if isinstance(cf_info, list) and cf_info else {}
        
        cf_subs = cf.get("profile", {}).get("status", {}).get("result", [])
        recent_subs = []
        if isinstance(cf_subs, list):
            for s in cf_subs[:25]:
                prob = s.get("problem", {})
                recent_subs.append({
                    "name": prob.get("name"),
                    "rating": prob.get("rating"),
                    "tags": prob.get("tags"),
                    "verdict": s.get("verdict")
                })

        sanitized["codeforces"] = {
            "handle": user_info.get("handle"),
            "rating": user_info.get("rating"),
            "maxRating": user_info.get("maxRating"),
            "rank": user_info.get("rank"),
            "recent_submissions_sample": recent_subs
        }

    # CodeChef
    cc = dashboard_data.get("codechef", {})
    if isinstance(cc, dict):
        sanitized["codechef"] = {
            "rating": cc.get("currentRating"),
            "stars": cc.get("stars"),
            "globalRank": cc.get("globalRank"),
            "problems_solved": cc.get("problems_solved")
        }

    # AtCoder
    at = dashboard_data.get("atcoder", {})
    if isinstance(at, dict):
        sanitized["atcoder"] = {
            "rating": at.get("rating"),
            "highest": at.get("highest"),
            "rank": at.get("rank")
        }

    # GitHub
    gh = dashboard_data.get("github", {})
    if isinstance(gh, dict):
        gh_prof = gh.get("profile", {})
        if isinstance(gh_prof, dict):
            sanitized["github"] = {
                "public_repos": gh_prof.get("public_repos"),
                "followers": gh_prof.get("followers")
            }

    return sanitized

async def _call_groq_api(system_prompt: str, user_prompt: str, api_key: str) -> Dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    last_error = None
    async with httpx.AsyncClient(timeout=15.0) as client:
        for model in GROQ_MODELS:
            try:
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }
                response = await client.post(GROQ_API_URL, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    return json.loads(content)
                else:
                    last_error = f"Model {model} returned HTTP {response.status_code}: {response.text}"
            except Exception as e:
                last_error = f"Model {model} failed: {e}"

    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")

async def _call_gemini_api(system_prompt: str, user_prompt: str, api_key: str) -> Dict[str, Any]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{system_prompt}\n\n{user_prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            raise RuntimeError(f"Gemini API error HTTP {response.status_code}: {response.text}")
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return json.loads(text)


async def analyze_user_weakness(dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
    groq_key = _get_groq_api_key()
    gemini_key = _get_gemini_api_key()

    clean_data = _sanitize_dashboard_data(dashboard_data)

    system_prompt = (
        "You are a Competitive Programming AI coach. Analyze the user's competitive programming dashboard performance data "
        "(LeetCode, Codeforces, CodeChef, AtCoder, GitHub) and identify their weak areas.\n\n"
        "You MUST respond ONLY with a valid JSON object in the following format:\n"
        "{\n"
        '  "rating": <estimated target weakness rating integer e.g. 1400>,\n'
        '  "difficulty": <"Easy", "Medium", or "Hard">,\n'
        '  "topics": [<list of topic names where user is weak e.g. ["Dynamic Programming", "Graphs"]>],\n'
        '  "raw_analysis": <short summary explanation string>\n'
        "}"
    )

    user_prompt = f"Here is the user's dashboard performance data:\n{json.dumps(clean_data, default=str)}"

    if groq_key:
        try:
            logger.info("Calling Groq API for weakness analysis...")
            return await _call_groq_api(system_prompt, user_prompt, groq_key)
        except Exception as e:
            logger.error(f"Groq weakness analysis failed: {e}. Trying Gemini fallback...")

    if gemini_key:
        try:
            logger.info("Calling Gemini API (gemini-2.0-flash) for weakness analysis...")
            return await _call_gemini_api(system_prompt, user_prompt, gemini_key)
        except Exception as e:
            logger.error(f"Gemini weakness analysis failed: {e}")

    logger.warning("No working API keys found or all AI providers failed. Returning default fallback.")
    return {
        "rating": 1200,
        "difficulty": "Medium",
        "topics": ["Dynamic Programming", "Implementation"],
        "raw_analysis": "AI Service unavailable. Please check API Key configuration."
    }

async def analyze_user_profile(dashboard_data: Dict[str, Any]) -> Dict[str, Any]:
    groq_key = _get_groq_api_key()
    gemini_key = _get_gemini_api_key()

    clean_data = _sanitize_dashboard_data(dashboard_data)

    system_prompt = (
        "You are an expert Competitive Programming and Coding Coach. Analyze the user's competitive programming dashboard "
        "performance data (LeetCode, Codeforces, CodeChef, AtCoder, GitHub) and generate a comprehensive profile analysis report.\n\n"
        "You MUST respond ONLY with a valid JSON object in the following format:\n"
        "{\n"
        '  "strong_topics": [<list of topics/skills user excels at e.g. ["Implementation", "Math"]>],\n'
        '  "weak_topics": [<list of topics where user needs improvement e.g. ["Dynamic Programming", "Graphs"]>],\n'
        '  "reasons": [<list of root causes for weaknesses e.g. ["Low submission accuracy on DP problems", "Timeouts on Graph problems"]>],\n'
        '  "how_to_improve": [<list of actionable advice strings>],\n'
        '  "platform_recommendation": <string explaining which platform to focus on and why>,\n'
        '  "rating_roadmap": [<step-by-step roadmap phases to push rating higher>],\n'
        '  "contest_insight": <insight string regarding user contest performance & solve speed>,\n'
        '  "consistency_score": <string rating e.g. "8/10 based on recent activity">\n'
        "}"
    )

    user_prompt = f"Here is the user's dashboard performance data:\n{json.dumps(clean_data, default=str)}"

    if groq_key:
        try:
            logger.info("Calling Groq API for profile analysis...")
            return await _call_groq_api(system_prompt, user_prompt, groq_key)
        except Exception as e:
            logger.error(f"Groq profile analysis failed: {e}. Trying Gemini fallback...")

    if gemini_key:
        try:
            logger.info("Calling Gemini API (gemini-2.0-flash) for profile analysis...")
            return await _call_gemini_api(system_prompt, user_prompt, gemini_key)
        except Exception as e:
            logger.error(f"Gemini profile analysis failed: {e}")

    logger.warning("No working API keys found or all AI providers failed. Returning default fallback.")
    return {
        "strong_topics": ["Implementation", "Math"],
        "weak_topics": ["Dynamic Programming", "Graphs"],
        "reasons": ["Inconsistent practice on complex algorithms"],
        "how_to_improve": ["Solve topic-wise DP problems daily", "Participate in regular contests"],
        "platform_recommendation": "Codeforces for speed, LeetCode for pattern practice",
        "rating_roadmap": ["Phase 1: Basic DP & Graphs", "Phase 2: Virtual Contests"],
        "contest_insight": "Good speed on easy problems, difficulty scaling up.",
        "consistency_score": "7/10"
    }
