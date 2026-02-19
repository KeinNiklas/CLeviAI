import sys
import os

# Ensure api/ directory is in the Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app as fastapi_app

# Vercel routes /api/* to this function, but FastAPI routes are defined
# without the /api prefix (e.g. /auth/token, not /api/auth/token).
# This middleware strips the /api prefix before FastAPI processes the request.
class StripApiPrefixMiddleware:
    def __init__(self, inner_app, prefix: str = "/api"):
        self.app = inner_app
        self.prefix = prefix

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            path: str = scope.get("path", "/")
            if path.startswith(self.prefix + "/"):
                stripped = path[len(self.prefix):]
                scope = {**scope, "path": stripped, "raw_path": stripped.encode()}
            elif path == self.prefix:
                scope = {**scope, "path": "/", "raw_path": b"/"}
        await self.app(scope, receive, send)

app = StripApiPrefixMiddleware(fastapi_app)
