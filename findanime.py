#!/usr/bin/env python3
"""
findanime.py — Find missing sequels on AniList (COMPLETED + PLANNING)
Exports CSV and optionally adds the sequels as PLANNING to your account.

Usage:
    python findanime.py --user yourUSER --csv sequels.csv
    python findanime.py --user yourUSER --csv sequels.csv --autopush --token YOUR_TOKEN
"""

import argparse
import csv
import time
import requests
import sys
import json
import os
from collections import deque
from requests.exceptions import RequestException
from pathlib import Path

API_URL = "https://graphql.anilist.co"
PER_PAGE = 50
CACHE_DIR = Path(".cache")
CACHE_FILE = CACHE_DIR / "anilist_media_cache.json"

# Rate limiting configuration (can be modified via command line)
class Config:
    BASE_DELAY = 1.0  # Increased from 0.35 to 1.0 seconds
    FETCH_DELAY = 1.2  # Increased from 0.70 to 1.2 seconds
    MUTATION_DELAY = 0.8  # Increased from 0.6 to 0.8 seconds

# -------------------------
# Queries / Mutations
# -------------------------

LIST_QUERY = """
query ($username: String, $status: MediaListStatus, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage hasNextPage }
    mediaList(userName: $username, type: ANIME, status: $status) {
      media {
        id
        title { romaji }
        episodes
        duration
        relations {
          edges {
            relationType
            node { id title { romaji } format }
          }
        }
      }
    }
  }
}
"""

# --- UPDATED MEDIA_DETAILS_QUERY ---
MEDIA_DETAILS_QUERY = """
query ($id: Int) {
  Media(id: $id) {
    id
    title { romaji }
    format
    episodes
    duration
    relations { 
      edges { 
        relationType 
        node { id title { romaji } format episodes duration }
      } 
    }
  }
}
"""

MUTATION_ADD = """
mutation ($mediaId: Int!, $status: MediaListStatus!) {
  SaveMediaListEntry(mediaId: $mediaId, status: $status) {
    id
    status
    media { id title { romaji } }
  }
}
"""

