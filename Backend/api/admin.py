from django.contrib import admin
from django.utils.text import Truncator
from .models import (
    FriendRequest,
    Presence,
    Friendship,
    GameRecord,
    ChatMessage
)

# To enhance the User admin, if you have a custom user model admin
# from django.contrib.auth.admin import UserAdmin
# from django.contrib.auth import get_user_model
# User = get_user_model()


@admin.register(FriendRequest)
class FriendRequestAdmin(admin.ModelAdmin):
    """Admin configuration for the FriendRequest model."""
    list_display = ('user1', 'user2', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user1__username', 'user2__username')
    readonly_fields = ('created_at',)
    list_per_page = 25
    
    # Use raw_id_fields for better performance if you have many users
    raw_id_fields = ('user1', 'user2')


@admin.register(Presence)
class PresenceAdmin(admin.ModelAdmin):
    """Admin configuration for the Presence model."""
    list_display = ('user', 'status', 'updated_at')
    list_filter = ('status',)
    search_fields = ('user__username',)
    readonly_fields = ('updated_at',)
    list_per_page = 25
    raw_id_fields = ('user',)


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    """Admin configuration for the Friendship model."""
    list_display = ('user1', 'user2', 'created_at')
    search_fields = ('user1__username', 'user2__username')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    list_per_page = 25
    raw_id_fields = ('user1', 'user2')


@admin.register(GameRecord)
class GameRecordAdmin(admin.ModelAdmin):
    """Admin configuration for the GameRecord model."""
    list_display = ('id', 'player_x', 'player_o', 'winner', 'created_at')
    list_filter = ('winner',)
    search_fields = ('player_x__username', 'player_o__username', 'winner__username')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    list_per_page = 25
    raw_id_fields = ('player_x', 'player_o', 'winner')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin configuration for the ChatMessage model."""
    list_display = ('author', 'game_id', 'content_preview', 'timestamp')
    search_fields = ('author__username', 'content', 'game_id')
    readonly_fields = ('author', 'content', 'timestamp', 'game_id')
    date_hierarchy = 'timestamp'
    list_per_page = 25

    def content_preview(self, obj):
        """Creates a short preview of the message content."""
        return Truncator(obj.content).chars(50)
    
    content_preview.short_description = 'Message Preview'