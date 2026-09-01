import os

db_url = settings.DB_CONNECTION
if not db_url or "sqlite" in db_url:
    if os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV"):
        db_url = "sqlite:////tmp/app.db"
    elif not db_url:
        db_url = "sqlite:///./app.db"

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
    tmp_path = "/tmp/app.db" if (os.environ.get("VERCEL") or os.environ.get("VERCEL_ENV")) else "./app.db"
    engine = create_engine(url=f"sqlite:///{tmp_path}", connect_args={"check_same_thread": False})


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


        
