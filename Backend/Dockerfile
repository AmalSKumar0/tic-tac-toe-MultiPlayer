# Dockerfile

# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables to prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application's code into the container
COPY . /app/

# Run collectstatic to gather all static files
RUN python manage.py collectstatic --noinput

# Tell Docker that the container listens on port 8000
EXPOSE 8000

# The command to run your application using Daphne
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "Backend.asgi:application"]