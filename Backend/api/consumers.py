import json
from django.db.models import Q
from django.contrib.auth import get_user_model  # Import get_user_model
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Friendship, Presence  # Remove 'User' from this import
import uuid
import json
User = get_user_model()
import json
import logging
from html import escape
from .models import ChatMessage 

logger = logging.getLogger(__name__)


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


def calculate_winner(board):
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6],            # Diagonals
    ]
    for i in range(len(lines)):
        a, b, c = lines[i]
        if board and board[a] and board[a] == board[b] and board[a] == board[c]:
            return board[a]
    if board and not any(v is None for v in board):
        return 'Draw'
    return None

class GameConsumer(AsyncWebsocketConsumer):
    game_rooms = {}
    
    # --- The 'connect' and 'disconnect' methods are correct and remain the same ---
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

        if self.game_id not in self.game_rooms:
            self.game_rooms[self.game_id] = {'players': [], 'board': [None] * 9}
        
        room = self.game_rooms[self.game_id]
        
        if len(room['players']) < 2 and self.user.username not in [p['name'] for p in room['players']]:
            player_role = 'X' if len(room['players']) == 0 else 'O'
            room['players'].append({'name': self.user.username, 'channel': self.channel_name})
            
            await self.send(text_data=json.dumps({
                'type': 'player_assignment',
                'player': player_role,
            }))

    async def disconnect(self, close_code):
        if self.game_id in self.game_rooms:
            self.game_rooms.pop(self.game_id, None)
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)


    # --- CORRECTED 'receive' METHOD ---
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        message = {}

        # First, check what kind of message we received
        if message_type == 'game_move':
            board = data.get('board')
            winner = calculate_winner(board)
            
            if winner:
                message = {'type': 'game_over', 'board': board, 'winner': winner}
            else:
                message = {'type': 'game_move', 'board': board}
        
        elif message_type == 'play_again':
            # Reset the board on the server for this room
            if self.game_id in self.game_rooms:
                self.game_rooms[self.game_id]['board'] = [None] * 9
            # Create the restart message
            message = {'type': 'restart_game'}
        
        else:
            return # Ignore unknown message types

        # Broadcast the prepared message to the group
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'broadcast_message',
                'message': message,
                'sender_channel_name': self.channel_name
            }
        )

    # The 'broadcast_message' handler is also correct and remains the same
    async def broadcast_message(self, event):
        message = event['message']
        
        if message['type'] in ['game_over', 'restart_game']:
            await self.send(text_data=json.dumps(message))
        elif self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps(message))
class GameChatConsumer(AsyncWebsocketConsumer):
    """
    A robust, production-ready consumer for handling real-time chat
    within a specific game instance.
    """
    async def connect(self):
        self.user = self.scope["user"]

        # Authentication Check
        if self.user.is_anonymous:
            logger.warning("Anonymous user attempted to connect to game-chat. Rejected.")
            await self.close()
            return

        # Get game_id from the URL and validate it's present
        self.game_id = self.scope['url_route']['kwargs'].get('game_id')
        if not self.game_id:
            logger.error("Game chat connection attempt with no game_id. Rejected.")
            await self.close()
            return

        self.chat_group_name = f'gamechat_{self.game_id}'

        # Join the game chat room
        await self.channel_layer.group_add(
            self.chat_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"User '{self.user.username}' connected to game-chat for game '{self.game_id}'.")

    async def disconnect(self, close_code):
        # Leave the game chat room
        if hasattr(self, 'chat_group_name'):
            await self.channel_layer.group_discard(
                self.chat_group_name,
                self.channel_name
            )
        logger.info(f"User '{self.user.username}' disconnected from game-chat '{self.game_id}'. Code: {close_code}")

    async def receive(self, text_data):
        """
        Receives a chat message, validates it, saves it to the database,
        and then broadcasts it to the game chat group.
        """
        # 1. Validate incoming data structure
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self._send_error("Invalid JSON format.")
            return

        # 2. Validate message content
        message_text = data.get('message', '').strip()
        if not message_text:
            await self._send_error("Message cannot be empty.")
            return

        # 3. Security: Sanitize input to prevent XSS attacks
        sanitized_message = escape(message_text)

        # 4. Save the message to the database (asynchronously)
        try:
            chat_message = await self._save_message(sanitized_message)
        except Exception as e:
            logger.error(f"Error saving game-chat message for user {self.user.username}: {e}")
            await self._send_error("An internal error occurred while saving your message.")
            return

        # 5. Broadcast the message to the group
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                'type': 'gamechat.message',
                'payload': {
                    'id': chat_message.id,
                    'username': self.user.username,
                    'message': chat_message.content,
                    'timestamp': chat_message.timestamp.isoformat(),
                }
            }
        )

    async def gamechat_message(self, event):
        """
        Handler for messages sent to the game chat group.
        Sends the structured payload to the client.
        """
        await self.send(text_data=json.dumps({
            'type': 'game_chat_message',
            'payload': event['payload']
        }))

    # --- Helper Methods ---

    @database_sync_to_async
    def _save_message(self, message_content: str):
        """
        Saves a chat message to the database, associating it with this game.
        """
        return ChatMessage.objects.create(
            author=self.user,
            content=message_content,
            game_id=self.game_id  # Associate message with the game
        )

    async def _send_error(self, message: str):
        """
        Sends a formatted error message to the client.
        """
        await self.send(text_data=json.dumps({
            'type': 'error',
            'payload': { 'message': message }
        }))
