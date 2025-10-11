from pathlib import Path
from datetime import timedelta
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security Settings ---
SECRET_KEY = os.environ.get('SECRET_KEY', 'a-default-secret-key-for-local-dev')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Add your Netlify app to the allowed hosts
ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1',
    '.app.github.dev', # Allows all your codespace URLs
    'toetac.netlify.app' # Your frontend domain
]


# --- Application Definitions ---
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    "api",
    "rest_framework",
    "corsheaders",
    "channels",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Make sure this is high up
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- CORRECTED CORS SETTINGS ---
# Instead of allowing all origins, specify the ones you trust.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",          # Your local React dev server
    "https://toetac.netlify.app",     # Your deployed frontend
]
CORS_ALLOW_CREDENTIALS = True

# The rest of your settings file is correct
ROOT_URLCONF = 'Backend.urls'
ASGI_APPLICATION = "Backend.asgi.application"
DATABASES = {'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))}
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [os.environ.get('REDIS_URL', 'redis://localhost:6379')]},
    },
}
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}