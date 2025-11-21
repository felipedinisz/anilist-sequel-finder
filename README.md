# 🎬 AniList Sequel Finder

A Python tool to automatically find missing anime sequels from your AniList account (COMPLETED + PLANNING lists) and optionally add them to your planning list.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![AniList API](https://img.shields.io/badge/AniList-GraphQL-02A9FF.svg)

## ✨ Features

- 🔍 **Smart Sequel Detection**: Analyzes your anime list to find missing sequels
- 📊 **Time Estimation**: Calculates total watch time for your PLANNING list
- 💾 **Intelligent Caching**: Reduces API calls by caching anime data locally
- ⚡ **Rate Limit Handling**: Automatically manages AniList API rate limits
- 📄 **CSV Export**: Exports results to a structured CSV file
- 🚀 **Auto-Push**: Optionally add found sequels directly to your AniList PLANNING list
- 🎛️ **Customizable Delays**: Adjust API call delays to avoid rate limiting

## 📋 Requirements

- Python 3.8 or higher
- AniList account
- AniList API token (for auto-push feature)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/felipedinisz/Estat-stica-e-IA-com-Python.git
cd anilist_api
```

2. **Create a virtual environment**
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install requests
```

## 🔑 Getting Your AniList Token (Optional - for auto-push)

1. Go to [AniList Settings](https://anilist.co/settings/developer)
2. Click "Create New Client"
3. Fill in the form:
   - **Name**: AniList Sequel Finder
   - **Redirect URL**: https://anilist.co/api/v2/oauth/pin
4. After creating, click on your app and copy the **Client ID**
5. Visit this URL (replace CLIENT_ID):
   ```
   https://anilist.co/api/v2/oauth/authorize?client_id=CLIENT_ID&response_type=token
   ```
6. Authorize the app and copy the token from the URL

⚠️ **Never share your token publicly!**

## 💻 Usage

### Basic Usage (CSV Export Only)

```bash
python findanime.py --user YOUR_USERNAME --csv output.csv
```

### With Custom Delays (Avoid Rate Limiting)

```bash
python findanime.py --user YOUR_USERNAME --csv output.csv --delay 2.0
```

### With Auto-Push (Add Sequels to AniList)

```bash
python findanime.py --user YOUR_USERNAME --csv output.csv --autopush --token YOUR_TOKEN
```

### Clear Cache and Run Fresh

```bash
python findanime.py --user YOUR_USERNAME --csv output.csv --clear-cache
```

## 🎯 Command Line Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `--user` | ✅ | Your AniList username |
| `--csv` | ✅ | Output CSV file path |
| `--autopush` | ❌ | Add found sequels to your PLANNING list |
| `--token` | ❌* | AniList API token (*required with --autopush) |
| `--delay` | ❌ | Custom delay between API calls in seconds (default: 1.0) |
| `--clear-cache` | ❌ | Clear the media cache before running |

## 📊 Output

### CSV Format

The generated CSV file contains the following columns:

- **Base Anime**: The anime you've watched/planned
- **Base Anime ID**: AniList ID of the base anime
- **Base Status**: Your current status (COMPLETED/PLANNING)
- **Missing Sequel**: Title of the missing sequel
- **Sequel ID**: AniList ID of the sequel
- **Format**: Anime format (TV, MOVIE, OVA, etc.)

### Console Output

```
🔎 Fetching COMPLETED anime for oDiniz...
  -> Found 240 anime in COMPLETED.
🔎 Fetching PLANNING anime for oDiniz...
  -> Found 732 anime in PLANNING.
🕒 Total time to watch everything in PLANNING: 4009.9 hours (~167.1 days)

🧠 Analyzing 972 anime from 444 entry points...
    -> Loading ID:87418 from cache...
    -> Fetching data for ID:123456 (sequel of sequel)...

💾 Cache stats: 8 hits, 1 misses

📄 Exporting 9 missing sequels to output.csv...
✅ CSV generated successfully!
```

## ⚙️ How It Works

1. **Fetch Lists**: Retrieves your COMPLETED and PLANNING anime lists from AniList
2. **Graph Traversal**: Uses an efficient graph traversal algorithm to find sequel chains
3. **Cache Management**: Stores fetched anime data locally to minimize API calls
4. **Rate Limit Handling**: Implements exponential backoff and respects API limits
5. **Export**: Generates a CSV with all missing sequels
6. **Auto-Push** (optional): Adds found sequels to your PLANNING list via API

## 💾 Cache System

- Cache is stored in `.cache/anilist_media_cache.json`
- Persists between runs to minimize API calls
- Shows cache statistics (hits vs misses)
- Can be cleared with `--clear-cache` flag

**Cache Benefits:**
- ✅ Faster subsequent runs
- ✅ Fewer API requests
- ✅ Less likely to hit rate limits
- ✅ Works offline for cached data

## 🔧 Configuration

### Default Delays

```python
BASE_DELAY = 1.0      # Pagination delay
FETCH_DELAY = 1.2     # Media details fetch delay  
MUTATION_DELAY = 0.8  # Auto-push delay
```

### Adjusting Delays

If you're still hitting rate limits:

```bash
# Increase delays to 2 seconds
python findanime.py --user YOUR_USERNAME --csv output.csv --delay 2.0

# Very conservative (3 seconds)
python findanime.py --user YOUR_USERNAME --csv output.csv --delay 3.0
```

## 🐛 Troubleshooting

### Rate Limit (429 Error)

**Problem**: Too many API requests in a short time

**Solutions**:
1. Increase delay: `--delay 2.0` or higher
2. The script automatically waits when rate limited
3. Use cache: Don't use `--clear-cache` unnecessarily

### No Sequels Found

**Possible Reasons**:
1. You're already up to date! 🎉
2. Your anime don't have sequels
3. Sequels are already in your PLANNING list

### Cache Issues

**Clear and rebuild**:
```bash
python findanime.py --user YOUR_USERNAME --csv output.csv --clear-cache
```

### Authentication Errors (with --autopush)

1. Verify your token is correct
2. Check token hasn't expired
3. Ensure proper scopes when generating token

## 🎨 Future Enhancements

### Planned Features (Dashboard Project)

- 🌐 **Web Dashboard**: Interactive web interface with FastAPI
- 📊 **Advanced Statistics**: Charts, graphs, and insights
- 🔔 **Notifications**: Get notified of new sequels
- 👥 **Multi-User Support**: Compare with friends
- 🎯 **Recommendations**: Smart anime suggestions
- 📱 **Mobile App**: React Native or Flutter app
- 🔄 **Automatic Sync**: Scheduled list updates
- 🎨 **Custom Themes**: Dark mode, custom colors

### Roadmap

1. **Phase 1**: Refactor code into modular API
2. **Phase 2**: FastAPI backend with database
3. **Phase 3**: Modern frontend (HTML/Tailwind/HTMX)
4. **Phase 4**: Advanced features and deployment

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

- [AniList](https://anilist.co/) for providing the excellent GraphQL API
- Python community for amazing libraries
- All anime fans using this tool!

## 📧 Contact

Felipe Diniz - [@felipedinisz](https://github.com/felipedinisz)

Project Link: [https://github.com/felipedinisz/anilist-sequel-finder](https://github.com/felipedinisz/anilist-sequel-finder)

## ✅ Tests

Automated tests (pytest) ensure the API and core logic work correctly.

### Running Tests

```bash
cd backend
PYTHONPATH=. ../.venv/bin/pytest --cov=app
```

### Current Coverage
| Area          | Status |
|---------------|--------|
| Root endpoint | ✅ Pass |
| Health check  | ✅ Pass |
| Core logic    | ✅ Pass |
| Auth routes   | ✅ Pass |

---

## 🏗️ Backend API (New)

The project is evolving into a full-stack application. The backend is built with **FastAPI**.

### Running the Backend

```bash
cd backend
../.venv/bin/uvicorn app.main:app --reload
```

### API Documentation
Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

⭐ If you found this project useful, please consider giving it a star!

**Made with ❤️ by anime fans, for anime fans**
