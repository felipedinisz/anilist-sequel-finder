# Backend - AniList Sequel Finder

FastAPI backend for the AniList Sequel Finder dashboard.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your AniList OAuth credentials
# Get them from: https://anilist.co/settings/developer
```

### 2. Install Dependencies

Dependencies are already installed in the parent virtual environment.

### 3. Initialize Database

```bash
python init_db.py
```

### 4. Start Development Server

```bash
./start_dev.sh
```

Or manually:
```bash
export PYTHONPATH=$(pwd)
../../../.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: **http://localhost:8000**

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   │   └── auth.py      # Authentication routes
│   ├── core/            # Core configuration
│   │   ├── config.py    # Settings
│   │   └── security.py  # JWT & password hashing
│   ├── db/              # Database
│   │   └── session.py   # Async session
│   ├── models/          # SQLAlchemy models
│   │   └── user.py      # User model
│   ├── schemas/         # Pydantic schemas
│   │   └── user.py      # User schemas
│   ├── services/        # Business logic
│   │   └── anilist_client.py  # AniList API client
│   └── main.py          # FastAPI app
├── init_db.py           # Database initialization
├── start_dev.sh         # Development server script
└── requirements.txt     # Python dependencies
```

## 🔐 Authentication Flow

1. User clicks "Login with AniList"
2. Redirected to AniList OAuth page
3. User authorizes the app
4. Callback receives authorization code
5. Exchange code for access token
6. Fetch user info from AniList
7. Create/update user in database
8. Generate JWT token
9. Return user data + JWT token

## 🗄️ Database

- **Development**: SQLite (`app.db`)
- **Production**: PostgreSQL (configure in `.env`)

### Models

- **User**: Stores AniList user data and access tokens

## 📡 Available Endpoints

### Authentication

- `GET /api/v1/auth/login` - Initiate OAuth login
- `GET /api/v1/auth/callback` - OAuth callback handler  
- `POST /api/v1/auth/logout` - Logout user

### Health

- `GET /` - Root endpoint
- `GET /health` - Health check

## 🔧 Environment Variables

Required variables in `.env`:

```env
# App
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# AniList OAuth
ANILIST_CLIENT_ID=your_client_id
ANILIST_CLIENT_SECRET=your_client_secret
ANILIST_REDIRECT_URI=http://localhost:8000/api/v1/auth/callback

# Database
DATABASE_URL=sqlite+aiosqlite:///./app.db
```

## 🛠️ Development

### Add New Endpoint

1. Create router in `app/api/v1/`
2. Add router to `app/main.py`
3. Define schemas in `app/schemas/`
4. Implement logic in `app/services/`

### Database Changes

1. Modify models in `app/models/`
2. Run `python init_db.py` to recreate tables
3. (Future: Use Alembic migrations)

## 🧪 Testing

```bash
# Run tests (when implemented)
pytest
```

## 📝 Next Steps

- [ ] Add sequel finding endpoints
- [ ] Implement statistics endpoints
- [ ] Add anime list management
- [ ] Create caching layer
- [ ] Add rate limiting
- [ ] Implement Alembic migrations
- [ ] Add comprehensive tests
- [ ] Add logging
- [ ] Add error handling middleware

## 🤝 Contributing

See main README.md for contribution guidelines.
