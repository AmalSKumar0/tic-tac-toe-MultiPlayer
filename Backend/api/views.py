# api/views.py

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.layers import get_channel_layer # This import might be from my previous suggestion
from asgiref.sync import async_to_sync     # This import might be from my previous suggestion

from .serializers import UserSerializer , FriendRequestSerializer
from .models import Friendship, FriendRequest, Presence

# FIX: Define the User model right after imports
User = get_user_model()


# ----------------------------
# User Registration
# ----------------------------
class UserCreate(generics.CreateAPIView):
    # Now 'User' is defined and can be used here
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=400)

# ... the rest of your views.py file ...
# ----------------------------
# Friends List
# ----------------------------
@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def friends_list(request):
    user = request.user
    friendships = Friendship.objects.filter(user1=user).select_related("user2") | \
                  Friendship.objects.filter(user2=user).select_related("user1")

    friends = []
    for f in friendships:
        friend = f.user2 if f.user1 == user else f.user1
        presence = Presence.objects.filter(user=friend).first()
        status = presence.status if presence else "offline"
        friends.append({
            "id": friend.id,
            "username": friend.username,
            "status": status
        })

    # sort online first
    friends_sorted = sorted(friends, key=lambda x: x["status"] != "online")
    return Response(friends_sorted)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_requests(request):
    requests = FriendRequest.objects.filter(user2=request.user, status='pending')
    serializer = FriendRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_game_request(request, friend_id):
    friend = get_object_or_404(User, id=friend_id)
    sender = request.user

    presence = Presence.objects.filter(user=friend).first()
    if not presence or presence.status != "online":
        return Response({"detail": "Your friend is not online."}, status=400)

    # --- WebSocket Notification for Game Invite ---
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{friend.id}", # Send invite to the friend's group
        {
            "type": "game.invite",
            "sender": {
                "id": sender.id,
                "username": sender.username
            }
            # You can add more game-related data here
        }
    )
    # --- End WebSocket Notification ---

    return Response({"detail": "Game invite sent successfully."})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return Response([])

    friendships = Friendship.objects.filter(user1=request.user) | \
                  Friendship.objects.filter(user2=request.user)
    friend_ids = [f.user2.id if f.user1 == request.user else f.user1.id for f in friendships]

    users = User.objects.filter(username__icontains=query).exclude(id__in=friend_ids + [request.user.id])
    results = [{"id": u.id, "username": u.username} for u in users]
    return Response(results)


# ----------------------------
# Send Friend Request
# ----------------------------
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_friend_request(request, user_id):
    friend = get_object_or_404(User, id=user_id)

    fr, created = FriendRequest.objects.get_or_create(
        user1=request.user,
        user2=friend,
        defaults={"status": "pending"}
    )
    if not created:
        return Response({"detail": "Friend request already sent"}, status=400)

    return Response({"id": fr.id, "status": fr.status})


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_friend_request(request, user_id):
    recipient = get_object_or_404(User, id=user_id)
    sender = request.user

    # Prevent sending request to self or existing friends
    if sender == recipient:
        return Response({"detail": "You cannot send a friend request to yourself."}, status=400)

    if Friendship.objects.filter(Q(user1=sender, user2=recipient) | Q(user1=recipient, user2=sender)).exists():
        return Response({"detail": "You are already friends."}, status=400)

    fr, created = FriendRequest.objects.get_or_create(
        user1=sender, user2=recipient
    )
    if not created:
        return Response({"detail": "Friend request already sent."}, status=400)

    # --- WebSocket Notification ---
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{recipient.id}",  # Send to the recipient's group
        {
            "type": "friend.request.new",
            "request_id": fr.id,
            "sender": {
                "id": sender.id,
                "username": sender.username,
            }
        }
    )
    return Response({"detail": "Friend request sent.", "id": fr.id, "status": fr.status})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_friend_request(request, pk, action):
    try:
        friend_request = FriendRequest.objects.get(id=pk, user2=request.user)
    except FriendRequest.DoesNotExist:
        return Response({"detail": "Friend request not found."}, status=404)

    sender = friend_request.user1
    recipient = request.user

    if action == "accept":
        friend_request.status = "accepted"
        friend_request.save()
        Friendship.objects.create(user1=sender, user2=recipient)

        # --- WebSocket Notification ---
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{sender.id}", # Notify the original sender
            {
                "type": "friend.request.accepted",
                "recipient": {
                    "id": recipient.id,
                    "username": recipient.username
                }
            }
        )
        friend_request.delete()

        return Response({"detail": "Friend request accepted."})

    elif action == "reject":
        friend_request.delete() # Or set status to 'rejected'
        return Response({"detail": "Friend request rejected."})

    return Response({"detail": "Invalid action."}, status=400)

User = get_user_model()

