import asyncio
import httpx
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from utils.db import get_db
from utils.security import hash_password, verify_password, create_access_token, get_current_user
from utils.cache import dashboard_cache, analysis_cache
from models.usermodels import User, Profile
from models.userdtos import UserCreate, UserLogin, UserResponse, UserUpdate

from models.problemmodel import Problem

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/public-stats", response_model=Dict[str, Any])
def get_public_stats(db: Session = Depends(get_db)):
    try:
        total_users = db.query(User).count()
        total_problems = db.query(Problem).count()
        cf_problems = db.query(Problem).filter(Problem.platform == "codeforces").count()
        lc_problems = db.query(Problem).filter(Problem.platform == "leetcode").count()
        
        return {
            "active_coders": total_users,
            "total_problems": total_problems,
            "codeforces_problems": cf_problems,
            "leetcode_problems": lc_problems,
            "system_uptime": "99.99%"
        }
    except Exception as e:
        print(f"Error fetching public stats: {e}")
        return {
            "active_coders": 0,
            "total_problems": 0,
            "codeforces_problems": 0,
            "leetcode_problems": 0,
            "system_uptime": "99.99%"
        }


@router.get("/dashboard/{user_id}", response_model=Dict[str, Any])
async def get_user_dashboard(
    user_id: int,
    db: Session = Depends(get_db),
    force_refresh: bool = Query(False, description="Bypass cache and force fresh data fetch")
):
    cache_key = f"dashboard_{user_id}"
    if not force_refresh:
        cached_data = await dashboard_cache.get(cache_key)
        if cached_data is not None:
            return cached_data

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )

    profile = user.profile
    dashboard_data: Dict[str, Any] = {
        "leetcode": {},
        "codeforces": {},
        "codechef": {},
        "atcoder": {},
        "github": {}
    }

    if not profile:
        await dashboard_cache.set(cache_key, dashboard_data)
        return dashboard_data

    headers = {"User-Agent": "FastAPI-CP-Profiles"}

    LEETCODE_BASE = os.environ.get("LEETCODE_API_URL", "https://alfa-leetcode-api-main.vercel.app").rstrip("/")
    CODECHEF_ATCODER_BASE = os.environ.get("CODECHEF_ATCODER_API_URL", "https://codechefandatcoder.vercel.app").rstrip("/")

    async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
        tasks = {}

        if profile.leetcode_username:
            lc_user = profile.leetcode_username
            tasks["lc_prof"] = client.get(f"{LEETCODE_BASE}/{lc_user}/profile", timeout=8.0)
            tasks["lc_contest"] = client.get(f"{LEETCODE_BASE}/{lc_user}/contest", timeout=8.0)

        if profile.cf_username:
            cf_user = profile.cf_username
            tasks["cf_status"] = client.get(f"https://codeforces.com/api/user.status?handle={cf_user}", timeout=8.0)
            tasks["cf_info"] = client.get(f"https://codeforces.com/api/user.info?handles={cf_user}", timeout=8.0)
            tasks["cf_rating"] = client.get(f"https://codeforces.com/api/user.rating?handle={cf_user}", timeout=8.0)

        if profile.cc_username:
            cc_user = profile.cc_username
            tasks["cc"] = client.get(f"{CODECHEF_ATCODER_BASE}/codechef/{cc_user}", timeout=8.0)

        if profile.atcoder_username:
            at_user = profile.atcoder_username
            tasks["at"] = client.get(f"{CODECHEF_ATCODER_BASE}/atcoder/{at_user}", timeout=8.0)

        if profile.github_username:
            gh_user = profile.github_username
            tasks["gh_prof"] = client.get(f"https://api.github.com/users/{gh_user}", timeout=8.0)
            tasks["gh_repos"] = client.get(f"https://api.github.com/users/{gh_user}/repos?per_page=100", timeout=8.0)

        if tasks:
            keys = list(tasks.keys())
            responses = await asyncio.gather(*tasks.values(), return_exceptions=True)
            res_dict = dict(zip(keys, responses))

            def _get_json(key: str, default: Any) -> Any:
                res = res_dict.get(key)
                if isinstance(res, httpx.Response) and res.status_code == 200:
                    try:
                        return res.json()
                    except Exception as exc:
                        print(f"JSON parse error for {key}: {exc}")
                        return default
                elif isinstance(res, Exception):
                    print(f"HTTP fetch error for {key}: {res}")
                return default

            has_valid_data = False

            if profile.leetcode_username:
                lc_prof_data = _get_json("lc_prof", {})
                lc_cont_data = _get_json("lc_contest", {})
                dashboard_data["leetcode"] = {
                    "profile": lc_prof_data,
                    "contest_history": lc_cont_data
                }
                if lc_prof_data or lc_cont_data:
                    has_valid_data = True

            if profile.cf_username:
                cf_stat_data = _get_json("cf_status", {})
                cf_info_data = _get_json("cf_info", {})
                cf_rate_data = _get_json("cf_rating", {})
                dashboard_data["codeforces"] = {
                    "profile": {
                        "status": cf_stat_data,
                        "info": cf_info_data
                    },
                    "contest_history": cf_rate_data
                }
                if cf_stat_data or cf_info_data:
                    has_valid_data = True

            if profile.cc_username:
                cc_data = _get_json("cc", {})
                dashboard_data["codechef"] = cc_data
                if cc_data:
                    has_valid_data = True

            if profile.atcoder_username:
                at_data = _get_json("at", {})
                dashboard_data["atcoder"] = at_data
                if at_data:
                    has_valid_data = True

            if profile.github_username:
                gh_prof_data = _get_json("gh_prof", {})
                gh_repo_data = _get_json("gh_repos", [])
                dashboard_data["github"] = {
                    "profile": gh_prof_data,
                    "repos": gh_repo_data
                }
                if gh_prof_data or gh_repo_data:
                    has_valid_data = True

            if has_valid_data:
                await dashboard_cache.set(cache_key, dashboard_data)

    return dashboard_data

