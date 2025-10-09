from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()


class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friend_requests_sent")
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friend_requests_received")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} → {self.user2} ({self.status})"
    
class Presence(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('in-game', 'In-Game'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="presence")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}: {self.status}"

class Friendship(models.Model):
    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendship_user1")
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="friendship_user2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} ↔ {self.user2}"

class GameRecord(models.Model):
    player_x = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="games_as_x")
    player_o = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="games_as_o")
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="games_won", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game {self.id}: {self.player_x} vs {self.player_o} - Winner: {self.winner if self.winner else 'Draw'}"


class ChatMessage(models.Model):
    author = models.ForeignKey(
        User,
        related_name='chat_messages',
        on_delete=models.CASCADE
    )
    game_id = models.CharField(max_length=255, null=True, blank=True, db_index=True) 
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author.username}: {self.content[:25]}...'

    class Meta:
        ordering = ['timestamp']