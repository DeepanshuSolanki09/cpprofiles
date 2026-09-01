import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from utils.settings import settings

db_url = settings.DB_CONNECTION
if not db_url or "sqlite" in db_url:
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        db_url = "sqlite:////tmp/app.db"
    elif not db_url:
        db_url = "sqlite:///./app.db"

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

try:
    import pg8000
    if db_url.startswith("postgresql://") and "+pg8000" not in db_url and "+psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
except ImportError:
    try:
        import psycopg2
        if db_url.startswith("postgresql://") and "+psycopg2" not in db_url:
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    except ImportError:
        pass


Base = declarative_base()

def _init_engine(url_str):
    if "sqlite" in url_str:
        return create_engine(url=url_str, connect_args={"check_same_thread": False})
    return create_engine(url=url_str, pool_pre_ping=True)

try:
    engine = _init_engine(db_url)
    if "sqlite" not in db_url:
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"PostgreSQL DB Connection failed ('{e}'). Falling back to local SQLite database.")
    tmp_path = "/tmp/app.db" if (os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV")) else "./app.db"
    db_url = f"sqlite:///{tmp_path}"
    engine = create_engine(url=db_url, connect_args={"check_same_thread": False})


LocalSession = sessionmaker(bind=engine)

def get_db():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Auto table creation warning: {exc}")
    session = LocalSession()
    try:
        yield session
    finally:
        session.close()


        
