from django.db import models
from django.contrib.auth.models import User

class Friendship(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendship_user2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')  # prevent duplicates

    def __str__(self):
        return f"{self.user1} ↔ {self.user2}"

class GameRecord(models.Model):
    player_x = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_x")
    player_o = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_as_o")
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games_won", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game {self.id}: {self.player_x} vs {self.player_o} - Winner: {self.winner if self.winner else 'Draw'}"