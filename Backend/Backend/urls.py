from django.contrib import admin
from django.urls import path,include
from api.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/', UserCreate.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api-auth/", include("rest_framework.urls")),
    path('api/friends/', friends_list, name='friends-list'),
    path('api/game-request/<int:friend_id>/', send_game_request, name='send-game-request'),
    path('api/search-users/', search_users, name='search-users'),
    path('api/friend-requests/', friend_requests, name='friend-requests'),
    path('api/send-friend-request/<int:user_id>/', send_friend_request, name='send-friend-request'),
    path("api/friend-request/<int:pk>/<str:action>/", respond_friend_request, name="respond-friend-request"),
]
