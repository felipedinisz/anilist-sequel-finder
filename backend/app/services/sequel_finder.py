"""
Service to find missing sequels using AniListClient
"""

import asyncio
import httpx
from typing import List, Dict, Any, Optional

from app.services.anilist_client import AniListClient


async def find_missing_sequels(
    username: str, access_token: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Find missing sequels for a given username.

    Logic:
    - Fetch COMPLETED, WATCHING and PLANNING lists
    - For each media, inspect relations for SEQUEL
    - If sequel is not present in any list, consider missing
    - Recursively search for sequels of missing sequels (Deep Search)
    """
    client = AniListClient(access_token)

    # helper to fetch all pages for a given status
    # Semaphore to limit concurrent requests to avoid hitting rate limits too hard
    sem = asyncio.Semaphore(2)

    async def fetch_all(status: str):
        async with sem:
            page = 1
            items = []
            while True:
                try:
                    resp = await client.get_user_anime_list(username, status, page=page)
                    data = resp.get("data") or resp
                    page_data = data.get("Page")
                    if not page_data:
                        break
                    media_list = page_data.get("mediaList", [])
                    for entry in media_list:
                        media = entry.get("media")
                        score = entry.get("score")
                        if media:
                            media["user_score"] = score
                            items.append(media)
                    page_info = page_data.get("pageInfo", {})
                    has_next = page_info.get("hasNextPage")
                    print(f"[{status}] Page {page}: {len(media_list)} items. Next: {has_next}")
                    
                    if not has_next:
                        break
                    page += 1
                    # Rate limit is now handled by AniListClient with exponential backoff
                except httpx.HTTPStatusError as e:
                    # Check if it's a 404 error (User not found)
                    if e.response.status_code == 404:
                        raise ValueError(f"User '{username}' not found on AniList")
                    
                    # If AniList returns 500, it might be a temporary issue or invalid user
                    if e.response.status_code == 500:
                         # Try to parse error message if available
                        try:
                            error_data = e.response.json()
                            errors = error_data.get("errors", [])
                            if errors and "User not found" in str(errors):
                                raise ValueError(f"User '{username}' not found on AniList")
                        except:
                            pass
                        # If we can't determine it's a user error, re-raise but with a cleaner message
                        raise ValueError(f"AniList API Error (500). The user '{username}' might not exist or the service is down.")

                    print(f"Error fetching page {page} for {status}: {e}")
                    raise e
                except Exception as e:
                    print(f"Error fetching page {page} for {status}: {e}")
                    raise e
            return items

    # 1. Fetch User Profile first to validate user exists and get stats
    print(f"Fetching profile for {username}...")
    try:
        user_profile = await client.get_public_user_profile(username)
    except Exception as e:
        # If getting profile fails, it's likely the user doesn't exist
        if "404" in str(e) or "User not found" in str(e):
             raise ValueError(f"User '{username}' not found on AniList")
        raise e

    print("Fetching user lists...")
    completed, planning, watching, paused, dropped = await asyncio.gather(
        fetch_all("COMPLETED"),
        fetch_all("PLANNING"),
        fetch_all("CURRENT"),
        fetch_all("PAUSED"),
        fetch_all("DROPPED"),
    )

    # Sets for O(1) lookup
    completed_ids = {m.get("id") for m in completed}
    planning_ids = {m.get("id") for m in planning}
    watching_ids = {m.get("id") for m in watching}
    paused_ids = {m.get("id") for m in paused}
    dropped_ids = {m.get("id") for m in dropped}

    print(
        f"Stats: {len(completed)} Completed, {len(watching)} Watching, "
        f"{len(planning)} Planning, {len(paused)} Paused, {len(dropped)} Dropped"
    )

    # Track what we've seen to avoid cycles and duplicates
    known_ids = (
        completed_ids.union(planning_ids)
        .union(watching_ids)
        .union(paused_ids)
        .union(dropped_ids)
    )

    missing_sequels = []
    queue = []  # Queue of (id, depth, origin_score) tuples for Deep Search

    # Combine lists to check for sequels (Completed + Watching + Planning)
    # Now checking ALL lists to ensure full franchise continuity
    source_list = completed + watching + planning

    # Define valid anime formats to avoid suggesting Manga/Novels
    # (Since we only fetch the user's ANIME list, suggesting Manga would cause false positives)
    ANIME_FORMATS = {
        "TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"
    }

    # 1. Check immediate sequels of Source anime
    for media in source_list:
        relations = media.get("relations", {}).get("edges", [])
        user_score = media.get("user_score")
        
        for edge in relations:
            if edge.get("relationType") == "SEQUEL":
                node = edge.get("node")
                if not node:
                    continue

                # Filter out non-anime formats (Manga, Novel, etc.)
                if node.get("format") not in ANIME_FORMATS:
                    continue

                nid = node.get("id")

                if nid not in known_ids:
                    # Found a missing sequel
                    missing_item = {
                        "base_id": media.get("id"),
                        "base_title": media.get("title", {}).get("romaji"),
                        "base_score": user_score,
                        "missing_id": nid,
                        "missing_title": node.get("title", {}).get("romaji"),
                        "missing_cover": node.get("coverImage", {}).get("large"),
                        "format": node.get("format"),
                        "depth": 1,
                    }
                    missing_sequels.append(missing_item)
                    known_ids.add(nid)
                    queue.append((nid, 2, user_score))  # Next depth will be 2

    # 2. Deep search: Check sequels of the missing sequels
    # Optimized: Process queue in batches to reduce API calls
    while queue:
        # Take a batch of up to 50 items from the queue
        batch_size = 50
        batch = []
        while queue and len(batch) < batch_size:
            batch.append(queue.pop(0))
        
        if not batch:
            break
            
        batch_ids = [item[0] for item in batch]
        # Map ID to its depth and score for processing results
        id_meta_map = {item[0]: {"depth": item[1], "score": item[2]} for item in batch}
        
        try:
            # Fetch details for all IDs in the batch at once
            media_details_list = await client.get_media_details_batch(batch_ids)
            
            for media_details in media_details_list:
                current_id = media_details.get("id")
                meta = id_meta_map.get(current_id)
                
                if not current_id or not meta:
                    continue
                
                current_depth = meta["depth"]
                origin_score = meta["score"]
                
                relations = media_details.get("relations", {}).get("edges", [])

                for edge in relations:
                    if edge.get("relationType") == "SEQUEL":
                        node = edge.get("node")
                        if not node:
                            continue

                        # Filter out non-anime formats
                        if node.get("format") not in ANIME_FORMATS:
                            continue

                        nid = node.get("id")

                        if nid not in known_ids:
                            # Found a sequel to a missing sequel
                            missing_item = {
                                "base_id": current_id,
                                "base_title": media_details.get("title", {}).get("romaji"),
                                "base_score": origin_score,
                                "missing_id": nid,
                                "missing_title": node.get("title", {}).get("romaji"),
                                "missing_cover": node.get("coverImage", {}).get("large"),
                                "format": node.get("format"),
                                "depth": current_depth,
                            }
                            missing_sequels.append(missing_item)
                            known_ids.add(nid)
                            queue.append((nid, current_depth + 1, origin_score))

        except Exception as e:
            # In production, use a proper logger
            print(f"Error fetching batch details: {e}")
            continue

    return {
        "user": user_profile,
        "missing_sequels": missing_sequels
    }
