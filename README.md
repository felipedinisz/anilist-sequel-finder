# 🎬 AniList Sequel Finder

A modern, full-stack web application to automatically find missing anime sequels, movies, and OVAs from your AniList account. Never miss a season again!

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🔍 **Smart Detection**: Analyzes your `Completed` and `Watching` lists to find missing sequels.
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS.
- ⚡ **Real-time Updates**: Instant feedback with optimistic UI updates.
- 🎭 **Smooth Animations**: Powered by Framer Motion for a polished feel.
- 📊 **Advanced Filtering**: Filter by format (TV, Movie, OVA), score, and more.
- 🔄 **Auto-Sync**: Automatically adds found sequels to your AniList `Planning` list.
- 💾 **Smart Caching**: Backend caching to minimize API rate limits and improve speed.
- 📱 **Responsive**: Works great on desktop and mobile.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.10+
- **Caching**: Custom Pickle-based caching (Redis ready)
- **API**: AniList GraphQL API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- AniList Account

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
./start_dev.sh
```
The backend will start at `http://localhost:8000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`.

## � Deployment (Docker)

The project is configured to be deployed as a single container (Frontend served by Backend).

### 1. Build and Run with Docker

```bash
docker build -t anilist-sequel-finder .
docker run -p 8000:8000 -e ANILIST_CLIENT_ID=your_id -e FRONTEND_URL=http://localhost:8000 anilist-sequel-finder
```

### 2. Environment Variables

When deploying (e.g., on Render, Railway, Fly.io), set these variables:

- `ANILIST_CLIENT_ID`: Your AniList Client ID (Required)
- `FRONTEND_URL`: The URL where your app is hosted (e.g., `https://myapp.onrender.com`)
- `SECRET_KEY`: A random secret string for security
- `JWT_SECRET_KEY`: A random secret string for JWT tokens

## �📖 Usage

1. Open the frontend in your browser.
2. Click **"Login with AniList"** to authenticate (optional, but required for adding animes).
3. Enter your **AniList Username** and click Search.
4. Browse the missing sequels found.
5. Use filters to hide OVAs, Movies, or low-rated shows.
6. Click **"Add to List"** on any anime to add it to your Planning list instantly.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [AniList API](https://github.com/AniList/ApiV2-GraphQL-Docs)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Lucide Icons](https://lucide.dev/)

---

**Made with ❤️ by anime fans, for anime fans**
