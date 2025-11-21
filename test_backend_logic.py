import asyncio
import sys
import os
import argparse
from pathlib import Path

# Add backend directory to path to import modules
backend_path = Path(__file__).parent / "backend"
sys.path.append(str(backend_path))

from app.services.sequel_finder import find_missing_sequels  # type: ignore
from app.services.anilist_client import AniListClient  # type: ignore

async def main():
    parser = argparse.ArgumentParser(description="Test Backend Logic & Add Sequels")
    parser.add_argument("username", help="AniList username")
    parser.add_argument("--token", help="AniList access token (Bearer) for adding anime")
    parser.add_argument("--autopush", action="store_true", help="Automatically add found sequels to PLANNING")
    
    args = parser.parse_args()
    username = args.username

    print("--- Real Test of New Sequel Logic (Backend) ---")
    print(f"\n🔍 Searching missing sequels for '{username}'...")
    print("This may take a few seconds (fetching COMPLETED, WATCHING and PLANNING lists + Deep Search)...")
    
    try:
        # Execute real backend function
        # Pass token if available to use authenticated client (higher rate limits)
        results = await find_missing_sequels(username, access_token=args.token)
        
        if not results:
            print("\n✅ No missing sequels found! You are up to date.")
        else:
            print(f"\n⚠️ Found {len(results)} missing sequels:\n")
            
            # Group by depth for better visualization
            depth_1 = [r for r in results if r.get('depth') == 1]
            depth_deep = [r for r in results if r.get('depth') != 1]
            
            if depth_1:
                print("--- Immediate Sequels (Depth 1) ---")
                for r in depth_1:
                    print(f"• {r['base_title']} -> {r['missing_title']} (ID: {r['missing_id']}) [{r['format']}]")
            
            if depth_deep:
                print("\n--- Chained Sequels (Deep Search) ---")
                for r in depth_deep:
                    print(f"• ... -> {r['base_title']} -> {r['missing_title']} (ID: {r['missing_id']}) [Depth: {r['depth']}]")
            
            # Autopush Logic
            if args.autopush:
                if not args.token:
                    print("\n❌ --autopush requires --token. Skipping add.")
                else:
                    print("\n🟦 Adding sequels to AniList (PLANNING)...")
                    client = AniListClient(access_token=args.token)
                    
                    success_count = 0
                    fail_count = 0
                    
                    for r in results:
                        media_id = r['missing_id']
                        title = r['missing_title']
                        try:
                            await asyncio.sleep(1.5) # Rate limit safety
                            await client.add_to_list(media_id, status="PLANNING")
                            print(f"  ✅ Added: {title} (ID: {media_id})")
                            success_count += 1
                        except Exception as e:
                            print(f"  ❌ Failed to add {title} (ID: {media_id}): {e}")
                            fail_count += 1
                            
                    print(f"\n📌 AUTOPUSH SUMMARY: {success_count} added, {fail_count} failed.")

    except Exception as e:
        print(f"\n❌ Execution error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Configure minimal environment variables if necessary
    if not os.getenv("ANILIST_CLIENT_ID"):
        os.environ["ANILIST_CLIENT_ID"] = "dummy"
        os.environ["ANILIST_CLIENT_SECRET"] = "dummy"
        os.environ["ANILIST_REDIRECT_URI"] = "dummy"
        os.environ["JWT_SECRET_KEY"] = "dummy"
        os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

    asyncio.run(main())
