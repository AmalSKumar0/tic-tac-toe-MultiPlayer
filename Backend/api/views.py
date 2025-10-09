from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import UserSerializer , FriendRequestSerializer
from .models import Friendship, FriendRequest, Presence

User = get_user_model()


# ----------------------------
# User Registration
# ----------------------------
class UserCreate(generics.CreateAPIView):
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


# ----------------------------
# Send Game Request
# ----------------------------
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def send_game_request(request, friend_id):
    friend = get_object_or_404(User, id=friend_id)

    presence = Presence.objects.filter(user=friend).first()
    if not presence or presence.status != "online":
        return Response({"detail": "Friend is not online"}, status=400)

    friend_request, created = FriendRequest.objects.get_or_create(
        user1=request.user,
        user2=friend,
        defaults={"status": "pending"}
    )
    if not created:
        return Response({"detail": "Game request already sent"}, status=400)

    return Response({"id": friend_request.id, "status": friend_request.status})


# ----------------------------
# Search Users (excluding existing friends + self)
# ----------------------------
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_requests(request):
    requests = FriendRequest.objects.filter(user2=request.user, status='pending')
    serializer = FriendRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_friend_request(request, pk, action):
    try:
        friend_request = FriendRequest.objects.get(id=pk, user2=request.user)
    except FriendRequest.DoesNotExist:
        return Response({"detail": "Friend request not found."}, status=404)

    if action == "accept":
        friend_request.status = "accepted"
        friend_request.save()
        Friendship.objects.create(
            user1=friend_request.user1, user2=friend_request.user2
        )
        return Response({"detail": "Friend request accepted."})

    elif action == "reject":
        friend_request.status = "rejected"
        friend_request.save()
        return Response({"detail": "Friend request rejected."})

    return Response({"detail": "Invalid action."}, status=400)
