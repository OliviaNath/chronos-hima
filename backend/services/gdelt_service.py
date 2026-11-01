import httpx

async def fetch_gdelt_alerts(query: str = "Himalaya flash flood landslide") -> list:
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={query}&mode=artlist&maxrecords=5&format=json"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("articles", [])
    except Exception:
        pass
    return [{"title": "Regional Cloudburst Vigilance Active", "url": "https://gdeltproject.org"}]