@router.get("/weakness/{user_id}", response_model=Dict[str, Any])
async def get_user_weakness_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    force_refresh: bool = Query(False, description="Bypass cache and force re-analysis")
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to access this weakness analysis"
        )

    cache_key = f"weakness_{user_id}"
    if not force_refresh:
        cached_result = await analysis_cache.get(cache_key)
        if cached_result is not None:
            return cached_result

    dashboard_data = await get_user_dashboard(user_id=user_id, db=db, force_refresh=force_refresh)
    
    from services.analysisservice import analyze_user_weakness
    from services.langchainservice import embed_weakness, query_similar_problems_by_vector

    weakness_info = await analyze_user_weakness(dashboard_data)
    
    gather_results = await asyncio.gather(
        embed_weakness(weakness_info),
        query_similar_problems_by_vector(weakness_info, k=10, db=db),
        return_exceptions=True
    )

    embedding_vector = gather_results[0] if isinstance(gather_results[0], list) else []
    recommended_problems = gather_results[1] if isinstance(gather_results[1], list) else []

    raw_topics = weakness_info.get("topics", [])
    if isinstance(raw_topics, str):
        topics_list = [raw_topics]
    elif isinstance(raw_topics, list):
        topics_list = raw_topics
    else:
        topics_list = ["Implementation", "Dynamic Programming"]

    result = {
        "user_id": user_id,
        "weakness": {
            "rating": weakness_info.get("rating"),
            "difficulty": weakness_info.get("difficulty"),
            "topics": topics_list
        },
        "weaknesses": topics_list,
        "raw_analysis": weakness_info.get("raw_analysis"),
        "embedding_vector": embedding_vector,
        "recommended_problems": recommended_problems,
        "recommendations": recommended_problems
    }

    raw_str = str(weakness_info.get("raw_analysis", "")).lower()
    if "unavailable" not in raw_str and "missing" not in raw_str:
        await analysis_cache.set(cache_key, result)

    return result

