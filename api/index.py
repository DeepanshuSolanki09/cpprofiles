import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
for path in [current_dir, backend_dir]:
    if path and path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.main import app
except ModuleNotFoundError:
    from main import app
