# api/middleware.py
import urllib.parse
import jwt
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth.models import AnonymousUser

@database_sync_to_async
def get_user_model_instance(user_id):
    from django.contrib.auth import get_user_model  
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = urllib.parse.parse_qs(query_string)
        token_list = params.get("token", None)

        if token_list:
            token = token_list[0]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get("user_id")
                scope["user"] = await get_user_model_instance(user_id)
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
