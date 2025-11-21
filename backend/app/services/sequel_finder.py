"""
Service to find missing sequels using AniListClient
"""

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
    async def fetch_all(status: str):
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
                    if media:
                        items.append(media)
                page_info = page_data.get("pageInfo", {})
                if not page_info.get("hasNextPage"):
                    break
                page += 1
                # Rate limit is now handled by AniListClient with exponential backoff
            except Exception as e:
                print(f"Error fetching page {page} for {status}: {e}")
                raise e
        return items

    print("Fetching user lists...")
    completed = await fetch_all("COMPLETED")
    planning = await fetch_all("PLANNING")
    watching = await fetch_all("CURRENT")
    paused = await fetch_all("PAUSED")
    dropped = await fetch_all("DROPPED")

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
    queue = []  # Queue of (id, depth) tuples for Deep Search

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
                        "missing_id": nid,
                        "missing_title": node.get("title", {}).get("romaji"),
                        "format": node.get("format"),
                        "depth": 1,
                    }
                    missing_sequels.append(missing_item)
                    known_ids.add(nid)
                    queue.append((nid, 2))  # Next depth will be 2

    # 2. Deep search: Check sequels of the missing sequels
    while queue:
        current_id, current_depth = queue.pop(0)
        try:
            # Rate limit is handled by AniListClient

            media_details = await client.get_media_details(current_id)
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
                            "missing_id": nid,
                            "missing_title": node.get("title", {}).get("romaji"),
                            "format": node.get("format"),
                            "depth": current_depth,
                        }
                        missing_sequels.append(missing_item)
                        known_ids.add(nid)
                        queue.append((nid, current_depth + 1))

        except Exception as e:
            # In production, use a proper logger
            print(f"Error fetching details for {current_id}: {e}")
            continue

    return missing_sequels
