import json
from django.db.models import Q
from django.contrib.auth import get_user_model  # Import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Friendship, Presence  # Remove 'User' from this import
import uuid
User = get_user_model()

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        # Set user status to online in the database
        await self.update_user_presence(self.user, 'online')

        # Join user-specific group
        self.user_group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

        # Notify friends that this user is online
        friends = await self.get_user_friends()
        for friend in friends:
            await self.channel_layer.group_send(
                f'user_{friend.id}',
                {
                    'type': 'friend.status.update',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'status': 'online'
                }
            )

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and not self.user.is_anonymous:
            # Set user status to offline in the database
            await self.update_user_presence(self.user, 'offline')

            # Notify friends that this user is offline
            friends = await self.get_user_friends()
            for friend in friends:
                await self.channel_layer.group_send(
                    f'user_{friend.id}',
                    {
                        'type': 'friend.status.update',
                        'user_id': self.user.id,
                        'status': 'offline'
                    }
                )
            
            # Leave the user group
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        # This is where you would handle messages sent FROM the client
        # For example, accepting/rejecting game invites
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'accept_game_invite':
            # Logic to handle game acceptance
            pass
        # Add other actions as needed

    # --- Event Handlers from Server -> Client ---

    async def friend_status_update(self, event):
        """ Handles friend status updates (online/offline). """
        await self.send(text_data=json.dumps(event))

    async def friend_request_new(self, event):
        """ Handles receiving a new friend request. """
        await self.send(text_data=json.dumps(event))

    async def friend_request_accepted(self, event):
        """ Handles a sent friend request being accepted. """
        await self.send(text_data=json.dumps(event))

    async def game_invite(self, event):
        """ Handles receiving a new game invite. """
        await self.send(text_data=json.dumps(event))
        
    # --- Database Methods ---

    @database_sync_to_async
    def get_user_friends(self):
        """ Fetches the user's friends from the database. """
        friendships = Friendship.objects.filter(Q(user1=self.user) | Q(user2=self.user))
        friend_ids = {fs.user2.id if fs.user1_id == self.user.id else fs.user1.id for fs in friendships}
        return list(User.objects.filter(id__in=friend_ids))

    @database_sync_to_async
    def update_user_presence(self, user, status):
        """ Updates the Presence model for the user. """
        Presence.objects.update_or_create(user=user, defaults={'status': status})

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'accept_game_invite':
            sender_id = data.get('sender_id')
            recipient = self.user
            game_id = str(uuid.uuid4())
            start_game_message = {
                'type': 'game.start',
                'game_id': game_id,
            }
            await self.channel_layer.group_send(f'user_{sender_id}', start_game_message)
            await self.channel_layer.group_send(f'user_{recipient.id}', start_game_message)

    async def game_start(self, event):
        """
        Handler for the game.start message. Sends the game_id to the client.
        """
        await self.send(text_data=json.dumps({
            'type': 'game.start',
            'game_id': event['game_id']
        }))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return

        # Every user joins the same group for global chat
        self.room_group_name = 'global_chat'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the global chat group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receive a message from the WebSocket and broadcast it to the group.
        """
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send the message to the entire group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message,
                'username': self.user.username
            }
        )

    async def chat_message(self, event):
        """
        Handler for messages sent to the group.
        Receives the message from the group and sends it to the client.
        """
        message = event['message']
        username = event['username']

        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))

# ... (keep PresenceConsumer and ChatConsumer) ...

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Get game_id from the URL
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        # Join the game room
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the game room
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # This is where you'll handle game moves later
        # For now, we'll just broadcast any message received
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game.message',
                'message': text_data,
                'sender': self.user.username
            }
        )

    async def game_message(self, event):
        # Send the received message back to the client
        await self.send(text_data=event['message'])

class GameChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
                    await self.close()
                    return

                # Get game_id from the URL
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.chat_group_name = f'gamechat_{self.game_id}'

                # Join the game chat room
        await self.channel_layer.group_add(
                    self.chat_group_name,
                    self.channel_name
                )
        await self.accept()

        async def disconnect(self, close_code):
                # Leave the game chat room
                await self.channel_layer.group_discard(
                    self.chat_group_name,
                    self.channel_name
                )

        async def receive(self, text_data):
                """
                Receive a chat message from the WebSocket and broadcast it to the game chat group.
                """
                text_data_json = json.loads(text_data)
                message = text_data_json.get('message', '')

                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'gamechat.message',
                        'message': message,
                        'username': self.user.username
                    }
                )

        async def gamechat_message(self, event):
                """
                Handler for messages sent to the game chat group.
                """
                await self.send(text_data=json.dumps({
                    'message': event['message'],
                    'username': event['username']
                }))