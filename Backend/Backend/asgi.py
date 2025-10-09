import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from api.middleware import JWTAuthMiddleware
import api.routing 

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project_name.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            api.routing.websocket_urlpatterns 
        )
    ),
})