# -------------------------
# Cache management
# -------------------------
def load_cache():
    """Load media cache from disk."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Could not load cache: {e}")
    return {}

def save_cache(cache):
    """Save media cache to disk."""
    try:
        CACHE_DIR.mkdir(exist_ok=True)
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"⚠️ Could not save cache: {e}")

# -------------------------
# HTTP helper 
# -------------------------
def call_anilist(query, variables=None, token=None, max_retries=6):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    attempt = 0
    while True:
        try:
            resp = requests.post(API_URL, json={"query": query, "variables": variables}, headers=headers, timeout=30)

            if resp.status_code == 200:
                return resp.json()

            if resp.status_code == 429:
                retry_after = resp.headers.get("Retry-After")
                wait = int(retry_after) if retry_after and retry_after.isdigit() else min(30, 2 ** (attempt + 1))
                print(f"⚠️ AniList rate limit (429). Waiting {wait}s...")
                time.sleep(wait)
                attempt += 1
                continue

            try:
                return resp.json()
            except Exception:
                resp.raise_for_status()

        except RequestException as e:
            attempt += 1
            if attempt > max_retries:
                raise Exception(f"Failed to communicate with AniList after {max_retries} attempts: {e}") from e
            wait = min(60, 2 ** attempt)
            print(f"⚠️ Network error ({e}). Retrying in {wait}s...")
            time.sleep(wait)

# -------------------------
# Fetch functions
# -------------------------
def fetch_list(username, status, verbose=True):
    """Fetch all anime from a specific list (e.g., COMPLETED) with pagination."""
    if verbose:
        print(f"🔎 Fetching {status} anime for {username}...")
    entries = []
    current_page = 1
    while True:
        variables = {
            "username": username,
            "status": status,
            "page": current_page,
            "perPage": PER_PAGE,
        }
        data = call_anilist(LIST_QUERY, variables)
        if not data or "data" not in data:
            raise RuntimeError(f"Unexpected API response: {data}")

        page_data = data["data"]["Page"]
        chunk = page_data.get("mediaList") or []
        entries.extend(chunk)

        if not page_data["pageInfo"]["hasNextPage"]:
            break
        current_page += 1
        time.sleep(Config.BASE_DELAY)  # Use configurable delay
    if verbose:
        print(f"  -> Found {len(entries)} anime in {status}.")
    return entries

def fetch_media_details(media_id, cache=None):
    """Fetch details for a specific media with caching."""
    # Check cache first
    if cache and str(media_id) in cache:
        return cache[str(media_id)]
    
    try:
        data = call_anilist(MEDIA_DETAILS_QUERY, {"id": media_id})
        if not data or "data" not in data or not data["data"].get("Media"):
            return None
        
        media = data["data"]["Media"]
        
        # Save to cache
        if cache is not None:
            cache[str(media_id)] = media
        
        return media
    except Exception as e:
        print(f"  ⚠️ Could not fetch data for {media_id}: {e}")
        return None

# -------------------------
# Core: find sequels
# -------------------------
def find_missing_sequels(entries_completed, entries_planning, verbose=True):
    """Find missing sequels using a more efficient graph traversal approach."""
    # Load cache
    cache = load_cache()
    cache_hits = 0
    cache_misses = 0
    
    completed_ids = {entry["media"]["id"] for entry in entries_completed}
    planning_ids = {entry["media"]["id"] for entry in entries_planning}
    user_list_ids = completed_ids.union(planning_ids)

    media_map = {e["media"]["id"]: e["media"] for e in (entries_completed + entries_planning) if e.get("media")}

    sequel_ids_in_list = set()
    for media_id in user_list_ids:
        media = media_map.get(media_id)
        if not media:
            continue
        for rel in media.get("relations", {}).get("edges", []):
            if rel.get("relationType") == "SEQUEL":
                node = rel.get("node")
                if node and node["id"] in user_list_ids:
                    sequel_ids_in_list.add(node["id"])

    # Start search from the "heads" of the chain (anime that are not sequels)
    initial_visit_ids = user_list_ids - sequel_ids_in_list
    to_visit = deque(initial_visit_ids)

    visited = set(initial_visit_ids)
    missing = []
    missing_sequel_ids = set()

    if verbose:
        print(f"\n🧠 Analyzing {len(user_list_ids)} anime from {len(to_visit)} entry points...")

    while to_visit:
        media_id = to_visit.popleft()

        media = media_map.get(media_id)

        base_status = "UNKNOWN"
        if media_id in completed_ids:
            base_status = "COMPLETED"
        elif media_id in planning_ids:
            base_status = "PLANNING"

        if not media:
            # Check if in cache first
            if str(media_id) in cache:
                if verbose:
                    print(f"    -> Loading ID:{media_id} from cache...")
                media = cache[str(media_id)]
                cache_hits += 1
            else:
                if verbose:
                    print(f"    -> Fetching data for ID:{media_id} (sequel of sequel)...")
                media = fetch_media_details(media_id, cache)
                cache_misses += 1
                
                if not media:
                    if verbose:
                        print(f"    -> Failed to fetch {media_id}. Skipping this chain.")
                    continue
                
                # Only sleep after actual API call, not cache hit
                time.sleep(Config.FETCH_DELAY)
            
            media_map[media_id] = media

        base_title = media.get("title", {}).get("romaji", f"ID:{media_id}")

        for rel in media.get("relations", {}).get("edges", []):
            if rel.get("relationType") != "SEQUEL":
                continue

            node = rel.get("node")
            if not node: continue

            seq_id = node["id"]
            if seq_id in visited: continue

            visited.add(seq_id)
            to_visit.append(seq_id)

            if seq_id not in user_list_ids and seq_id not in missing_sequel_ids:
                missing.append({
                    "base_title": base_title,
                    "base_id": media_id,
                    "base_status": base_status,
                    "sequel_title": node["title"]["romaji"],
                    "sequel_id": seq_id,
                    "format": node.get("format"),
                })
                missing_sequel_ids.add(seq_id)
    
    # Save cache
    save_cache(cache)
    
    if verbose and (cache_hits > 0 or cache_misses > 0):
        print(f"\n💾 Cache stats: {cache_hits} hits, {cache_misses} misses")
    
    return missing

# -------------------------
# CSV Export
# -------------------------

def export_csv(results, csv_path):
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow([
            "Base Anime",
            "Base Anime ID",
            "Base Status",
            "Missing Sequel", 
            "Sequel ID",
            "Format"
        ])

        for r in results:
            writer.writerow([
                r["base_title"],
                r["base_id"],
                r["base_status"],
                r["sequel_title"], 
                r["sequel_id"],
                r["format"]
            ])

    print(f"📄 CSV exported with {len(results)} sequels to {csv_path}")


# -------------------------
# Push to AniList (SaveMediaListEntry)
# -------------------------
def add_to_planning(results, token, status="PLANNING"):
    if not token:
        raise ValueError("Token is required for add_to_planning")

    pushed = []
    errors = []

    print("\n🟦 Adding sequels to AniList (PLANNING)...")

    for r in results:
        media_id = r.get("sequel_id")

        variables = {"mediaId": media_id, "status": status}

        try:
            data = call_anilist(MUTATION_ADD, variables, token=token)

            if data.get("errors"):
                errors.append((media_id, data["errors"]))
                print(f"  ❌ Error adding {r['sequel_title']} ({media_id}): {data['errors']}")
                continue

            saved = data.get("data", {}).get("SaveMediaListEntry")
            if saved:
                pushed.append(media_id)
                title = saved["media"]["title"]["romaji"]
                print(f"  ✅ Added: {title} (id={media_id}) status={saved.get('status')}")
            else:
                errors.append((media_id, data))
                print(f"  ❌ Unexpected response ({media_id}): {data}")

        except Exception as e:
            errors.append((media_id, str(e)))
            print(f"  ❌ Network error adding {r['sequel_title']} ({media_id}): {e}")

        time.sleep(Config.MUTATION_DELAY)  # Use configurable delay

    print("\n📌 AUTOPUSH SUMMARY")
    print(f"  ✅ Added: {len(pushed)}")
    print(f"  ❌ Failed: {len(errors)}")

    return pushed, errors


# -------------------------
# Time estimative
# -------------------------
def estimate_total_time(entries):
    """ Sums the total time in hours of all pending anime. """
    total_minutes = 0

    for entry in entries:
        media = entry.get("media")
        if not media:
            continue

        episodes = media.get("episodes") or 0
        duration = media.get("duration") or 23

        total_minutes += episodes * duration

    total_hours = total_minutes / 60
    total_days = total_hours / 24
    return total_hours, total_days


# -------------------------
# CLI main
# -------------------------
def main():
    parser = argparse.ArgumentParser(description="Identifies missing sequels on AniList and exports to CSV / adds to AniList")
    parser.add_argument("--user", required=True, help="AniList username")
    parser.add_argument("--csv", required=True, help="Output CSV file")
    parser.add_argument("--autopush", action="store_true", help="Add found sequels to AniList (requires --token)")
    parser.add_argument("--token", help="AniList access token (Bearer). DO NOT share publicly.")
    parser.add_argument("--delay", type=float, help=f"Custom delay between API calls in seconds (default: {Config.BASE_DELAY})")
    parser.add_argument("--clear-cache", action="store_true", help="Clear the media cache before running")
    args = parser.parse_args()

    # Clear cache if requested
    if args.clear_cache and CACHE_FILE.exists():
        CACHE_FILE.unlink()
        print("🗑️ Cache cleared!")

    # Update delays if custom delay provided
    if args.delay:
        Config.BASE_DELAY = args.delay
        Config.FETCH_DELAY = args.delay * 1.2
        Config.MUTATION_DELAY = args.delay * 0.8
        print(f"⏱️ Using custom delays: base={Config.BASE_DELAY}s, fetch={Config.FETCH_DELAY}s, mutation={Config.MUTATION_DELAY}s")

    try:
        entries_completed = fetch_list(args.user, "COMPLETED")
        entries_planning = fetch_list(args.user, "PLANNING")

        hours, days = estimate_total_time(entries_planning)
        print(f"🕒 Total time to watch everything in PLANNING: {hours:.1f} hours (~{days:.1f} days)")

    except Exception as e:
        print(f"Error fetching anime: {e}")
        sys.exit(1)

    results = find_missing_sequels(entries_completed, entries_planning)

    if not results:
        print("\n✅ No missing sequels found. You are up to date!")
        return

    print(f"\n📄 Exporting {len(results)} missing sequels to {args.csv}...")
    export_csv(results, args.csv)
    print("✅ CSV generated successfully!")

    if args.autopush:
        if not args.token:
            print("❌ --autopush requires --token. Aborting push.")
            return
        pushed, errors = add_to_planning(results, args.token, status="PLANNING")
        print(f"\nSummary: sent={len(pushed)} failed={len(errors)}")
        if errors:
            print("Some operations failed — check the logs above.")

if __name__ == "__main__":
    main()