@router.get("/analysis/{user_id}", response_model=Dict[str, Any])
async def get_user_profile_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    force_refresh: bool = Query(False, description="Bypass cache and force re-analysis")
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to access this profile analysis"
        )

    cache_key = f"profile_analysis_{user_id}"
    if not force_refresh:
        cached_result = await analysis_cache.get(cache_key)
        if cached_result is not None:
            return cached_result

    dashboard_data = await get_user_dashboard(user_id=user_id, db=db, force_refresh=force_refresh)
    
    from services.analysisservice import analyze_user_profile

    profile_analysis = await analyze_user_profile(dashboard_data)

    result = {
        "user_id": user_id,
        "analysis": profile_analysis
    }

    reasons_str = str(profile_analysis.get("reasons", "")).lower()
    if "unavailable" not in reasons_str and "fallback" not in reasons_str:
        await analysis_cache.set(cache_key, result)

    return result


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email already registered"
        )

    hashed_pwd = hash_password(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_pwd,
        profile_picture=user_data.profile_picture,
        bio=user_data.bio,
        skills=user_data.skills
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if user_data.profile:
        new_profile = Profile(
            user_id=new_user.id,
            cf_username=user_data.profile.cf_username,
            cc_username=user_data.profile.cc_username,
            atcoder_username=user_data.profile.atcoder_username,
            leetcode_username=user_data.profile.leetcode_username,
            github_username=user_data.profile.github_username
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "id": new_user.id})

    user_response = UserResponse.model_validate(new_user)
    user_response.access_token = token
    user_response.token_type = "bearer"

    return user_response

@router.post("/login", response_model=UserResponse)
def user_login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="no email found"
        )

    if not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="invalid password"
        )

    token = create_access_token(data={"sub": user.email, "id": user.id})

    user_response = UserResponse.model_validate(user)
    user_response.access_token = token
    user_response.token_type = "bearer"

    return user_response

@router.get("/leaderboard", response_model=List[Dict[str, Any]])
async def get_solved_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).all()
    leaderboard = []

    for u in users:
        cache_key = f"dashboard_{u.id}"
        dash = await dashboard_cache.get(cache_key)
        
        lc_solved = 0
        cf_solved = 0
        cc_solved = 0

        if dash:
            lc_solved = dash.get("leetcode", {}).get("profile", {}).get("totalSolved", 0)
            
            cf_subs = dash.get("codeforces", {}).get("profile", {}).get("status", {}).get("result", [])
            if isinstance(cf_subs, list):
                cf_ok = set(f"{s.get('problem', {}).get('contestId')}-{s.get('problem', {}).get('index')}" for s in cf_subs if s.get("verdict") == "OK")
                cf_solved = len(cf_ok)

            try:
                cc_solved = int(dash.get("codechef", {}).get("problems_solved", 0) or 0)
            except Exception:
                cc_solved = 0

        total_solved = lc_solved + cf_solved + cc_solved

        leaderboard.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "profile_picture": u.profile_picture or "🐻",
            "total_solved": total_solved,
            "leetcode_solved": lc_solved,
            "cf_solved": cf_solved,
            "cc_solved": cc_solved,
            "profile": {
                "leetcode_username": u.profile.leetcode_username if u.profile else None,
                "cf_username": u.profile.cf_username if u.profile else None,
                "cc_username": u.profile.cc_username if u.profile else None,
                "atcoder_username": u.profile.atcoder_username if u.profile else None,
                "github_username": u.profile.github_username if u.profile else None,
            }
        })

    leaderboard.sort(key=lambda x: x["total_solved"], reverse=True)

    for idx, item in enumerate(leaderboard):
        item["rank"] = idx + 1

    return leaderboard
    

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    try:
        users = db.query(User).all()
        return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []


@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )
    if user.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="not authorized to update this profile"
        )

    if update_data.name is not None:
        user.name = update_data.name

    if update_data.email is not None:
        user.email = update_data.email

    if update_data.password is not None:
        user.password = hash_password(update_data.password)

    if update_data.profile_picture is not None:
        user.profile_picture = update_data.profile_picture

    if update_data.bio is not None:
        user.bio = update_data.bio

    if update_data.skills is not None:
        user.skills = update_data.skills

    if update_data.profile is not None:
        profile = user.profile
        if not profile:
            profile = Profile(user_id=user_id)
            db.add(profile)

        if update_data.profile.cf_username is not None:
            profile.cf_username = update_data.profile.cf_username
        if update_data.profile.cc_username is not None:
            profile.cc_username = update_data.profile.cc_username
        if update_data.profile.atcoder_username is not None:
            profile.atcoder_username = update_data.profile.atcoder_username
        if update_data.profile.leetcode_username is not None:
            profile.leetcode_username = update_data.profile.leetcode_username
        if update_data.profile.github_username is not None:
            profile.github_username = update_data.profile.github_username

    db.commit()
    db.refresh(user)

    return user

