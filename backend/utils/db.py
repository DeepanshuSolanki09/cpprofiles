from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .settings import settings

db_url = settings.DB_CONNECTION or "sqlite:///./app.db"
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

Base = declarative_base()

try:
    if "sqlite" in db_url:
        engine = create_engine(url=db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(url=db_url, pool_pre_ping=True)
except Exception as e:
    print(f"Error creating DB engine with '{db_url}': {e}")
    engine = create_engine(url="sqlite:///./app.db", connect_args={"check_same_thread": False})

LocalSession = sessionmaker(bind=engine)

def get_db():
    session = LocalSession()
    try:
        yield session
    finally:
        session.close()

        
