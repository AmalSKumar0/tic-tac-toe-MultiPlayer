from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv

# --- Load Environment Variables ---
# This line loads variables from a .env file in your project root.
# Make sure your .env file contains DATABASE_URL, SECRET_KEY, etc.
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# --- Security Settings ---
# SECRET_KEY should be a long, random string.
# It's loaded from an environment variable for security.
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-dev')

# DEBUG should always be False in production.
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Define the hosts that are allowed to connect to this server.
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.app.github.dev',         # Allows all your codespace URLs
    'toetac.netlify.app',      # Your deployed frontend
    # Add your production backend domain here when you deploy it
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

    # Your Apps
    "api",

    # Third-Party Apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Whitenoise middleware should be placed right after SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Handles Cross-Origin Resource Sharing
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Backend.urls'

# --- TEMPLATES CONFIGURATION (FIXED) ---
# This was the cause of your (admin.E403) error.
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Use ASGI for both development and production to support Channels
ASGI_APPLICATION = "Backend.asgi.application"

# --- DATABASE CONFIGURATION (FIXED) ---
# This now correctly reads the DATABASE_URL from your .env file.
# Neon and other cloud providers require SSL.
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 'postgresql://neondb_owner:npg_uI7oUbjMadN8@ep-fragrant-rain-aeez2ai5-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'),
        conn_max_age=600,
        ssl_require=True
    )
}

# --- CORS and CSRF Settings ---
# Specifies which frontend domains are allowed to make requests to your API.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",    # Your local React dev server
    "https://toetac.netlify.app", # Your deployed frontend
]
# Allows cookies to be sent in cross-origin requests.
CORS_ALLOW_CREDENTIALS = True

# Trusts your frontend domain for secure (POST, PUT, DELETE) requests.
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://toetac.netlify.app",
]

# --- Channels and Redis ---
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [os.environ.get('REDIS_URL', 'redis://localhost:6379')]
        },
    },
}

# --- Static Files (for Whitenoise) ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Django Rest Framework and JWT Settings ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication"
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated"
    ],
}

# --- Simple JWT Configuration (ADDED) ---
# Configures the behavior of your JSON Web Tokens.
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
}

# --- Default primary key field type ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
