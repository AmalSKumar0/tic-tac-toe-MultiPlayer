from pathlib import Path
from datetime import timedelta
import os
import dj_database_url
from dotenv import load_dotenv

# --- Core Settings ---
# Load environment variables from .env file (for local development)
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- Security Settings ---
# Get secrets from environment variables. Provide a default for local development.
SECRET_KEY = os.environ.get('SECRET_KEY', 'exhhu8r4cw7a(&!%a-_*w@i1!!324!pu#^^k%!1*5wlxnd=t(c')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# Allowed hosts for production. Codespaces automatically provides its URL.
ALLOWED_HOSTS = [os.environ.get('CODESPACE_NAME', 'localhost'), '127.0.0.1']
if 'CODESPACE_NAME' in os.environ:
    ALLOWED_HOSTS.append(f"{os.environ['CODESPACE_NAME']}-8000.app.github.dev")

# --- Application Definitions ---
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic', # For serving static files
    'django.contrib.staticfiles',
    "api",
    "rest_framework",
    "corsheaders",
    "channels",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # WhiteNoise for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Backend.urls'
ASGI_APPLICATION = "Backend.asgi.application"
WSGI_APPLICATION = 'Backend.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# --- Database & Caching ---
DATABASES = {'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))}
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [os.environ.get('REDIS_URL', 'redis://localhost:6379')]},
    },
}

# --- Third-Party App Settings ---
CORS_ALLOW_ALL_ORIGINS = True # Be more restrictive in true production
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
}

# --- Static Files (CSS, JavaScript, Images) ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Password Validation ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- Internationalization ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- Default field type ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

