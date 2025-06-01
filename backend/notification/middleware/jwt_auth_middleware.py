from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.db import close_old_connections
from asgiref.sync import sync_to_async

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()  # ✅ Always close old DB connections first

        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            scope["user"] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        try:
            validated_token = UntypedToken(token)  # ✅ will raise if invalid
            user_id = validated_token.get("user_id")

            if not user_id:
                raise InvalidToken("No user_id in token")

            user = await sync_to_async(User.objects.get)(id=user_id)
            scope["user"] = user
        except (InvalidToken, TokenError, User.DoesNotExist) as e:
            print(f"JWTAuthMiddleware error: {str(e)}")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
