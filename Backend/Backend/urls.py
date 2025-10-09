from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import the entire views module from your api app
from api import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/user/register/', views.UserCreate.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api-auth/", include("rest_framework.urls")),
    
    path('api/friends/', views.friends_list, name='friends-list'),
    path('api/search-users/', views.search_users, name='search-users'),
    path('api/friend-requests/', views.friend_requests, name='friend-requests'),
    path('api/send-friend-request/<int:user_id>/', views.send_friend_request, name='send-friend-request'),
    path("api/friend-request/<int:pk>/<str:action>/", views.respond_friend_request, name="respond-friend-request"),
    path('api/game-request/<int:friend_id>/', views.send_game_request, name='send-game-request'),
]