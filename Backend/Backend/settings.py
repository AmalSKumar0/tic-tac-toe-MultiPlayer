from pathlib import Path
from datetime import timedelta
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security Settings for Development ---
# WARNING: keep the secret key used in production secret!
# This simple key is fine for your local machine.
SECRET_KEY = 'django-insecure-local-development-key'

# WARNING: don't run with debug turned on in production!
DEBUG = True

# The dev server automatically handles hosts when DEBUG is True.
ALLOWED_HOSTS = []


# --- Application Definitions ---
INSTALLED_APPS = [
    'daphne',
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your Apps
    'api',

    # Third-Party Apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]


# --- Middleware ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Handles Cross-Origin Resource Sharing
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- CORS Settings for Local Development ---
# Allow your local React/Vue/etc. app to connect.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Standard Vite/React port
    "http://localhost:3000", # Standard Create React App port
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True


ROOT_URLCONF = 'Backend.urls'

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

# Use ASGI to support Channels (WebSockets)
ASGI_APPLICATION = "Backend.asgi.application"


# --- Database (Simplified for Local Dev) ---
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
# This uses a simple file-based database. No external server needed.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# --- Channels (Simplified for Local Dev) ---
# This uses an in-memory layer. No Redis server is needed to run locally!
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    },
}


# --- Static files (CSS, JavaScript, Images) ---
# https://docs.djangoproject.com/en/5.0/howto/static-files/
# The development server handles static files automatically with these settings.
STATIC_URL = 'static/'


# --- Django Rest Framework and JWT Settings ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}


# --- Default primary key field type ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'