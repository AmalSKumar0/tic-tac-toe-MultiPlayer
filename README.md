# 🎮 Real-Time Tic-Tac-Toe with Chat

A **full-stack, real-time multiplayer Tic-Tac-Toe** application built with **Django** and **React**.  
This project features user authentication, a global chat lobby, real-time presence indicators, and private game rooms with their own dedicated chat.

The **backend** uses **Django Channels** for WebSocket communication, ensuring instantaneous gameplay and chat updates.  
The **frontend** is a modern, single-page React app with a smooth and responsive interface.

---

## 🚀 Key Features

| Feature | Description |
|----------|-------------|
| 🔐 **JWT Authentication** | Secure user sign-up and login system. |
| 🟢 **Real-Time Presence** | See which users are currently online in the lobby. |
| 💬 **Global Chat** | A public chat room for all connected users. |
| 📧 **Game Invitations** | Challenge any other online user to a game. |
| 🚪 **Private Game Rooms** | Each game runs in its own isolated WebSocket channel. |
| ⚡ **Real-Time Gameplay** | Moves appear instantly on both players’ screens. |
| ✍️ **In-Game Chat** | Private chat for each game with persistent message history. |
| 📈 **Scalable Backend** | Redis handles multiple connections and server processes efficiently. |

---

## 🧩 Technology Stack

This project uses a **modern, robust tech stack** designed for scalability and real-time performance.

### 🖥️ Backend

- 🐍 **Python 3.11+** – Core backend language, clean and versatile.  
- 🧱 **Django 5.x** – High-level Python web framework for clean design.  
- 🧰 **Django REST Framework** – Simplifies API development for authentication and user management.  
- 🔌 **Django Channels** – Enables WebSockets for real-time gameplay and chat.  
- ⚙️ **Daphne** – ASGI server powering asynchronous requests.  
- 💾 **Redis** – Acts as a channel layer and message broker.  
- 🗄️ **PostgreSQL** – Stores user data, chat history, and persistent records.

### 💻 Frontend

- ⚛️ **React 18** – Builds the interactive single-page app.  
- 🧭 **React Router** – Handles navigation between pages like lobby and game room.  
- 🌐 **WebSocket API** – Enables persistent, two-way communication.  
- 🔑 **jwt-decode** – Decodes JWTs client-side to identify the current user.  
- 🎨 **CSS** – Custom styling for the game board, chat, and layout.

### 📊 Stack Composition

| Stack | Count |
|--------|--------|
| Backend Technologies | 7 |
| Frontend Technologies | 5 |

---

## 🏗️ Application Architecture

The app follows a **decoupled architecture**:



### 🔍 Flow Explanation

- **React Client** → Handles UI, routing, and gameplay interactions.  
- **Django + Channels** → Manages authentication, API requests, and WebSocket connections.  
- **Redis** → Enables real-time event messaging between multiple processes.  
- **PostgreSQL** → Persists user and chat data.

---

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 🧰 Prerequisites

- Git  
- Python 3.11+  
- Node.js and npm (or yarn)  
- Redis Server  
- PostgreSQL *(optional, for production)*

---

### ⚙️ Project Setup Guide

Follow these steps to run both **backend (Django)** and **frontend (React)** parts of the project smoothly.

---
## ⚙️ Project Setup Guide

Easily set up and run both the **Django backend** 🐍 and **React frontend** ⚛️ for your Real-Time Tic-Tac-Toe project.

---

### 🐍 Backend Setup

💡 **Tip:** Ensure **Redis** (for real-time messaging) and **PostgreSQL** (optional for local development) are running before you start the backend server.

```bash
# 🌀 Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME/backend
```

```bash
# 🧱 Create and activate a virtual environment
python -m venv venv
```

```bash
# ▶️ Activate the environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

```bash
# ⚙️ Install dependencies
pip install -r requirements.txt
```

```bash
# 🔑 Configure environment variables
cp .env.example .env
```

👉 Edit the `.env` file and add your:
- `SECRET_KEY`
- Database credentials *(if using PostgreSQL)*

```bash
# 🗃️ Run database migrations
python manage.py migrate
```

```bash
# 🚀 Start the Django development server
python manage.py runserver
# 🌐 Server running at: http://127.0.0.1:8000
```

---

### ⚛️ Frontend Setup

Follow these steps to set up and run the **React frontend** of your Real-Time Tic-Tac-Toe project.

💡 **Note:** Make sure your **Django backend** is already running before starting the frontend for seamless API and WebSocket communication.

```bash
# 📂 Navigate to the frontend directory
cd frontend
```

```bash
# 📦 Install all required dependencies
npm install
```

```bash
# ⚙️ (Optional) Configure environment variables
# If your app uses an environment file for API URLs or WebSocket endpoints:
cp .env.example .env
```

👉 Then edit `.env` to include your backend API and WebSocket URLs.

```bash
# 🚀 Start the React development server
npm run dev
```

```bash
# 🌐 Your frontend is now running at:
# http://localhost:5173
```

---

✅ **Setup Complete!**  
Your **full-stack real-time Tic-Tac-Toe app** is now live — open both servers and start playing 🎮🔥


