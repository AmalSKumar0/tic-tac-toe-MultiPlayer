from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Presence, Friendship, FriendRequest


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        username = validated_data.get('username')
        email = validated_data.get('email')
        password = validated_data.get('password')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        return user

UserModel = get_user_model()

class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['id', 'username']

class PresenceSerializer(serializers.ModelSerializer):
    user = FriendUserSerializer(read_only=True)

    class Meta:
        model = Presence
        fields = ['user', 'status']

class FriendRequestSerializer(serializers.ModelSerializer):
    user1 = FriendUserSerializer(read_only=True)
    user2 = FriendUserSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'user1', 'user2', 'status', 'created_at']
