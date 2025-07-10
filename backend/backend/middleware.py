# your_project/middleware.py
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user_from_token(token):
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import AnonymousUser

        access_token = AccessToken(token)
        user_model = get_user_model()
        return user_model.objects.get(id=access_token["user_id"])
    except Exception:
        from django.contrib.auth.models import AnonymousUser
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        token = None

        # Extract token from cookie header
        cookie_header = headers.get(b"cookie", b"").decode()
        for cookie in cookie_header.split(";"):
            if "access_token=" in cookie:
                token = cookie.strip().split("=", 1)[1]
                break

        scope["user"] = await get_user_from_token(token) if token else None
        return await super().__call__(scope, receive, send)
