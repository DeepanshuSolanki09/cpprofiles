import time
import asyncio
from typing import Dict, Any, Optional, Tuple

class AsyncTTLCache:
    def __init__(self, default_ttl: int = 1800):
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self._default_ttl = default_ttl
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            if key not in self._cache:
                return None
            val, expiry = self._cache[key]
            if time.time() > expiry:
                del self._cache[key]
                return None
            return val

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        async with self._lock:
            expire_at = time.time() + (ttl if ttl is not None else self._default_ttl)
            self._cache[key] = (value, expire_at)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._cache.pop(key, None)

    async def clear(self) -> None:
        async with self._lock:
            self._cache.clear()

dashboard_cache = AsyncTTLCache(default_ttl=300)
analysis_cache = AsyncTTLCache(default_ttl=1800)
