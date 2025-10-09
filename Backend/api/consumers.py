# your_project/api/consumers.py
import json
from django.db.models import Q
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Friendship # <-- Correct import

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        # Using Redis for presence status
        redis_conn = self.channel_layer.connection(0)
        await redis_conn.set(f"presence_{self.user.id}", "online")

        self.user_group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

        friends = await self.get_user_friends()
        for friend in friends:
            await self.channel_layer.group_send(
                f'user_{friend.id}',
                {'type': 'friend.online', 'user_id': self.user.id, 'username': self.user.username}
            )

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            return
        
        # Using Redis for presence status
        redis_conn = self.channel_layer.connection(0)
        await redis_conn.set(f"presence_{self.user.id}", "offline")

        friends = await self.get_user_friends()
        for friend in friends:
            await self.channel_layer.group_send(
                f'user_{friend.id}',
                {'type': 'friend.offline', 'user_id': self.user.id}
            )
        
        await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    # ... receive method and event handlers (friend_online, etc.) are the same ...
    async def receive(self, text_data):
        # ... your receive logic here ...
        pass

    async def friend_online(self, event): await self.send(text_data=json.dumps(event))
    async def friend_offline(self, event): await self.send(text_data=json.dumps(event))
    async def friend_status_update(self, event): await self.send(text_data=json.dumps(event))
    
    @database_sync_to_async
    def get_user_friends(self):
        User = self.user.__class__
        friendships = Friendship.objects.filter(Q(user1=self.user) | Q(user2=self.user))
        friend_ids = set(
            fs.user2.id if fs.user1 == self.user else fs.user1.id for fs in friendships
        )
        return list(User.objects.filter(id__in=friend_ids))