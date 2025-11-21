import pickle
import os
import time
from pathlib import Path
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings


class CacheService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self.memory_cache: dict = {}
        self.use_redis = False
        self.cache_dir = Path(settings.CACHE_DIR)
        self.cache_dir.mkdir(exist_ok=True)

        if settings.REDIS_URL:
            try:
                self.redis = redis.from_url(
                    settings.REDIS_URL, encoding="utf-8", decode_responses=False
                )
                self.use_redis = True
            except Exception as e:
                print(f"⚠️ Failed to connect to Redis: {e}. Falling back to file cache.")

    def _get_file_path(self, key: str) -> Path:
        # Sanitize key for filename
        safe_key = "".join(
            c if c.isalnum() or c in "._-" else "_" for c in key
        )
        return self.cache_dir / f"{safe_key}.cache"

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if self.use_redis and self.redis:
            try:
                data = await self.redis.get(key)
                if data:
                    return pickle.loads(data)
            except Exception as e:
                print(f"⚠️ Redis get error: {e}")
        else:
            # File-based cache fallback
            file_path = self._get_file_path(key)
            if file_path.exists():
                try:
                    with open(file_path, "rb") as f:
                        data, expiry = pickle.load(f)
                        if expiry > time.time():
                            return data
                        else:
                            # Expired
                            os.remove(file_path)
                except Exception:
                    pass
        return None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        """Set value in cache with TTL (seconds)"""
        if self.use_redis and self.redis:
            try:
                data = pickle.dumps(value)
                await self.redis.set(key, data, ex=ttl)
            except Exception as e:
                print(f"⚠️ Redis set error: {e}")
        else:
            # File-based cache fallback
            file_path = self._get_file_path(key)
            expiry = time.time() + ttl
            try:
                with open(file_path, "wb") as f:
                    pickle.dump((value, expiry), f)
            except Exception as e:
                print(f"⚠️ File cache set error: {e}")

    async def delete(self, key: str):
        """Delete value from cache"""
        if self.use_redis and self.redis:
            await self.redis.delete(key)
        else:
            file_path = self._get_file_path(key)
            if file_path.exists():
                os.remove(file_path)

    async def clear(self):
        """Clear all cache"""
        if self.use_redis and self.redis:
            await self.redis.flushdb()
        else:
            for file_path in self.cache_dir.glob("*.cache"):
                os.remove(file_path)


# Global cache instance
cache = CacheService()
