# your_project/api/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/presence/$', consumers.PresenceConsumer.as_asgi()),
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/game/(?P<game_id>[\w-]+)/$', consumers.GameConsumer.as_asgi()),
    re_path(r'ws/gameChat/(?P<game_id>[\w-]+)/$', consumers.GameChatConsumer.as_asgi()),
]