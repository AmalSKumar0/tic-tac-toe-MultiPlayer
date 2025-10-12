import os
import django
from django.core.asgi import get_asgi_application

# This line must come FIRST, before any other Django imports.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# This call is necessary to initialize Django's settings and app registry.
django.setup()

# Now that Django is configured, you can safely import your other modules.
from channels.routing import ProtocolTypeRouter, URLRouter
from api.middleware import JWTAuthMiddleware
import api.routing 

# Your application definition
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            api.routing.websocket_urlpatterns 
        )
    ),
})